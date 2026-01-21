import { useState, useMemo, useEffect } from 'react';
import { mockVenues } from '@/data/mockVenues';
import { LeafletMap } from './LeafletMap';
import { VenueCard } from './VenueCard';
import { FloatingSearchBar } from './FloatingSearchBar';
import { Venue, ReactionType } from '@/types/venue';

interface MapViewProps {
  searchQuery: string;
  selectedCategory: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
}

export function MapView({ searchQuery, selectedCategory, onSearchChange, onCategoryChange }: MapViewProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();

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
    return mockVenues.filter((venue) => {
      // Filter by search query
      if (searchQuery && !venue.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by category
      if (selectedCategory !== 'all' && venue.category !== selectedCategory) {
        return false;
      }

      // Only show social places
      if (venue.place_type !== 'social') {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

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

  return (
    <div className="relative w-full h-full">
      {/* Floating Search & Filters */}
      <FloatingSearchBar
        searchValue={searchQuery}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />

      {/* Full-bleed Map with MapTiler dark tiles */}
      <LeafletMap
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
