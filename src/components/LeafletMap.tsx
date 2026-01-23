import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { createRoot, Root } from 'react-dom/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Venue, ReactionType } from '@/types/venue';
import { cn } from '@/lib/utils';
import { VenuePopup } from './VenuePopup';
interface LeafletMapProps {
  venues: Venue[];
  selectedVenue: Venue | null;
  onVenueSelect: (venue: Venue | null) => void;
  userLocation?: { lat: number; lng: number };
  onReact: (type: ReactionType) => void;
  onCheckIn: () => void;
  onNavigate: () => void;
}

export interface LeafletMapRef {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

// Get marker color based on category (Hawkly POI Color System)
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    // Social & Nightlife
    bar: '#FFB020',           // Amber/Warm Gold
    nightclub: '#8B5CF6',     // Electric Purple
    lounge: '#2DD4BF',        // Deep Teal
    bar_grill: '#FB923C',     // Burnt Orange
    restaurant: '#EF4444',    // Crimson Red
    coffee: '#A16207',        // Soft Brown/Mocha
    brewery: '#FFB020',       // Same as bar
    sports_bar: '#FB923C',    // Same as bar-grill
    live_music: '#8B5CF6',    // Same as nightclub
    
    // Entertainment & Events
    events: '#EC4899',        // Hot Pink/Magenta
    entertainment: '#38BDF8', // Sky Blue
    sports_venue: '#22C55E',  // Athletic Green
    
    // Public & Utility
    parks: '#16A34A',         // Nature Green
    college: '#1E3A8A',       // Navy Blue
    landmarks: '#9CA3AF',     // Stone Gray
    parking: '#64748B',       // Slate Gray
    gas: '#A3E635',           // Yellow-Green
    atm: '#14B8A6',           // Muted Blue-Green
    emergency: '#DC2626',     // Alert Red
  };
  
  return colors[category] || '#E5E7EB'; // Default to neutral gray
};

// Get marker size based on hot streak
const getMarkerSize = (hotStreak: string, crowdCount: number) => {
  const baseSize = {
    hottest_spot: 28,
    on_fire: 24,
    popping_off: 22,
    rising_star: 20,
    active: 18,
    quiet: 14,
  }[hotStreak] || 16;
  
  const crowdBonus = Math.min(crowdCount / 20, 6);
  return baseSize + crowdBonus;
};

// Get emoji for category
const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'bar': return '🍺';
    case 'nightclub': return '🎉';
    case 'restaurant': return '🍔';
    case 'coffee': return '☕';
    case 'entertainment': return '🎭';
    case 'brewery': return '🍻';
    case 'lounge': return '🍸';
    case 'sports_bar': return '🏈';
    case 'live_music': return '🎵';
    default: return '📍';
  }
};

