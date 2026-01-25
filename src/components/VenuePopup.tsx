import { useState } from 'react';
import { Venue, ReactionType } from '@/types/venue';
import { X, Users, Volume2, Zap, Navigation, MessageCircle, MapPin, Loader2, Flag, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnhancedAddress } from '@/utils/geocoding';
import { getCategoryStyle } from '@/utils/categoryStyles';
import { normalizeVibeData, SOUND_LEVEL_LABELS, ENERGY_LABELS } from '@/utils/vibeUtils';
import { ReportIssueSheet } from '@/components/venue/ReportIssueSheet';
import { AddPhotosSheet } from '@/components/venue/AddPhotosSheet';

interface VenuePopupProps {
  venue: Venue;
  onClose: () => void;
  onReact: (type: ReactionType) => void;
  onCheckIn: () => void;
  onChat: () => void;
  onNavigate: () => void;
  // Location data passed from parent (since we can't use hooks in portal)
  userCoords?: { lat: number; lng: number } | null;
  isAuthenticated?: boolean;
}

const hotStreakBadge: Record<string, { label: string; class: string }> = {
  hottest_spot: { label: '🌟 HOTTEST SPOT', class: 'bg-marker-hottest text-black' },
  on_fire: { label: '🔥 ON FIRE', class: 'bg-marker-fire text-white' },
  popping_off: { label: '⚡ POPPING OFF', class: 'bg-marker-popping text-white' },
  rising_star: { label: '⭐ RISING STAR', class: 'bg-marker-rising text-white' },
};

const soundLevelIcons = {
  quiet: { bars: 1 },
  moderate: { bars: 2 },
  loud: { bars: 3 },
  very_loud: { bars: 4 },
};

const energyEmojis = {
  chill: '😌',
  lively: '🎉',
  electric: '⚡',
};

const reactions: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'lit', emoji: '🔥', label: 'LIT' },
  { type: 'vibe', emoji: '🎉', label: 'VIBE' },
  { type: 'curious', emoji: '👀', label: 'CURIOUS' },
  { type: 'dead', emoji: '💀', label: 'DEAD' },
];

// Constants for check-in validation
const MAX_GEOFENCE_DISTANCE = 30; // meters

// Haversine formula for distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function VenuePopup({ 
  venue, 
  onClose, 
  onReact, 
  onCheckIn, 
  onChat, 
  onNavigate,
  userCoords,
  isAuthenticated = false,
}: VenuePopupProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [showPhotosSheet, setShowPhotosSheet] = useState(false);
  
  // Enhanced address with city/state from reverse geocoding
  const { fullAddress } = useEnhancedAddress(
    venue.address || 'Address unavailable',
    venue.latitude,
    venue.longitude
  );
  
  const badge = hotStreakBadge[venue.hot_streak];
  const categoryStyle = getCategoryStyle(venue.category);
  
  // Use shared vibe normalization
  const vibeData = normalizeVibeData(venue.vibe);
  const soundLevel = soundLevelIcons[vibeData.sound_level] || soundLevelIcons.moderate;
  
  // Crowd count display logic - protect small venues
  const getCrowdDisplay = (count: number) => {
    if (count === 0) return '0+';
    if (count < 5) return '0+';
    return `${count}+`;
  };
  
  // Calculate check-in eligibility without hooks
  const venueLocation = venue.latitude && venue.longitude 
    ? { latitude: venue.latitude, longitude: venue.longitude }
    : null;
  
  let canCheckIn = false;
  let checkInReason: string | null = null;
  let distance: number | null = null;
  
  if (!venueLocation) {
    checkInReason = 'Venue location unavailable';
  } else if (!userCoords) {
    checkInReason = 'Getting your location...';
  } else if (!isAuthenticated) {
    checkInReason = 'Sign in to check in';
  } else {
    distance = calculateDistance(
      userCoords.lat,
      userCoords.lng,
      venueLocation.latitude,
      venueLocation.longitude
    );
    
    if (distance > MAX_GEOFENCE_DISTANCE) {
      checkInReason = 'You need to be inside this location to check in';
    } else {
      canCheckIn = true;
    }
  }
  
  const handleCheckIn = async () => {
    if (!canCheckIn) return;
    setIsCheckingIn(true);
    try {
      onCheckIn();
    } finally {
      setIsCheckingIn(false);
    }
  };
  
  const isCheckInDisabled = !canCheckIn || isCheckingIn;
  
  return (
    <>
      <div className="w-[280px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">{venue.name}</h2>
            <p className="text-xs text-muted-foreground truncate">
              {fullAddress}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {/* Report Issue Button */}
            <button
              onClick={() => setShowReportSheet(true)}
              className="p-1.5 rounded-full hover:bg-amber-500/20 transition-colors"
              aria-label="Report issue"
              title="Report an issue"
            >
              <Flag className="w-4 h-4 text-amber-500" />
            </button>
            {/* Add Photos Button */}
            <button
              onClick={() => setShowPhotosSheet(true)}
              className="p-1.5 rounded-full hover:bg-primary/20 transition-colors"
              aria-label="Add photos"
              title="Add photos"
            >
              <Camera className="w-4 h-4 text-primary" />
            </button>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-secondary/50 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      
      {/* Category Badge */}
      <div 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3"
        style={{ 
          backgroundColor: `${categoryStyle.color}20`,
          color: categoryStyle.color,
          border: `1px solid ${categoryStyle.color}40`
        }}
      >
        <span>{categoryStyle.emoji}</span>
        <span>{categoryStyle.label}</span>
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
            <span className="ml-1.5 text-xs font-medium">{SOUND_LEVEL_LABELS[vibeData.sound_level]}</span>
          </div>
        </div>
        
        {/* Energy */}
        <div className="bg-secondary/50 rounded-lg p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Energy</span>
          </div>
          <span className="text-xs font-medium">{energyEmojis[vibeData.energy]} {ENERGY_LABELS[vibeData.energy]}</span>
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
                {venue.reactions?.[type] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Check-in validation message */}
      {!canCheckIn && checkInReason && (
        <div className="flex items-center gap-2 p-2 mb-3 bg-secondary/30 rounded-lg">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {checkInReason}
            {distance !== null && distance > MAX_GEOFENCE_DISTANCE && (
              <span className="block text-[10px] mt-0.5">
                You're {Math.round(distance)}m away (max {MAX_GEOFENCE_DISTANCE}m)
              </span>
            )}
          </p>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCheckIn}
          disabled={isCheckInDisabled}
          className={cn(
            "flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2",
            canCheckIn
              ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          )}
        >
          {isCheckingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking In...
            </>
          ) : (
            'Check In'
          )}
        </button>
        <button
          onClick={onChat}
          className="p-2 bg-[#22C55E] text-white rounded-lg hover:bg-[#16A34A] transition-colors"
          aria-label="Open chat"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={onNavigate}
          className="p-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors"
          aria-label="Navigate"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>
    </div>

    {/* Report Issue Sheet */}
    <ReportIssueSheet
      venue={venue}
      isOpen={showReportSheet}
      onClose={() => setShowReportSheet(false)}
    />

    {/* Add Photos Sheet */}
    <AddPhotosSheet
      venue={venue}
      isOpen={showPhotosSheet}
      onClose={() => setShowPhotosSheet(false)}
    />
  </>
  );
}
