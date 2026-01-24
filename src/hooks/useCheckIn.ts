import { useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserLocation } from './useUserLocation';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Check-in validation constants
const MAX_GEOFENCE_DISTANCE = 30; // meters
const MIN_LOCATION_ACCURACY = 50; // max acceptable GPS accuracy in meters
const COOLDOWN_MINUTES = 15;

interface CheckInState {
  isLoading: boolean;
  canCheckIn: boolean;
  reason: string | null;
  distance: number | null;
  confidence: number | null;
}

interface CheckInResult {
  success: boolean;
  error?: string;
  code?: string;
  checkin_id?: string;
  confidence?: number;
  distance?: number;
}

interface VenueLocation {
  latitude: number;
  longitude: number;
}

// Haversine formula for distance calculation (in meters)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
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

// Calculate confidence score (0.0 to 1.0) based on location data
function calculateConfidence(
  distance: number,
  accuracy: number | null
): number {
  // Base confidence from distance (closer = higher)
  let confidence = Math.max(0, 1.0 - distance / MAX_GEOFENCE_DISTANCE);
  
  // Reduce confidence if GPS accuracy is poor
  if (accuracy !== null) {
    if (accuracy > 30) {
      confidence *= 0.5; // Very poor accuracy
    } else if (accuracy > 20) {
      confidence *= 0.7;
    } else if (accuracy > 10) {
      confidence *= 0.85;
    }
  }
  
  return Math.round(confidence * 100) / 100;
}

export function useCheckIn(venueId: string, venueName: string, venueLocation: VenueLocation | null) {
  const { coords, isLoading: locationLoading } = useUserLocation();
  const { user } = useAuth();
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  
  // Validate check-in eligibility
  const checkInState = useMemo((): CheckInState => {
    // No venue location data
    if (!venueLocation) {
      return {
        isLoading: locationLoading,
        canCheckIn: false,
        reason: 'Venue location unavailable',
        distance: null,
        confidence: null,
      };
    }
    
    // Still loading user location
    if (locationLoading || !coords) {
      return {
        isLoading: true,
        canCheckIn: false,
        reason: 'Getting your location...',
        distance: null,
        confidence: null,
      };
    }
    
    // Not authenticated
    if (!user) {
      return {
        isLoading: false,
        canCheckIn: false,
        reason: 'Sign in to check in',
        distance: null,
        confidence: null,
      };
    }
    
    // Calculate distance
    const distance = calculateDistance(
      coords.lat,
      coords.lng,
      venueLocation.latitude,
      venueLocation.longitude
    );
    
    // Too far from venue
    if (distance > MAX_GEOFENCE_DISTANCE) {
      return {
        isLoading: false,
        canCheckIn: false,
        reason: 'You need to be inside this location to check in',
        distance: Math.round(distance),
        confidence: 0,
      };
    }
    
    // Calculate confidence
    const confidence = calculateConfidence(distance, null); // We don't have accuracy from the context
    
    // Good to go!
    return {
      isLoading: false,
      canCheckIn: true,
      reason: null,
      distance: Math.round(distance),
      confidence,
    };
  }, [coords, locationLoading, user, venueLocation]);
  
  // Perform check-in with server validation
  const performCheckIn = useCallback(async (): Promise<CheckInResult> => {
    if (!checkInState.canCheckIn || !coords || !venueLocation || !user) {
      return {
        success: false,
        error: checkInState.reason || 'Cannot check in right now',
        code: 'VALIDATION_FAILED',
      };
    }
    
    setIsCheckingIn(true);
    
    try {
      // Call server-side validation function
      const { data, error } = await supabase.rpc('validate_and_create_checkin', {
        p_venue_id: venueId,
        p_venue_name: venueName,
        p_venue_lat: venueLocation.latitude,
        p_venue_lon: venueLocation.longitude,
        p_user_lat: coords.lat,
        p_user_lon: coords.lng,
        p_location_accuracy: null, // Could be passed if available
        p_is_automatic: false,
      });
      
      if (error) {
        console.error('Check-in RPC error:', error);
        return {
          success: false,
          error: 'Failed to check in. Please try again.',
          code: 'RPC_ERROR',
        };
      }
      
      // Parse JSON result from RPC
      const result = data as unknown as CheckInResult;
      
      if (!result || typeof result !== 'object') {
        return {
          success: false,
          error: 'Invalid response from server',
          code: 'INVALID_RESPONSE',
        };
      }
      
      if (result.success) {
        toast.success(`Checked in at ${venueName}!`);
      } else {
        // Handle specific error codes
        switch (result.code) {
          case 'COOLDOWN_ACTIVE':
            toast.error(`Please wait ${COOLDOWN_MINUTES} minutes before checking in again`);
            break;
          case 'TOO_FAR':
            toast.error('You need to be inside this location to check in');
            break;
          default:
            toast.error(result.error || 'Could not complete check-in');
        }
      }
      
      return result;
    } catch (err) {
      console.error('Check-in error:', err);
      return {
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      };
    } finally {
      setIsCheckingIn(false);
    }
  }, [checkInState.canCheckIn, coords, venueLocation, user, venueId, venueName]);
  
  return {
    ...checkInState,
    isCheckingIn,
    performCheckIn,
    maxDistance: MAX_GEOFENCE_DISTANCE,
    cooldownMinutes: COOLDOWN_MINUTES,
  };
}

// Utility function to format fuzzy timestamps (5, 10, 15, 30 min buckets)
export function formatFuzzyTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  
  if (diffMin < 5) return '5 minutes ago';
  if (diffMin < 10) return '5 minutes ago';
  if (diffMin < 15) return '10 minutes ago';
  if (diffMin < 30) return '15 minutes ago';
  if (diffMin < 60) return '30 minutes ago';
  if (diffMin < 120) return '1 hour ago';
  if (diffMin < 180) return '2 hours ago';
  
  return 'a while ago';
}
