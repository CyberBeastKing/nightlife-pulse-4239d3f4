import { useState, useEffect, useRef } from 'react';
import { Venue, ReactionType } from '@/types/venue';
import { VenuePopup } from './VenuePopup';
import { cn } from '@/lib/utils';

interface VenueOverlayProps {
  venue: Venue | null;
  isOpen: boolean;
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
  isOpen,
  onClose,
  onReact,
  onCheckIn,
  onChat,
  onNavigate,
  userCoords,
  isAuthenticated,
}: VenueOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle open/close transitions
  useEffect(() => {
    if (isOpen && venue) {
      setIsVisible(true);
      setIsAnimatingOut(false);
    } else if (!isOpen && isVisible) {
      // Start close animation
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimatingOut(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, venue, isVisible]);

  if (!venue || !isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000]">
      {/* Backdrop - closes on click */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 pointer-events-auto transition-opacity duration-200",
          isAnimatingOut ? "opacity-0" : "opacity-100"
        )}
        onClick={onClose}
      />

      {/* Venue Card - Centered with animations */}
      <div 
        ref={overlayRef}
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto",
          "transition-all duration-300 ease-out",
          isAnimatingOut 
            ? "opacity-0 translate-y-[calc(-50%+20px)] scale-95" 
            : "opacity-100 scale-100"
        )}
      >
        <div className={cn(
          "bg-card rounded-2xl border border-border shadow-2xl p-4",
          !isAnimatingOut && "animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        )}>
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
