import { Venue, ReactionType } from '@/types/venue';
import { X, MapPin, Users, Volume2, Zap, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VenueCardProps {
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

export function VenueCard({ venue, onClose, onReact, onCheckIn, onNavigate }: VenueCardProps) {
  const badge = hotStreakBadge[venue.hot_streak];
  
  // Handle both object vibe (expected) and string vibe (from external DB)
  const vibeData = typeof venue.vibe === 'string' 
    ? { sound_level: venue.vibe.toLowerCase() as keyof typeof soundLevelIcons, energy: 'lively' as const }
    : venue.vibe;
  const soundLevel = soundLevelIcons[vibeData.sound_level] || soundLevelIcons.moderate;
  
  return (
    <div className="glass-strong rounded-3xl p-5 animate-slide-up max-w-sm w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-1">{venue.name}</h2>
          <p className="text-sm text-muted-foreground capitalize">
            {venue.category.replace('_', ' ')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      
      {/* Hot Streak Badge */}
      {badge && (
        <div className={cn('inline-block px-3 py-1.5 rounded-full text-sm font-bold mb-4', badge.class)}>
          {badge.label}
        </div>
      )}
      
      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="font-medium text-foreground">{venue.current_crowd_count}+</span>
          <span>here now</span>
        </div>
        
        {venue.distance && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{venue.distance} mi</span>
          </div>
        )}
      </div>
      
      {/* Vibe Meters */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Sound Level */}
        <div className="bg-secondary/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sound</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={cn(
                  'w-2 rounded-full transition-all',
                  bar <= soundLevel.bars ? 'bg-primary h-4' : 'bg-muted h-2'
                )}
              />
            ))}
            <span className="ml-2 text-sm font-medium">{soundLevel.label}</span>
          </div>
        </div>
        
        {/* Energy */}
        <div className="bg-secondary/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Energy</span>
          </div>
          <span className="text-sm font-medium">{energyLabels[vibeData.energy] || '🎉 Lively'}</span>
        </div>
      </div>
      
      {/* Reactions */}
      <div className="mb-5">
        <p className="text-xs text-muted-foreground mb-2">Recent reactions</p>
        <div className="flex gap-2">
          {reactions.map(({ type, emoji, label }) => (
            <button
              key={type}
              onClick={() => onReact(type)}
              className="reaction-btn flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-xs text-muted-foreground">
                {venue.reactions[type]}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCheckIn}
          className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity glow-primary"
        >
          Check In
        </button>
        <button
          onClick={onNavigate}
          className="p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
          aria-label="Navigate"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
