import { MapPin, Users, Volume2, Star } from 'lucide-react';
import { Venue } from '@/types/venue';
import { useEnhancedAddress } from '@/utils/geocoding';

interface RecommendedCardProps {
  venue: Venue;
  matchScore: number;
  reason?: string;
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

export function RecommendedCard({ venue, matchScore, reason, onClick }: RecommendedCardProps) {
  const vibeInfo = getVibeString(venue.vibe);
  const distance = venue.distance ? `${venue.distance.toFixed(1)} mi` : '0.5 mi';
  const categoryInfo = categoryLabels[venue.category] || { emoji: '📍', label: venue.category };
  
  // Enhanced address with city/state
  const { fullAddress } = useEnhancedAddress(
    venue.address || '',
    venue.latitude,
    venue.longitude
  );

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[280px] text-left group"
    >
      <div className="overflow-hidden rounded-2xl bg-card border border-border/30 hover:border-primary/50 transition-all hover:scale-[1.02]">
        {/* Image area */}
        <div className="relative h-[180px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-secondary" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Match score badge */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-lg bg-primary/90 backdrop-blur-sm text-white flex items-center gap-1.5 shadow-lg">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-bold">{matchScore}% MATCH</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {venue.name}
          </h3>
          
          <div className="flex items-center flex-wrap gap-1.5 text-sm text-muted-foreground mb-2">
            <span>{categoryInfo.emoji}</span>
            <span>{categoryInfo.label}</span>
            <span>•</span>
            <span>{distance}</span>
            {fullAddress && (
              <>
                <span>•</span>
                <span className="truncate max-w-[120px]">{fullAddress}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {venue.current_crowd_count} people
            </span>
            <span className="flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              {vibeInfo}
            </span>
          </div>
          
          {reason && (
            <p className="text-xs text-primary/80 italic">
              {reason}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
