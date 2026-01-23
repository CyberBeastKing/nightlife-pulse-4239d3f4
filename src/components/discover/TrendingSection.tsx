import { Flame, TrendingUp, Zap, Star } from 'lucide-react';
import { Venue } from '@/types/venue';
import { cn } from '@/lib/utils';

interface TrendingSectionProps {
  venues: Venue[];
  onVenueClick: (venue: Venue) => void;
}

const hotStreakConfig: Record<string, { icon: React.ReactNode; label: string; gradient: string }> = {
  hottest_spot: { 
    icon: <Star className="w-4 h-4" />, 
    label: 'HOTTEST', 
    gradient: 'from-yellow-500 to-orange-500' 
  },
  on_fire: { 
    icon: <Flame className="w-4 h-4" />, 
    label: 'ON FIRE', 
    gradient: 'from-orange-500 to-red-500' 
  },
  popping_off: { 
    icon: <Zap className="w-4 h-4" />, 
    label: 'POPPING', 
    gradient: 'from-purple-500 to-pink-500' 
  },
  rising_star: { 
    icon: <TrendingUp className="w-4 h-4" />, 
    label: 'RISING', 
    gradient: 'from-blue-500 to-cyan-500' 
  },
};

export function TrendingSection({ venues, onVenueClick }: TrendingSectionProps) {
  // Get the hottest venues (prioritize by hot_streak level)
  const trendingVenues = venues
    .filter(v => v.hot_streak !== 'quiet' && v.hot_streak !== 'active')
    .slice(0, 5);

  // If no trending venues, show venues with highest crowd count
  const displayVenues = trendingVenues.length > 0 
    ? trendingVenues 
    : venues.slice().sort((a, b) => b.current_crowd_count - a.current_crowd_count).slice(0, 5);

  if (displayVenues.length === 0) return null;

  const featuredVenue = displayVenues[0];
  const otherVenues = displayVenues.slice(1);

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

      {/* Featured Card */}
      <button
        onClick={() => onVenueClick(featuredVenue)}
        className="w-full px-4 mb-3 text-left"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-card h-48 group">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Animated glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse" />
          </div>

          {/* Hot streak badge */}
          {hotStreakConfig[featuredVenue.hot_streak] && (
            <div className={cn(
              'absolute top-3 left-3 px-3 py-1.5 rounded-full flex items-center gap-1.5',
              'bg-gradient-to-r text-white text-xs font-bold shadow-lg',
              hotStreakConfig[featuredVenue.hot_streak].gradient
            )}>
              {hotStreakConfig[featuredVenue.hot_streak].icon}
              {hotStreakConfig[featuredVenue.hot_streak].label}
            </div>
          )}

          {/* Crowd count */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-xs font-medium text-white">
            {featuredVenue.current_crowd_count}+ here
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
              {featuredVenue.name}
            </h3>
            <p className="text-sm text-white/70 line-clamp-1">
              {featuredVenue.address}
            </p>
          </div>
        </div>
      </button>

      {/* Other trending venues */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4">
        {otherVenues.map((venue) => (
          <button
            key={venue.id}
            onClick={() => onVenueClick(venue)}
            className="flex-shrink-0 w-36 text-left group"
          >
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-card h-24 mb-2">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {hotStreakConfig[venue.hot_streak] && (
                <div className={cn(
                  'absolute top-2 left-2 p-1.5 rounded-lg',
                  'bg-gradient-to-r text-white shadow-lg',
                  hotStreakConfig[venue.hot_streak].gradient
                )}>
                  {hotStreakConfig[venue.hot_streak].icon}
                </div>
              )}

              <div className="absolute bottom-2 right-2 text-xs text-white/80 font-medium">
                {venue.current_crowd_count}+
              </div>
            </div>
            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {venue.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
