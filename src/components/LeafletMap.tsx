import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Venue } from '@/types/venue';
import { cn } from '@/lib/utils';

interface LeafletMapProps {
  venues: Venue[];
  selectedVenue: Venue | null;
  onVenueSelect: (venue: Venue | null) => void;
  userLocation?: { lat: number; lng: number };
}

// Get marker color based on hot streak
const getMarkerColor = (hotStreak: string) => {
  switch (hotStreak) {
    case 'hottest_spot': return 'hsl(38, 92%, 50%)'; // Orange
    case 'on_fire': return 'hsl(271, 91%, 65%)'; // Purple
    case 'popping_off': return 'hsl(330, 81%, 60%)'; // Pink
    case 'rising_star': return 'hsl(217, 91%, 60%)'; // Blue
    case 'active': return 'hsl(160, 84%, 39%)'; // Green
    default: return 'hsl(220, 9%, 46%)'; // Gray
  }
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

// Create custom venue marker icon
const createVenueIcon = (venue: Venue, isSelected: boolean) => {
  const color = getMarkerColor(venue.hot_streak);
  const size = getMarkerSize(venue.hot_streak, venue.current_crowd_count);
  const emoji = getCategoryEmoji(venue.category);
  const scale = isSelected ? 1.3 : 1;
  const finalSize = size * scale;
  
  const isHot = ['hottest_spot', 'on_fire', 'popping_off', 'rising_star'].includes(venue.hot_streak);
  const animationClass = isHot ? `marker-pulse-${venue.hot_streak.replace('_', '-')}` : '';
  
  return L.divIcon({
    className: 'custom-venue-marker',
    html: `
      <div class="venue-marker-container ${animationClass}" style="
        width: ${finalSize}px;
        height: ${finalSize}px;
        background: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 ${isHot ? '20px' : '10px'} ${color}80,
                    0 0 ${isHot ? '40px' : '20px'} ${color}40;
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

// Create user location marker
const createUserIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="user-marker-container" style="
        width: 20px;
        height: 20px;
        background: hsl(217, 91%, 60%);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 15px hsl(217, 91%, 60%),
                    0 0 30px hsla(217, 91%, 60%, 0.5);
        position: relative;
      ">
        <div class="user-pulse" style="
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

export function LeafletMap({ venues, selectedVenue, onVenueSelect, userLocation }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Default center (Cuyahoga Falls, OH)
    const defaultCenter: [number, number] = [41.1339, -81.4846];
    const center = userLocation ? [userLocation.lat, userLocation.lng] as [number, number] : defaultCenter;

    // Create map with dark style
    const map = L.map(containerRef.current, {
      center,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Add dark tile layer (CartoDB Dark Matter - free, no API key needed)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    

    mapRef.current = map;

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
        zIndexOffset: 10000,
      }).addTo(mapRef.current);
    }
  }, [userLocation]);

  // Update venue markers
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const currentMarkerIds = new Set(venues.map(v => v.id));

    // Remove markers that are no longer in venues
    markersRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
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
          zIndexOffset: isSelected ? 1000 : getZIndex(venue.hot_streak),
        });

        marker.on('click', () => {
          onVenueSelect(venue);
        });

        marker.addTo(map);
        markersRef.current.set(venue.id, marker);
      }
    });
  }, [venues, selectedVenue, onVenueSelect]);

  // Handle recenter
  const handleRecenter = () => {
    if (!mapRef.current) return;
    const center = userLocation 
      ? [userLocation.lat, userLocation.lng] as [number, number]
      : [41.1339, -81.4846] as [number, number];
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

      {/* Custom styles for markers */}
      <style>{`
        .custom-venue-marker, .user-location-marker {
          background: transparent !important;
          border: none !important;
        }
        
        @keyframes userPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        
        @keyframes markerPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .marker-pulse-hottest-spot .venue-marker-container {
          animation: markerPulse 2s infinite;
        }
        
        .marker-pulse-on-fire .venue-marker-container {
          animation: markerPulse 1s infinite;
        }
        
        .marker-pulse-popping-off .venue-marker-container {
          animation: markerPulse 1.5s infinite;
        }
        
        .marker-pulse-rising-star .venue-marker-container {
          animation: markerPulse 2.5s infinite;
        }
        
        .venue-marker-container:hover {
          transform: scale(1.15);
        }

        .leaflet-control-zoom {
          border: none !important;
          background: hsl(var(--card)) !important;
          backdrop-filter: blur(12px);
          border-radius: 12px !important;
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
          border-radius: 4px !important;
        }
        
        .leaflet-control-attribution a {
          color: hsl(var(--primary)) !important;
        }
      `}</style>
    </div>
  );
}

// Z-index based on hot streak
function getZIndex(hotStreak: string): number {
  switch (hotStreak) {
    case 'hottest_spot': return 500;
    case 'on_fire': return 400;
    case 'popping_off': return 300;
    case 'rising_star': return 200;
    case 'active': return 100;
    default: return 0;
  }
}
