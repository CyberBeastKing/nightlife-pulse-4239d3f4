import { useState } from 'react';
import { useExternalVenues } from '@/hooks/useExternalVenues';
import { mockVenues, categories as fallbackCategories } from '@/data/mockVenues';
import { DiscoverHeader } from './DiscoverHeader';
import { TrendingSection } from './TrendingSection';
import { EventsSection } from './EventsSection';
import { FriendsSection } from './FriendsSection';
import { RecommendedSection } from './RecommendedSection';
import { NearbySection } from './NearbySection';
import { FilterModal, DiscoverFilters, defaultFilters } from './FilterModal';
import { Venue } from '@/types/venue';
import { toast } from 'sonner';

interface DiscoverViewProps {
  onNavigateToMap?: (venue: Venue) => void;
}

export function DiscoverView({ onNavigateToMap }: DiscoverViewProps) {
  const { data: externalData, isLoading } = useExternalVenues();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<DiscoverFilters>(defaultFilters);
  
  const venues = externalData?.venues && externalData.venues.length > 0 
    ? externalData.venues 
    : mockVenues;
  const categories = externalData?.categories && externalData.categories.length > 0 
    ? externalData.categories 
    : fallbackCategories;

  const handleVenueClick = (venue: Venue) => {
    if (onNavigateToMap) {
      onNavigateToMap(venue);
    } else {
      toast.info(`Viewing ${venue.name}`);
    }
  };

  const handleVenueIdClick = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    if (venue) {
      handleVenueClick(venue);
    } else {
      toast.info(`Navigating to venue...`);
    }
  };

  const handleEventClick = (eventId: string) => {
    toast.info(`Event details - Coming soon!`);
  };

  const handleSearchClick = () => {
    toast.info('Search - Coming soon!');
  };

  const handleFilterClick = () => {
    setFilterOpen(true);
  };

  const handleApplyFilters = (newFilters: DiscoverFilters) => {
    setFilters(newFilters);
    toast.success('Filters applied');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading discoveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <DiscoverHeader 
        onSearchClick={handleSearchClick} 
        onFilterClick={handleFilterClick}
      />
      
      <main className="pb-24">
        {/* Section 1: Trending Now */}
        <div className="pt-6">
          <TrendingSection 
            venues={venues} 
            onVenueClick={handleVenueClick} 
          />
        </div>

        {/* Section 2: Tonight's Events */}
        <EventsSection onEventClick={handleEventClick} />

        {/* Section 3: Where Your Friends Are */}
        <FriendsSection onVenueClick={handleVenueIdClick} />

        {/* Section 4: Recommended For You */}
        <RecommendedSection 
          venues={venues}
          onVenueClick={handleVenueClick}
        />

        {/* Section 5: Near You (<2 miles) */}
        <NearbySection 
          venues={venues}
          onVenueClick={handleVenueClick}
        />
      </main>

      {/* Filter Modal */}
      <FilterModal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
