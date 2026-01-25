import { Flame, TrendingUp, Zap, Star, Users, MapPin, Volume2, Sparkles } from 'lucide-react';
import { Venue } from '@/types/venue';
import { cn } from '@/lib/utils';
import { useEnhancedAddress } from '@/utils/geocoding';

interface TrendingCardProps {
  venue: Venue;
  onClick: () => void;
  variant?: 'featured' | 'compact';
}

const hotStreakConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  hottest_spot: { 
    icon: <Star className="w-3.5 h-3.5" />, 
    label: 'HOTTEST', 
    color: '#F59E0B' // orange
  },
  on_fire: { 
    icon: <Flame className="w-3.5 h-3.5" />, 
    label: 'ON FIRE', 
    color: '#A855F7' // purple
  },
  popping_off: { 
    icon: <Zap className="w-3.5 h-3.5" />, 
    label: 'POPPING', 
    color: '#EC4899' // pink
  },
  rising_star: { 
    icon: <TrendingUp className="w-3.5 h-3.5" />, 
    label: 'RISING', 
    color: '#3B82F6' // blue
  },
};

function getVibeString(vibe: Venue['vibe']): { sound: string; energy: string } {
  if (typeof vibe === 'string') {
    return { sound: 'Moderate', energy: vibe || 'Lively' };
  }
  const soundMap = { quiet: 'Quiet', moderate: 'Moderate', loud: 'Loud', very_loud: 'Very Loud' };
  const energyMap = { chill: 'Chill', lively: 'Lively', electric: 'Electric' };
  return {
    sound: soundMap[vibe?.sound_level] || 'Moderate',
    energy: energyMap[vibe?.energy] || 'Lively'
  };
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
  bar_grill: { emoji: '🍔', label: 'Bar & Grill' },
  events: { emoji: '🎟️', label: 'Events' },
  sports_venue: { emoji: '🏟️', label: 'Sports Venue' },
  venue: { emoji: '📍', label: 'Venue' },
};

export function TrendingCard({ venue, onClick, variant = 'compact' }: TrendingCardProps) {
  const config = hotStreakConfig[venue.hot_streak];
  const vibeInfo = getVibeString(venue.vibe);
  const reactionCount = venue.reactions.lit + venue.reactions.vibe + venue.reactions.curious;
  const distance = venue.distance ? `${venue.distance.toFixed(1)} mi` : '0.5 mi';
  const categoryInfo = categoryLabels[venue.category] || categoryLabels.venue;
  
  // Enhanced address with city/state
  const { fullAddress } = useEnhancedAddress(
    venue.address || '',
    venue.latitude,
    venue.longitude
  );

  if (variant === 'featured') {
    return (
      <button
        onClick={onClick}
        className="w-full text-left group"
      >
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/30 h-[180px]">
          {/* Background gradient placeholder for image */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-secondary" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Hot streak badge */}
          {config && (
            <div 
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: config.color }}
            >
              {config.icon}
              {config.label}
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {venue.name}
            </h3>
            
            <div className="flex items-center flex-wrap gap-1.5 text-white/70 text-sm mb-2">
              <span>{categoryInfo.emoji}</span>
              <span>{categoryInfo.label}</span>
              <span>•</span>
              <span>{distance}</span>
              <span>•</span>
              <span className="truncate max-w-[130px]">{fullAddress || venue.address || 'Loading...'}</span>
            </div>

            <div className="flex items-center gap-3 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {venue.current_crowd_count} people
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {reactionCount} reactions
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                {vibeInfo.sound}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {vibeInfo.energy}
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Compact card (280x320 as specified)
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
          
          {/* Badge */}
          {config && (
            <div 
              className="absolute top-3 right-3 px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-white shadow-lg"
              style={{ backgroundColor: config.color }}
            >
              {config.icon}
            </div>
          )}
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
            <span>•</span>
            <span className="truncate max-w-[100px]">{fullAddress || venue.address || 'Loading...'}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {venue.current_crowd_count} people
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {reactionCount} reactions
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              {vibeInfo.sound}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {vibeInfo.energy}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
