import { useState, useEffect, useRef } from 'react';
import { Venue, ReactionType } from '@/types/venue';
import { VenuePopup } from './VenuePopup';
import { cn } from '@/lib/utils';
import type { LeafletMapRef } from './LeafletMap';

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
  mapRef?: React.RefObject<LeafletMapRef | null>;
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
  const [showArrow, setShowArrow] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle open/close transitions
  useEffect(() => {
    if (isOpen && venue) {
      setIsVisible(true);
      setIsAnimatingOut(false);
      // Delay arrow appearance for staggered animation
      const arrowTimer = setTimeout(() => setShowArrow(true), 300);
      return () => clearTimeout(arrowTimer);
    } else if (!isOpen && isVisible) {
      // Start close animation
      setIsAnimatingOut(true);
      setShowArrow(false);
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

        {/* Animated Arrow pointing down to marker */}
        <div 
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -bottom-16 flex flex-col items-center",
            "transition-all duration-300",
            showArrow && !isAnimatingOut
              ? "opacity-100 translate-y-0" 
              : "opacity-0 -translate-y-4"
          )}
        >
          {/* Pulsing glow effect */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <svg 
                className="w-8 h-8 text-primary/50" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 16l-6-6h12l-6 6z" />
              </svg>
            </div>
            <svg 
              className="w-8 h-8 text-primary animate-bounce" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 16l-6-6h12l-6 6z" />
            </svg>
          </div>
          
          {/* Connecting line */}
          <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </div>
    </div>
  );
}
