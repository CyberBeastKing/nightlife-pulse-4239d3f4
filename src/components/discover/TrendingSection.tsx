import { Flame, MapPin } from 'lucide-react';
import { Venue } from '@/types/venue';
import { TrendingCard } from './cards/TrendingCard';

interface TrendingSectionProps {
  venues: Venue[];
  onVenueClick: (venue: Venue) => void;
}

export function TrendingSection({ venues, onVenueClick }: TrendingSectionProps) {
  // Get the hottest venues (prioritize by hot_streak level)
  const hotStreakOrder = ['hottest_spot', 'on_fire', 'popping_off', 'rising_star'];
  
  const trendingVenues = venues
    .filter(v => hotStreakOrder.includes(v.hot_streak))
    .sort((a, b) => {
      const aIdx = hotStreakOrder.indexOf(a.hot_streak);
      const bIdx = hotStreakOrder.indexOf(b.hot_streak);
      return aIdx - bIdx;
    })
    .slice(0, 5);

  // Fallback to venues with highest crowd count if no trending
  const displayVenues = trendingVenues.length > 0 
    ? trendingVenues 
    : venues.slice().sort((a, b) => b.current_crowd_count - a.current_crowd_count).slice(0, 5);

  if (displayVenues.length === 0) {
    return (
      <section className="mb-8 px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Trending Now</h2>
            <p className="text-xs text-muted-foreground">What's hot in your area</p>
          </div>
        </div>
        
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-card/50 border border-border/30 text-center">
          <span className="text-4xl mb-3">🔥</span>
          <h3 className="font-semibold text-foreground mb-1">Nothing trending nearby</h3>
          <p className="text-sm text-muted-foreground mb-4">Check back in a few hours!</p>
          <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Explore Map Instead
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4 px-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Trending Now</h2>
          <p className="text-xs text-muted-foreground">What's hot in your area</p>
        </div>
      </div>

      {/* Horizontal scroll of trending cards */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2">
        {displayVenues.map((venue, index) => (
          <TrendingCard
            key={venue.id}
            venue={venue}
            onClick={() => onVenueClick(venue)}
            variant={index === 0 ? 'featured' : 'compact'}
          />
        ))}
      </div>
    </section>
  );
}
