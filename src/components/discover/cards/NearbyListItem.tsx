import { MapPin, Users, Volume2, ChevronRight, Flame } from 'lucide-react';
import { Venue } from '@/types/venue';

interface NearbyListItemProps {
  venue: Venue;
  onClick: () => void;
}

function getVibeString(vibe: Venue['vibe']): string {
  if (typeof vibe === 'string') {
    return vibe || 'Moderate';
  }
  const soundMap = { quiet: 'Quiet', moderate: 'Moderate', loud: 'Loud', very_loud: 'Very Loud' };
  return soundMap[vibe?.sound_level] || 'Moderate';
}

const categoryLabels: Record<string, { emoji: string; label: string }> = {
  bar: { emoji: '🍺', label: 'Bar' },
  nightclub: { emoji: '🪩', label: 'Nightclub' },
  restaurant: { emoji: '🍽️', label: 'Restaurant' },
  coffee: { emoji: '☕', label: 'Coffee Shop' },
  entertainment: { emoji: '🎭', label: 'Entertainment' },
  brewery: { emoji: '🍻', label: 'Brewery' },
  lounge: { emoji: '🍸', label: 'Lounge' },
  sports_bar: { emoji: '🏈', label: 'Sports Bar' },
  live_music: { emoji: '🎵', label: 'Live Music' },
};

export function NearbyListItem({ venue, onClick }: NearbyListItemProps) {
  const vibeInfo = getVibeString(venue.vibe);
  const distance = venue.distance ? `${venue.distance.toFixed(1)} mi` : '0.5 mi';
  const categoryInfo = categoryLabels[venue.category] || { emoji: '📍', label: venue.category };
  const reactionCount = venue.reactions.lit + venue.reactions.vibe + venue.reactions.curious;
  const isHot = venue.hot_streak !== 'quiet' && venue.hot_streak !== 'active';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 rounded-2xl bg-card/50 border border-border/30 hover:bg-card hover:border-primary/30 transition-all group text-left"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-secondary to-card flex-shrink-0 relative overflow-hidden">
        {isHot && (
          <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-accent">
            <Flame className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {venue.name}
          </h3>
          <span className="text-sm text-muted-foreground flex-shrink-0">{distance}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 mb-1.5">
          <span>{categoryInfo.emoji}</span>
          <span>{categoryInfo.label}</span>
          {reactionCount > 0 && (
            <>
              <span>•</span>
              <span className="text-accent">🔥 {reactionCount} reactions</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {venue.current_crowd_count} people
          </span>
          <span className="flex items-center gap-1">
            <Volume2 className="w-3 h-3" />
            {vibeInfo}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
    </button>
  );
}
