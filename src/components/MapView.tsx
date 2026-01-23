import { useState, useMemo, useEffect, useRef } from 'react';
import { mockVenues } from '@/data/mockVenues';
import { LeafletMap, LeafletMapRef } from './LeafletMap';
import { VenueCard } from './VenueCard';
import { FloatingSearchBar } from './FloatingSearchBar';
import { Venue, ReactionType } from '@/types/venue';
import { useExternalVenues } from '@/hooks/useExternalVenues';

interface MapViewProps {
  searchQuery: string;
  selectedCategories: Set<string>;
  onSearchChange: (value: string) => void;
  onCategoryToggle: (categoryId: string) => void;
}

export function MapView({ searchQuery, selectedCategories, onSearchChange, onCategoryToggle }: MapViewProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const mapRef = useRef<LeafletMapRef>(null);
  
  // Fetch venues from external Supabase, fallback to mock data
  const { data: externalVenues, isLoading, error } = useExternalVenues();
  const venues = externalVenues && externalVenues.length > 0 ? externalVenues : mockVenues;

  if (error) {
    console.warn('Using mock data - external fetch failed:', error);
  }

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default to Cuyahoga Falls if geolocation fails
          setUserLocation({ lat: 41.1339, lng: -81.4846 });
        }
      );
    } else {
      setUserLocation({ lat: 41.1339, lng: -81.4846 });
    }
  }, []);

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      // Filter by search query
      if (searchQuery && !venue.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by selected categories (if any are selected)
      // Note: External DB venues may all have 'bar' category - if only 'bar' is selected,
      // show all venues since they default to 'bar'
      if (selectedCategories.size > 0) {
        // If bar is the only selected category and venue is 'bar', allow it
        // This covers the case where external DB doesn't have proper categories yet
        const hasMatch = selectedCategories.has(venue.category);
        if (!hasMatch) {
          return false;
        }
      }

      // Only show social places
      if (venue.place_type !== 'social') {
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
        onVenueSelect={handleVenueSelectFromSearch}
      />

      {/* Full-bleed Map with MapTiler dark tiles */}
      <LeafletMap
        ref={mapRef}
        venues={filteredVenues}
        selectedVenue={selectedVenue}
        onVenueSelect={setSelectedVenue}
        userLocation={userLocation}
      />

      {/* Venue Card Popup */}
      {selectedVenue && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1001] w-full max-w-sm px-4">
          <VenueCard
            venue={selectedVenue}
            onClose={() => setSelectedVenue(null)}
            onReact={handleReact}
            onCheckIn={handleCheckIn}
            onNavigate={handleNavigate}
          />
        </div>
      )}
    </div>
  );
}