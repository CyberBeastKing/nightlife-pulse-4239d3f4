import { useExternalVenues } from '@/hooks/useExternalVenues';
import { mockVenues, categories as fallbackCategories } from '@/data/mockVenues';
import { DiscoverHeader } from './DiscoverHeader';
import { TrendingSection } from './TrendingSection';
import { CuratedListsSection } from './CuratedListsSection';
import { ForYouSection } from './ForYouSection';
import { EventsSection } from './EventsSection';
import { Venue } from '@/types/venue';
import { toast } from 'sonner';

interface DiscoverViewProps {
  onNavigateToMap?: (venue: Venue) => void;
}

export function DiscoverView({ onNavigateToMap }: DiscoverViewProps) {
  const { data: externalData, isLoading } = useExternalVenues();
  
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

  const handleListClick = (listId: string) => {
    toast.info(`Opening ${listId} collection - Coming soon!`);
  };

  const handleEventClick = (eventId: string) => {
    toast.info(`Event details - Coming soon!`);
  };

  const handleSearchClick = () => {
    toast.info('Search - Coming soon!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading discoveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <DiscoverHeader onSearchClick={handleSearchClick} />
      
      <main className="pb-24">
        {/* Trending venues section */}
        <div className="pt-6">
          <TrendingSection 
            venues={venues} 
            onVenueClick={handleVenueClick} 
          />
        </div>

        {/* Events section */}
        <EventsSection onEventClick={handleEventClick} />

        {/* Curated lists grid */}
        <CuratedListsSection onListClick={handleListClick} />

        {/* Personalized recommendations */}
        <ForYouSection 
          venues={venues}
          categories={categories}
          onVenueClick={handleVenueClick}
        />
      </main>
    </div>
  );
}
