import { MapPin, Users, Volume2, Star } from 'lucide-react';
import { Venue } from '@/types/venue';
import { useEnhancedAddress } from '@/utils/geocoding';
import { getCategoryStyle } from '@/utils/categoryStyles';
import { getVibeString } from '@/utils/vibeUtils';

interface RecommendedCardProps {
  venue: Venue;
  matchScore: number;
  reason?: string;
  onClick: () => void;
}

export function RecommendedCard({ venue, matchScore, reason, onClick }: RecommendedCardProps) {
  const vibeInfo = getVibeString(venue.vibe);
  const distance = venue.distance ? `${venue.distance.toFixed(1)} mi` : '0.5 mi';
  
  // Enhanced address with city/state
  const { fullAddress } = useEnhancedAddress(
    venue.address || '',
    venue.latitude,
    venue.longitude
  );
  
  // Get category info from shared styles
  const categoryInfo = getCategoryStyle(venue.category);

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
            <span className="truncate max-w-[140px]">{fullAddress || venue.address || 'Loading...'}</span>
            <span>•</span>
            <span>{distance}</span>
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
