import { Venue, ReactionType } from '@/types/venue';
import { VenuePopup } from './VenuePopup';

interface VenueOverlayProps {
  venue: Venue | null;
  onClose: () => void;
  onReact: (type: ReactionType) => void;
  onCheckIn: () => void;
  onChat: () => void;
  onNavigate: () => void;
  userCoords?: { lat: number; lng: number } | null;
  isAuthenticated: boolean;
}

export function VenueOverlay({
  venue,
  onClose,
  onReact,
  onCheckIn,
  onChat,
  onNavigate,
  userCoords,
  isAuthenticated,
}: VenueOverlayProps) {
  if (!venue) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000]">
      {/* Backdrop - closes on click */}
      <div
        className="absolute inset-0 bg-black/40 pointer-events-auto"
        onClick={onClose}
      />

      {/* Venue Card - Centered with animations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 bg-card rounded-2xl border border-border shadow-2xl p-4">
          <VenuePopup
            venue={venue}
            onClose={onClose}
            onReact={onReact}
            onCheckIn={onCheckIn}
            onChat={onChat}
            onNavigate={onNavigate}
            userCoords={userCoords}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}