// Create custom icon for venue
const createVenueIcon = (venue: Venue, isSelected: boolean) => {
  const color = getCategoryColor(venue.category);
  const size = getMarkerSize(venue.hot_streak, venue.current_crowd_count);
  const emoji = getCategoryEmoji(venue.category);
  const scale = isSelected ? 1.3 : 1;
  const finalSize = size * scale;
  
  // Hot venues get stronger glow effects
  const isHot = ['hottest_spot', 'on_fire', 'popping_off', 'rising_star'].includes(venue.hot_streak);
  const glowIntensity = isHot ? { inner: 20, outer: 40 } : { inner: 10, outer: 20 };
  
  return L.divIcon({
    className: 'venue-marker',
    html: `
      <div class="venue-marker-container" style="
        width: ${finalSize}px;
        height: ${finalSize}px;
        background: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 ${glowIntensity.inner}px ${color}80,
                    0 0 ${glowIntensity.outer}px ${color}40;
        border: 2px solid rgba(255,255,255,0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
        font-size: ${finalSize * 0.45}px;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [finalSize, finalSize],
    iconAnchor: [finalSize / 2, finalSize / 2],
  });
};

// Create user location icon
const createUserIcon = () => {
  return L.divIcon({
    className: 'user-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: hsl(217, 91%, 60%);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 15px hsl(217, 91%, 60%),
                    0 0 30px hsla(217, 91%, 60%, 0.5);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          border: 2px solid hsl(217, 91%, 60%);
          border-radius: 50%;
          animation: userPulse 2s infinite;
          opacity: 0.6;
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

export const LeafletMap = forwardRef<LeafletMapRef, LeafletMapProps>(
  ({ venues, selectedVenue, onVenueSelect, userLocation, onReact, onCheckIn, onNavigate }, ref) => {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());
    const userMarkerRef = useRef<L.Marker | null>(null);
    const popupRef = useRef<L.Popup | null>(null);
    const popupRootRef = useRef<Root | null>(null);

    // Expose flyTo method via ref
    useImperativeHandle(ref, () => ({
      flyTo: (lat: number, lng: number, zoom: number = 16) => {
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
        }
      },
    }));

    // Initialize map
    useEffect(() => {
      if (!containerRef.current || mapRef.current) return;

      // Default center (Cuyahoga Falls, OH)
      const defaultCenter: L.LatLngExpression = [41.1339, -81.4846];
      const center = userLocation ? [userLocation.lat, userLocation.lng] as L.LatLngExpression : defaultCenter;

      const map = L.map(containerRef.current, {
        center,
        zoom: 13,
        zoomControl: false,
      });

      // Add MapTiler Backdrop tiles (ultra-dark style)
      L.tileLayer('https://api.maptiler.com/maps/backdrop-dark/{z}/{x}/{y}.png?key=sBCotOB5AWbR0C8uxgb9', {
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;

      // Click on map to deselect
      map.on('click', () => {
        onVenueSelect(null);
      });

      return () => {
        map.remove();
        mapRef.current = null;
      };
    }, []);

    // Update user location marker
    useEffect(() => {
      if (!mapRef.current || !userLocation) return;

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
          icon: createUserIcon(),
          zIndexOffset: 1000,
        }).addTo(mapRef.current);
      }
    }, [userLocation]);

    // Update venue markers (no clustering)
    useEffect(() => {
      if (!mapRef.current) return;

      const map = mapRef.current;
      const currentVenueIds = new Set(venues.map(v => v.id));

      // Remove markers that are no longer in venues
      markersRef.current.forEach((marker, id) => {
        if (!currentVenueIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });

      // Add or update markers
      venues.forEach(venue => {
        const isSelected = selectedVenue?.id === venue.id;
        const existingMarker = markersRef.current.get(venue.id);

        if (existingMarker) {
          // Update existing marker icon
          existingMarker.setIcon(createVenueIcon(venue, isSelected));
        } else {
          // Create new marker
          const marker = L.marker([venue.latitude, venue.longitude], {
            icon: createVenueIcon(venue, isSelected),
          })
            .addTo(map)
            .on('click', (e) => {
              L.DomEvent.stopPropagation(e);
              onVenueSelect(venue);
            });

          markersRef.current.set(venue.id, marker);
        }
      });
    }, [venues, selectedVenue, onVenueSelect]);

    // Handle popup for selected venue
    useEffect(() => {
      if (!mapRef.current) return;

      const map = mapRef.current;

      // Close existing popup
      if (popupRef.current) {
        map.closePopup(popupRef.current);
        popupRef.current = null;
      }
      
      // Cleanup old root
      if (popupRootRef.current) {
        popupRootRef.current.unmount();
        popupRootRef.current = null;
      }

      if (!selectedVenue) return;

      // Create container for React portal
      const container = document.createElement('div');
      
      // Create popup
      const popup = L.popup({
        closeButton: false,
        className: 'venue-popup',
        maxWidth: 320,
        offset: [0, -10],
      })
        .setLatLng([selectedVenue.latitude, selectedVenue.longitude])
        .setContent(container)
        .openOn(map);

      // Render React component into popup
      const root = createRoot(container);
      root.render(
        <VenuePopup
          venue={selectedVenue}
          onClose={() => onVenueSelect(null)}
          onReact={onReact}
          onCheckIn={onCheckIn}
          onNavigate={onNavigate}
        />
      );

      popupRef.current = popup;
      popupRootRef.current = root;

      // Handle popup close event
      popup.on('remove', () => {
        onVenueSelect(null);
      });

      return () => {
        if (popupRootRef.current) {
          popupRootRef.current.unmount();
          popupRootRef.current = null;
        }
      };
    }, [selectedVenue, onVenueSelect, onReact, onCheckIn, onNavigate]);

    // Handle recenter
    const handleRecenter = () => {
      if (!mapRef.current) return;
      const center = userLocation 
        ? [userLocation.lat, userLocation.lng] as L.LatLngExpression
        : [41.1339, -81.4846] as L.LatLngExpression;
      mapRef.current.flyTo(center, 14, { duration: 1 });
    };

    return (
      <div className="relative w-full h-full">
        <div ref={containerRef} className="w-full h-full" />
        
        {/* Recenter button */}
        <button
          onClick={handleRecenter}
          className={cn(
            "absolute bottom-24 right-4 z-[1000]",
            "glass p-3 rounded-full",
            "hover:bg-secondary/50 transition-colors"
          )}
          aria-label="Recenter map"
        >
          <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>

        {/* Custom styles for markers and ultra-dark map */}
        <style>{`
          /* Ultra-dark map tiles */
          .leaflet-tile-pane {
            filter: brightness(0.7) saturate(0.9);
          }
          
          @keyframes userPulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
            50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
          }
          
          .venue-marker-container:hover {
            transform: scale(1.15);
          }

          .leaflet-control-zoom {
            background: hsl(var(--card)) !important;
            backdrop-filter: blur(12px);
            border-radius: 12px !important;
            border: none !important;
            overflow: hidden;
          }
          
          .leaflet-control-zoom a {
            background: transparent !important;
            color: hsl(var(--foreground)) !important;
            border: none !important;
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
          }
          
          .leaflet-control-zoom a:hover {
            background: hsl(var(--secondary)) !important;
          }
          
          .leaflet-control-attribution {
            background: hsl(var(--background) / 0.8) !important;
            color: hsl(var(--muted-foreground)) !important;
            font-size: 10px !important;
            padding: 2px 6px !important;
          }
          
          .leaflet-control-attribution a {
            color: hsl(var(--primary)) !important;
          }

          /* Custom popup styles */
          .venue-popup .leaflet-popup-content-wrapper {
            background: hsl(var(--card));
            border-radius: 20px;
            padding: 0;
            border: 1px solid hsl(var(--border));
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          }
          
          .venue-popup .leaflet-popup-content {
            margin: 16px;
            width: auto !important;
          }
          
          /*
            IMPORTANT: Leaflet's default tip-container width is 40px and it also
            uses a fixed -20px margin-left in its own CSS. If we change the width
            here, the tip (and our connector) will shift horizontally and won't
            line up with the marker.
          */
          .venue-popup .leaflet-popup-tip-container {
            width: 40px;
            height: 44px;
            overflow: visible;
            pointer-events: none;
          }
          
          .venue-popup .leaflet-popup-tip {
            background: transparent;
            border: none;
            box-shadow: none;
            width: 0;
            height: 0;
          }
          
          /* Animated connector line (anchored to Leaflet's actual tip point) */
          .venue-popup .leaflet-popup-tip-container::before {
            content: '';
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 2px;
            height: calc(100% - 8px);
            background: hsl(var(--primary));
            animation: connectorPulse 2s ease-in-out infinite;
          }
          
          /* Arrow head pointing down at marker */
          .venue-popup .leaflet-popup-tip-container::after {
            content: '';
            position: absolute;
            left: 50%;
            bottom: 0;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid hsl(var(--primary));
            animation: arrowPulse 2s ease-in-out infinite;
          }
          
          @keyframes connectorPulse {
            0%, 100% { 
              opacity: 0.7;
              box-shadow: 0 0 3px hsl(var(--primary) / 0.4);
            }
            50% { 
              opacity: 1;
              box-shadow: 0 0 8px hsl(var(--primary) / 0.7);
            }
          }
          
          @keyframes arrowPulse {
            0%, 100% { 
              opacity: 0.8;
              filter: drop-shadow(0 0 2px hsl(var(--primary) / 0.4));
            }
            50% { 
              opacity: 1;
              filter: drop-shadow(0 0 5px hsl(var(--primary)));
            }
          }
        `}</style>
      </div>
    );
  }
);