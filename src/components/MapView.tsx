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
      // Filter by search query
      if (searchQuery && !venue.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Only show social places
      if (venue.place_type !== 'social') {
        return false;
      }

      // Filter by selected categories - if none selected, show nothing
      // If categories are selected, only show venues matching those categories
      if (selectedCategories.size === 0) {
        return false; // No categories selected = no markers shown
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
    setSelectedVenue(venue);
    // Fly to the venue location
    mapRef.current?.flyTo(venue.latitude, venue.longitude, 16);
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