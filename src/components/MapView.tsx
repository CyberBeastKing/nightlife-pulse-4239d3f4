import { useState, useMemo, useRef, useCallback } from 'react';
import { mockVenues, categories as fallbackCategories } from '@/data/mockVenues';
import { LeafletMap, LeafletMapRef, MapBounds } from './LeafletMap';
import { FloatingSearchBar } from './FloatingSearchBar';
import { VenueOverlay } from './VenueOverlay';
import { Venue, ReactionType } from '@/types/venue';
import { useViewportVenues } from '@/hooks/useViewportVenues';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useAuth } from '@/hooks/useAuth';

interface MapViewProps {
  searchQuery: string;
  selectedCategories: Set<string>;
  onSearchChange: (value: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onOpenVenueChat: (venue: Venue) => void;
}

export function MapView({ searchQuery, selectedCategories, onSearchChange, onCategoryToggle, onOpenVenueChat }: MapViewProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const mapRef = useRef<LeafletMapRef>(null);
  const { user } = useAuth();
  
  // Use shared location context
  const { coords: userLocation } = useUserLocation();
  
  // Use viewport-based venue fetching for performance
  const { data: externalData, isLoading, error, updateBounds } = useViewportVenues();
  const venues = externalData?.venues && externalData.venues.length > 0 ? externalData.venues : mockVenues;
  const categories = externalData?.categories && externalData.categories.length > 0 ? externalData.categories : fallbackCategories;

  // Handle map bounds changes
  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    updateBounds(bounds);
  }, [updateBounds]);

  if (error) {
    console.warn('Using mock data - external fetch failed:', error);
  }

  const filteredVenues = useMemo(() => {
    const filtered = venues.filter((venue) => {
      // Only show social places
      if (venue.place_type !== 'social') {
        return false;
      }

      // If there's a search query matching the venue, ALWAYS show it (bypass category filter)
      const matchesSearch = searchQuery && venue.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (matchesSearch) {
        return true;
      }

      // If there's a search query but venue doesn't match, hide it
      if (searchQuery && !matchesSearch) {
        return false;
      }

      // No search query - use category filtering
      // Filter by selected categories - if none selected, show nothing
      if (selectedCategories.size === 0) {
        return false;
      }
      
      if (!selectedCategories.has(venue.category)) {
        return false;
      }

      return true;
    });
    
    // ALWAYS include the selected venue in filtered results to ensure its marker appears
    if (selectedVenue && !filtered.some(v => v.id === selectedVenue.id)) {
      filtered.push(selectedVenue);
    }
    
    return filtered;
  }, [venues, searchQuery, selectedCategories, selectedVenue]);

  const handleReact = (type: ReactionType) => {
    console.log('Reacted with:', type);
    // TODO: Implement reaction logic
  };

  const handleCheckIn = () => {
    console.log('Checking in to:', selectedVenue?.name);
    // TODO: Implement check-in logic
  };

  const handleNavigate = () => {
    if (selectedVenue) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedVenue.latitude},${selectedVenue.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleChat = () => {
    if (selectedVenue) {
      onOpenVenueChat(selectedVenue);
    }
  };

  const handleVenueSelectFromSearch = useCallback((venue: Venue) => {
    // Set the selected venue first - this ensures it appears in filteredVenues
    setSelectedVenue(venue);
    setIsPopupOpen(true);
    
    // Clear the search to avoid filtering confusion, but keep venue selected
    onSearchChange('');
    
    // Fly to the venue location after a brief delay to allow state updates
    requestAnimationFrame(() => {
      mapRef.current?.flyTo(venue.latitude, venue.longitude, 17);
    });
  }, [onSearchChange]);

  // Handle venue selection from map marker click (also reopens popup if same venue tapped)
  const handleVenueSelectFromMap = useCallback((venue: Venue | null) => {
    if (venue) {
      setSelectedVenue(venue);
      setIsPopupOpen(true); // Always open popup when marker is tapped
    } else {
      setSelectedVenue(null);
      setIsPopupOpen(false);
    }
  }, []);

  // Close popup but keep marker visible and map focused
  const handleCloseOverlay = useCallback(() => {
    setIsPopupOpen(false);
    // Keep selectedVenue set so marker stays visible
  }, []);

  // Deselect venue completely (when clicking empty map area)
  const handleDeselectVenue = useCallback(() => {
    setSelectedVenue(null);
    setIsPopupOpen(false);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Floating Search & Filters */}
      <FloatingSearchBar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        selectedCategories={selectedCategories}
        onCategoryToggle={onCategoryToggle}
        venues={venues}
        categories={categories}
        onVenueSelect={handleVenueSelectFromSearch}
      />

      {/* Full-bleed Map with MapTiler dark tiles */}
      <LeafletMap
        ref={mapRef}
        venues={filteredVenues}
        categories={categories}
        selectedVenue={selectedVenue}
        onVenueSelect={handleVenueSelectFromMap}
        onDeselect={handleDeselectVenue}
        userLocation={userLocation || undefined}
        onBoundsChange={handleBoundsChange}
      />

      {/* React-controlled venue overlay (replaces Leaflet popup) */}
      <VenueOverlay
        venue={selectedVenue}
        isOpen={isPopupOpen}
        onClose={handleCloseOverlay}
        onReact={handleReact}
        onCheckIn={handleCheckIn}
        onChat={handleChat}
        onNavigate={handleNavigate}
        userCoords={userLocation}
        isAuthenticated={!!user}
      />
    </div>
  );
}