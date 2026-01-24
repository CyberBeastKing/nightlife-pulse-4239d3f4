import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from './useUserLocation';
import { useAuth } from './useAuth';
import { useUserSettings } from './useUserSettings';
import { toast } from 'sonner';
import { Venue } from '@/types/venue';

// Auto check-in configuration
const DWELL_TIME_MS = 150000; // 2.5 minutes (150 seconds)
const MAX_GEOFENCE_DISTANCE = 30; // meters
const MIN_CONFIDENCE = 0.7; // Minimum confidence score for auto check-in
const CHECK_INTERVAL_MS = 10000; // Check every 10 seconds

interface DwellState {
  venueId: string;
  venueName: string;
  venueLocation: { latitude: number; longitude: number };
  enteredAt: number;
  lastConfidence: number;
}

interface UndoableCheckIn {
  checkinId: string;
  venueName: string;
  createdAt: number;
}

// Haversine formula for distance calculation (in meters)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function calculateConfidence(distance: number): number {
  return Math.max(0, 1.0 - distance / MAX_GEOFENCE_DISTANCE);
}

export function useAutoCheckIn(venues: Venue[]) {
  const { coords, isLoading: locationLoading } = useUserLocation();
  const { user } = useAuth();
  const { settings } = useUserSettings();
  
  const dwellStateRef = useRef<DwellState | null>(null);
  const lastCheckInVenueRef = useRef<string | null>(null);
  const [pendingUndo, setPendingUndo] = useState<UndoableCheckIn | null>(null);

  // Undo check-in function
  const undoCheckIn = useCallback(async (checkinId: string) => {
    try {
      const { data, error } = await supabase.rpc('undo_checkin', {
        p_checkin_id: checkinId,
      });

      if (error) {
        console.error('Undo check-in error:', error);
        toast.error('Failed to undo check-in');
        return false;
      }

      const result = data as { success: boolean; error?: string };
      if (result.success) {
        toast.success('Check-in undone');
        setPendingUndo(null);
        lastCheckInVenueRef.current = null;
        return true;
      } else {
        toast.error(result.error || 'Failed to undo');
        return false;
      }
    } catch (err) {
      console.error('Undo error:', err);
      toast.error('Failed to undo check-in');
      return false;
    }
  }, []);

  // Perform automatic check-in
  const performAutoCheckIn = useCallback(async (dwellState: DwellState) => {
    if (!user || !coords) return;

    try {
      const { data, error } = await supabase.rpc('validate_and_create_checkin', {
        p_venue_id: dwellState.venueId,
        p_venue_name: dwellState.venueName,
        p_venue_lat: dwellState.venueLocation.latitude,
        p_venue_lon: dwellState.venueLocation.longitude,
        p_user_lat: coords.lat,
        p_user_lon: coords.lng,
        p_location_accuracy: null,
        p_is_automatic: true,
      });

      if (error) {
        console.error('Auto check-in RPC error:', error);
        return;
      }

      const result = data as { success: boolean; checkin_id?: string; code?: string };

      if (result.success && result.checkin_id) {
        // Track this venue to prevent duplicate check-ins
        lastCheckInVenueRef.current = dwellState.venueId;
        
        // Store for undo
        const undoState: UndoableCheckIn = {
          checkinId: result.checkin_id,
          venueName: dwellState.venueName,
          createdAt: Date.now(),
        };
        setPendingUndo(undoState);

        // Show toast with undo action
        toast.success(`Auto-checked in at ${dwellState.venueName}`, {
          duration: 10000, // 10 seconds to undo
          action: {
            label: 'Undo',
            onClick: () => undoCheckIn(result.checkin_id!),
          },
          description: 'Based on your location',
        });

        // Clear dwell state after successful check-in
        dwellStateRef.current = null;
      } else if (result.code === 'COOLDOWN_ACTIVE') {
        // Silently ignore cooldown - expected behavior
        dwellStateRef.current = null;
      }
    } catch (err) {
      console.error('Auto check-in error:', err);
    }
  }, [user, coords, undoCheckIn]);

  // Main detection loop
  useEffect(() => {
    // Skip if disabled, not authenticated, or location not available
    if (!settings.autoCheckinEnabled || !user || locationLoading || !coords) {
      return;
    }

    // Create venue lookup map with location data
    const venuesWithLocation = venues.filter(v => v.latitude && v.longitude);
    if (venuesWithLocation.length === 0) return;

    const intervalId = setInterval(() => {
      if (!coords) return;

      // Find closest venue within geofence
      let closestVenue: Venue | null = null;
      let closestDistance = Infinity;

      for (const venue of venuesWithLocation) {
        if (!venue.latitude || !venue.longitude) continue;
        
        const distance = calculateDistance(
          coords.lat,
          coords.lng,
          venue.latitude,
          venue.longitude
        );

        if (distance < MAX_GEOFENCE_DISTANCE && distance < closestDistance) {
          closestDistance = distance;
          closestVenue = venue;
        }
      }

      const confidence = closestVenue ? calculateConfidence(closestDistance) : 0;

      // If we're in a venue geofence with high confidence
      if (closestVenue && confidence >= MIN_CONFIDENCE) {
        const currentDwell = dwellStateRef.current;

        // If this is a new venue or different from current tracking
        if (!currentDwell || currentDwell.venueId !== closestVenue.id) {
          // Don't start tracking if we just checked in here
          if (lastCheckInVenueRef.current === closestVenue.id) {
            return;
          }

          // Start tracking dwell time
          dwellStateRef.current = {
            venueId: closestVenue.id,
            venueName: closestVenue.name,
            venueLocation: {
              latitude: closestVenue.latitude!,
              longitude: closestVenue.longitude!,
            },
            enteredAt: Date.now(),
            lastConfidence: confidence,
          };
        } else {
          // Update confidence for existing dwell
          currentDwell.lastConfidence = confidence;

          // Check if dwell time threshold reached
          const dwellTime = Date.now() - currentDwell.enteredAt;
          if (dwellTime >= DWELL_TIME_MS) {
            performAutoCheckIn(currentDwell);
          }
        }
      } else {
        // Not in any venue geofence - reset dwell state
        if (dwellStateRef.current) {
          dwellStateRef.current = null;
        }
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [settings.autoCheckinEnabled, user, locationLoading, coords, venues, performAutoCheckIn]);

  // Clear undo state after timeout (5 minutes)
  useEffect(() => {
    if (!pendingUndo) return;

    const timeout = setTimeout(() => {
      setPendingUndo(null);
    }, 5 * 60 * 1000);

    return () => clearTimeout(timeout);
  }, [pendingUndo]);

  return {
    isEnabled: settings.autoCheckinEnabled,
    pendingUndo,
    undoCheckIn,
  };
}
