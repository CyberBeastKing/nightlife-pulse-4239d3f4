import { useState, useMemo, useRef, useCallback } from 'react';
import { mockVenues, categories as fallbackCategories } from '@/data/mockVenues';
import { LeafletMap, LeafletMapRef, MapBounds } from './LeafletMap';
import { FloatingSearchBar } from './FloatingSearchBar';
import { Venue, ReactionType } from '@/types/venue';
import { useViewportVenues } from '@/hooks/useViewportVenues';
import { useUserLocation } from '@/hooks/useUserLocation';

interface MapViewProps {
  searchQuery: string;
  selectedCategories: Set<string>;
  onSearchChange: (value: string) => void;
  onCategoryToggle: (categoryId: string) => void;
  onOpenVenueChat: (venue: Venue) => void;
}

export function MapView({ searchQuery, selectedCategories, onSearchChange, onCategoryToggle, onOpenVenueChat }: MapViewProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const mapRef = useRef<LeafletMapRef>(null);
  
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
    return venues.filter((venue) => {
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
  }, [venues, searchQuery, selectedCategories]);

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

  const handleVenueSelectFromSearch = (venue: Venue) => {
    // Clear any category filters when searching to ensure the venue appears
    // Then select the venue and fly to it
    setSelectedVenue(venue);
    // Small delay to allow map to update before flying
    setTimeout(() => {
      mapRef.current?.flyTo(venue.latitude, venue.longitude, 17);
    }, 100);
  };

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
        onVenueSelect={setSelectedVenue}
        userLocation={userLocation || undefined}
        onReact={handleReact}
        onCheckIn={handleCheckIn}
        onChat={handleChat}
        onNavigate={handleNavigate}
        onBoundsChange={handleBoundsChange}
      />

    </div>
  );
}