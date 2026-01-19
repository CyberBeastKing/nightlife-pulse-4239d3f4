import { Venue, HotStreak } from '@/types/venue';
import { cn } from '@/lib/utils';

interface VenueMarkerProps {
  venue: Venue;
  isSelected?: boolean;
  onClick?: () => void;
}

const getMarkerSize = (hotStreak: HotStreak, crowdCount: number): number => {
  const baseSize: Record<HotStreak, number> = {
    hottest_spot: 72,
    on_fire: 60,
    popping_off: 52,
    rising_star: 48,
    active: 40,
    quiet: 32,
  };
  
  const crowdBonus = Math.min(crowdCount / 10, 8);
  return baseSize[hotStreak] + crowdBonus;
};

const getMarkerClass = (hotStreak: HotStreak): string => {
  const classes: Record<HotStreak, string> = {
    hottest_spot: 'marker-hottest',
    on_fire: 'marker-fire',
    popping_off: 'marker-popping',
    rising_star: 'marker-rising',
    active: 'marker-active',
    quiet: 'marker-quiet',
  };
  return classes[hotStreak];
};

const getStatusEmoji = (hotStreak: HotStreak): string => {
  const emojis: Record<HotStreak, string> = {
    hottest_spot: '🌟',
    on_fire: '🔥',
    popping_off: '⚡',
    rising_star: '⭐',
    active: '📍',
    quiet: '○',
  };
  return emojis[hotStreak];
};

export function VenueMarker({ venue, isSelected, onClick }: VenueMarkerProps) {
  const size = getMarkerSize(venue.hot_streak, venue.current_crowd_count);
  const markerClass = getMarkerClass(venue.hot_streak);
  const emoji = getStatusEmoji(venue.hot_streak);
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center cursor-pointer transition-transform duration-200',
        'hover:scale-125 hover:z-50',
        isSelected && 'scale-125 z-50',
        markerClass
      )}
      style={{ 
        width: size, 
        height: size,
      }}
      aria-label={`${venue.name} - ${venue.hot_streak.replace('_', ' ')}`}
    >
      <span className="text-lg select-none" style={{ fontSize: size * 0.4 }}>
        {emoji}
      </span>
      
      {/* Crowd count badge for busy venues */}
      {venue.current_crowd_count > 30 && (
        <div className="absolute -top-1 -right-1 bg-background/90 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-xs font-bold text-foreground border border-border/50">
          {venue.current_crowd_count}+
        </div>
      )}
    </button>
  );
}
