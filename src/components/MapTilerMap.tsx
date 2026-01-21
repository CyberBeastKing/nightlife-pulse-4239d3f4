import { useEffect, useRef } from 'react';
import { Map, MapStyle, config, Marker } from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';
import { Venue } from '@/types/venue';
import { cn } from '@/lib/utils';

// Configure MapTiler API key
config.apiKey = 'sBCotOB5AWbR0C8uxgb9';

interface MapTilerMapProps {
  venues: Venue[];
  selectedVenue: Venue | null;
  onVenueSelect: (venue: Venue | null) => void;
  userLocation?: { lat: number; lng: number };
}

// Get marker color based on hot streak
const getMarkerColor = (hotStreak: string) => {
  switch (hotStreak) {
    case 'hottest_spot': return 'hsl(38, 92%, 50%)';
    case 'on_fire': return 'hsl(271, 91%, 65%)';
    case 'popping_off': return 'hsl(330, 81%, 60%)';
    case 'rising_star': return 'hsl(217, 91%, 60%)';
    case 'active': return 'hsl(160, 84%, 39%)';
    default: return 'hsl(220, 9%, 46%)';
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

// Create marker element for venue
const createVenueMarkerElement = (venue: Venue, isSelected: boolean): HTMLElement => {
  const color = getMarkerColor(venue.hot_streak);
  const size = getMarkerSize(venue.hot_streak, venue.current_crowd_count);
  const emoji = getCategoryEmoji(venue.category);
  const scale = isSelected ? 1.3 : 1;
  const finalSize = size * scale;
  
  const isHot = ['hottest_spot', 'on_fire', 'popping_off', 'rising_star'].includes(venue.hot_streak);
  
  const container = document.createElement('div');
  container.className = 'venue-marker-container';
  container.style.cssText = `
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
  `;
  container.textContent = emoji;
  
  return container;
};

// Create user location marker element
const createUserMarkerElement = (): HTMLElement => {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="user-marker" style="
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
  `;
  return container;
};

export function MapTilerMap({ venues, selectedVenue, onVenueSelect, userLocation }: MapTilerMapProps) {
  const mapRef = useRef<Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<globalThis.Map<string, Marker>>(new globalThis.Map());
  const userMarkerRef = useRef<Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Default center (Cuyahoga Falls, OH)
    const defaultCenter: [number, number] = [-81.4846, 41.1339]; // [lng, lat] for MapTiler
    const center = userLocation ? [userLocation.lng, userLocation.lat] as [number, number] : defaultCenter;

    const map = new Map({
      container: containerRef.current,
      style: MapStyle.BACKDROP.DARK,
      center,
      zoom: 13,
      navigationControl: 'bottom-right',
      geolocateControl: false,
    });

    mapRef.current = map;

    // Click on map to deselect
    map.on('click', (e) => {
      // Only deselect if not clicking on a marker
      const target = e.originalEvent.target as HTMLElement;
      if (!target.closest('.venue-marker-container')) {
        onVenueSelect(null);
      }
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
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    } else {
      userMarkerRef.current = new Marker({
        element: createUserMarkerElement(),
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
    }
  }, [userLocation]);

  // Update venue markers
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
        // Update existing marker element
        const element = createVenueMarkerElement(venue, isSelected);
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          onVenueSelect(venue);
        });
        existingMarker.getElement().replaceWith(element);
      } else {
        // Create new marker
        const element = createVenueMarkerElement(venue, isSelected);
        element.addEventListener('click', (e) => {
          e.stopPropagation();
          onVenueSelect(venue);
        });

        const marker = new Marker({ element })
          .setLngLat([venue.longitude, venue.latitude])
          .addTo(map);

        markersRef.current.set(venue.id, marker);
      }
    });
  }, [venues, selectedVenue, onVenueSelect]);

  // Handle recenter
  const handleRecenter = () => {
    if (!mapRef.current) return;
    const center = userLocation 
      ? [userLocation.lng, userLocation.lat] as [number, number]
      : [-81.4846, 41.1339] as [number, number];
    mapRef.current.flyTo({ center, zoom: 14, duration: 1000 });
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
        @keyframes userPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        
        .venue-marker-container:hover {
          transform: scale(1.15);
        }

        .maplibregl-ctrl-group {
          background: hsl(var(--card)) !important;
          backdrop-filter: blur(12px);
          border-radius: 12px !important;
          border: none !important;
          overflow: hidden;
        }
        
        .maplibregl-ctrl-group button {
          background: transparent !important;
          color: hsl(var(--foreground)) !important;
          border: none !important;
          width: 36px !important;
          height: 36px !important;
        }
        
        .maplibregl-ctrl-group button:hover {
          background: hsl(var(--secondary)) !important;
        }

        .maplibregl-ctrl-group button .maplibregl-ctrl-icon {
          filter: invert(1);
        }
        
        .maplibregl-ctrl-attrib {
          background: hsl(var(--background) / 0.8) !important;
          color: hsl(var(--muted-foreground)) !important;
          font-size: 10px !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
        }
        
        .maplibregl-ctrl-attrib a {
          color: hsl(var(--primary)) !important;
        }
      `}</style>
    </div>
  );
}
