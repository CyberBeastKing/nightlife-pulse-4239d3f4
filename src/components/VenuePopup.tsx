import { Venue, ReactionType } from '@/types/venue';
import { X, Users, Volume2, Zap, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VenuePopupProps {
  venue: Venue;
  onClose: () => void;
  onReact: (type: ReactionType) => void;
  onCheckIn: () => void;
  onNavigate: () => void;
}

const hotStreakBadge: Record<string, { label: string; class: string }> = {
  hottest_spot: { label: '🌟 HOTTEST SPOT', class: 'bg-marker-hottest text-black' },
  on_fire: { label: '🔥 ON FIRE', class: 'bg-marker-fire text-white' },
  popping_off: { label: '⚡ POPPING OFF', class: 'bg-marker-popping text-white' },
  rising_star: { label: '⭐ RISING STAR', class: 'bg-marker-rising text-white' },
};

const soundLevelIcons = {
  quiet: { bars: 1, label: 'Quiet' },
  moderate: { bars: 2, label: 'Moderate' },
  loud: { bars: 3, label: 'Loud' },
  very_loud: { bars: 4, label: 'LOUD!' },
};

const energyLabels = {
  chill: '😌 Chill',
  lively: '🎉 Lively',
  electric: '⚡ Electric',
};

const reactions: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'lit', emoji: '🔥', label: 'LIT' },
  { type: 'vibe', emoji: '🎉', label: 'VIBE' },
  { type: 'curious', emoji: '👀', label: 'CURIOUS' },
  { type: 'dead', emoji: '💀', label: 'DEAD' },
];

export function VenuePopup({ venue, onClose, onReact, onCheckIn, onNavigate }: VenuePopupProps) {
  const badge = hotStreakBadge[venue.hot_streak];
  
  // Handle both object vibe (expected) and string vibe (from external DB)
  const vibeData = typeof venue.vibe === 'string' 
    ? { sound_level: venue.vibe.toLowerCase() as keyof typeof soundLevelIcons, energy: 'lively' as const }
    : venue.vibe;
  const soundLevel = soundLevelIcons[vibeData.sound_level] || soundLevelIcons.moderate;
  
  // Crowd count display logic - protect small venues
  const getCrowdDisplay = (count: number) => {
    if (count === 0) return '0+';
    if (count < 5) return '0+';
    return `${count}+`;
  };
  
  return (
    <div className="w-[280px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-foreground truncate">{venue.name}</h2>
          <p className="text-xs text-muted-foreground capitalize">
            {venue.category.replace('_', ' ')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-secondary/50 transition-colors flex-shrink-0 ml-2"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
      
      {/* Hot Streak Badge */}
      {badge && (
        <div className={cn('inline-block px-2 py-1 rounded-full text-xs font-bold mb-3', badge.class)}>
          {badge.label}
        </div>
      )}
      
      {/* Stats Row */}
      <div className="flex items-center gap-3 mb-3 text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span className="font-medium text-foreground">{getCrowdDisplay(venue.current_crowd_count)}</span>
          <span>here now</span>
        </div>
      </div>
      
      {/* Vibe Meters */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Sound Level */}
        <div className="bg-secondary/50 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Volume2 className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Sound</span>
          </div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={cn(
                  'w-1.5 rounded-full transition-all',
                  bar <= soundLevel.bars ? 'bg-primary h-3' : 'bg-muted h-1.5'
                )}
              />
            ))}
            <span className="ml-1.5 text-xs font-medium">{soundLevel.label}</span>
          </div>
        </div>
        
        {/* Energy */}
        <div className="bg-secondary/50 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Energy</span>
          </div>
          <span className="text-xs font-medium">{energyLabels[vibeData.energy] || '🎉 Lively'}</span>
        </div>
      </div>
      
      {/* Reactions */}
      <div className="mb-3">
        <p className="text-[10px] text-muted-foreground mb-1.5">Recent reactions</p>
        <div className="flex gap-1.5">
          {reactions.map(({ type, emoji }) => (
            <button
              key={type}
              onClick={() => onReact(type)}
              className="flex-1 flex flex-col items-center gap-0.5 bg-secondary/50 rounded-lg py-1.5 hover:bg-secondary/70 transition-colors"
            >
              <span className="text-base">{emoji}</span>
              <span className="text-[10px] text-muted-foreground">
                {venue.reactions[type]}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onCheckIn}
          className="flex-1 bg-primary text-primary-foreground py-2 px-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Check In
        </button>
        <button
          onClick={onNavigate}
          className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          aria-label="Navigate"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
