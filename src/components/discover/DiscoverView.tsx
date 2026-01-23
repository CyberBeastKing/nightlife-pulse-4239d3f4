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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Venue } from '@/types/venue';
import { toast } from 'sonner';
import { Flame, Star, Users, MapPin, Calendar } from 'lucide-react';

interface DiscoverViewProps {
  onNavigateToMap?: (venue: Venue) => void;
}

export function DiscoverView({ onNavigateToMap }: DiscoverViewProps) {
  const { data: externalData, isLoading } = useExternalVenues();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<DiscoverFilters>(defaultFilters);
  const [activeTab, setActiveTab] = useState('trending');
  
  const venues = externalData?.venues && externalData.venues.length > 0 
    ? externalData.venues 
    : mockVenues;
  const categories = externalData?.categories && externalData.categories.length > 0 
    ? externalData.categories 
    : fallbackCategories;

  // Calculate stats from venues
  const hotStreakOrder = ['hottest_spot', 'on_fire', 'popping_off', 'rising_star'];
  const trendingVenues = venues.filter(v => hotStreakOrder.includes(v.hot_streak));
  const trendingCount = trendingVenues.length || 4;
  const activeUsers = venues.reduce((sum, v) => sum + (v.current_crowd_count || 0), 0);
  const hottestSpot = trendingVenues.length > 0 
    ? trendingVenues[0].name 
    : venues[0]?.name || "Leo's Italian Social";

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
    <div className="h-full flex flex-col bg-background">
      <DiscoverHeader 
        onSearchClick={handleSearchClick} 
        onFilterClick={handleFilterClick}
        trendingCount={trendingCount}
        activeUsers={activeUsers}
        hottestSpot={hottestSpot}
        location="Akron, OH"
      />
      
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="flex-shrink-0 bg-background/95 backdrop-blur-xl border-b border-border/30">
          <TabsList className="w-full h-auto p-1 bg-transparent rounded-none justify-start gap-1 overflow-x-auto scrollbar-hide px-4">
            <TabsTrigger 
              value="trending" 
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground text-sm font-medium whitespace-nowrap"
            >
              <Flame className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground text-sm font-medium whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="recommended" 
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground text-sm font-medium whitespace-nowrap"
            >
              <Star className="w-4 h-4" />
              Recommended
            </TabsTrigger>
            <TabsTrigger 
              value="friends" 
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground text-sm font-medium whitespace-nowrap"
            >
              <Users className="w-4 h-4" />
              Friends
            </TabsTrigger>
            <TabsTrigger 
              value="nearby" 
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground text-sm font-medium whitespace-nowrap"
            >
              <MapPin className="w-4 h-4" />
              Nearby
            </TabsTrigger>
          </TabsList>
        </div>

        <main className="flex-1 overflow-y-auto pb-24 pt-4">
          <TabsContent value="trending" className="mt-0">
            <TrendingSection 
              venues={venues} 
              onVenueClick={handleVenueClick} 
            />
          </TabsContent>

          <TabsContent value="events" className="mt-0">
            <EventsSection onEventClick={handleEventClick} />
          </TabsContent>

          <TabsContent value="recommended" className="mt-0">
            <RecommendedSection 
              venues={venues}
              onVenueClick={handleVenueClick}
            />
          </TabsContent>

          <TabsContent value="friends" className="mt-0">
            <FriendsSection onVenueClick={handleVenueIdClick} />
          </TabsContent>

          <TabsContent value="nearby" className="mt-0">
            <NearbySection 
              venues={venues}
              onVenueClick={handleVenueClick}
            />
          </TabsContent>
        </main>
      </Tabs>

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
