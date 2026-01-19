import { useState, useMemo } from 'react';
import { mockVenues } from '@/data/mockVenues';
import { VenueMarker } from './VenueMarker';
import { UserLocationMarker } from './UserLocationMarker';
import { VenueCard } from './VenueCard';
import { Compass } from 'lucide-react';
import { Venue, ReactionType } from '@/types/venue';
import { cn } from '@/lib/utils';

interface MapViewProps {
  searchQuery: string;
  selectedCategory: string;
}

// Position markers on a simulated map grid
const getMarkerPosition = (venue: Venue, index: number) => {
  // Create a scattered layout based on coordinates
  const baseX = ((venue.longitude + 81.52) * 800) % 100;
  const baseY = ((venue.latitude - 41.08) * 800) % 100;
  
  // Add some randomization to prevent overlap
  const offsetX = (index * 7) % 15;
  const offsetY = (index * 11) % 15;
  
  return {
    left: `${Math.min(Math.max(baseX + offsetX, 10), 85)}%`,
    top: `${Math.min(Math.max(baseY + offsetY, 15), 75)}%`,
  };
};

export function MapView({ searchQuery, selectedCategory }: MapViewProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
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
  
  const handleRecenter = () => {
    console.log('Recentering to user location');
    // TODO: Implement recenter logic
  };
  
  return (
    <div className="relative flex-1 bg-map-background overflow-hidden">
      {/* Simulated Map Background */}
      <div className="absolute inset-0">
        {/* Grid lines to simulate roads */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="hsl(var(--map-roads-major))" strokeWidth="1"/>
            </pattern>
            <pattern id="grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--map-roads-minor))" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-small)"/>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
        
        {/* Ambient gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/30" />
      </div>
      
      {/* Venue Markers */}
      {filteredVenues.map((venue, index) => {
        const position = getMarkerPosition(venue, index);
        return (
          <div
            key={venue.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={position}
          >
            <VenueMarker
              venue={venue}
              isSelected={selectedVenue?.id === venue.id}
              onClick={() => setSelectedVenue(venue)}
            />
            
            {/* Venue name tooltip on hover */}
            <div className={cn(
              'absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1',
              'bg-card/90 backdrop-blur-sm rounded-lg text-xs font-medium text-foreground',
              'opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap',
              'border border-border/50'
            )}>
              {venue.name}
            </div>
          </div>
        );
      })}
      
      {/* User Location Marker (center of map) */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]">
        <UserLocationMarker />
      </div>
      
      {/* Recenter Button */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-6 right-4 z-50 glass p-3 rounded-full hover:bg-secondary/50 transition-colors"
        aria-label="Recenter map"
      >
        <Compass className="w-6 h-6 text-primary" />
      </button>
      
      {/* Venue Card Popup */}
      {selectedVenue && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-[200] px-4">
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
