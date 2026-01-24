import { useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { createRoot, Root } from 'react-dom/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Venue, ReactionType } from '@/types/venue';
import { cn } from '@/lib/utils';
import { VenuePopup } from './VenuePopup';
import type { CategoryData } from '@/hooks/useExternalVenues';
import { useAuth } from '@/hooks/useAuth';

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface LeafletMapProps {
  venues: Venue[];
  categories?: CategoryData[];
  selectedVenue: Venue | null;
  onVenueSelect: (venue: Venue | null) => void;
  userLocation?: { lat: number; lng: number };
  onReact: (type: ReactionType) => void;
  onCheckIn: () => void;
  onChat: () => void;
  onNavigate: () => void;
  onBoundsChange?: (bounds: MapBounds) => void;
}

export interface LeafletMapRef {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

type CategoryStyle = { color: string; emoji: string };

// Hawkly POI Color System - centralized category styling
const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  // Social & Nightlife
  bar: { color: '#FFB020', emoji: '🍺' },           // Amber/Warm Gold
  bars: { color: '#FFB020', emoji: '🍺' },
  nightclub: { color: '#8B5CF6', emoji: '🎵' },     // Electric Purple
  nightclubs: { color: '#8B5CF6', emoji: '🎵' },
  clubs: { color: '#8B5CF6', emoji: '🎵' },
  lounge: { color: '#2DD4BF', emoji: '🛋️' },        // Deep Teal
  lounges: { color: '#2DD4BF', emoji: '🛋️' },
  bar_grill: { color: '#FB923C', emoji: '🍔' },     // Burnt Orange
  'bar_&_grill': { color: '#FB923C', emoji: '🍔' },
  restaurant: { color: '#EF4444', emoji: '🍽️' },    // Crimson Red
  restaurants: { color: '#EF4444', emoji: '🍽️' },
  food: { color: '#EF4444', emoji: '🍽️' },
  coffee: { color: '#A16207', emoji: '☕' },         // Soft Brown/Mocha
  coffee_shops: { color: '#A16207', emoji: '☕' },
  brewery: { color: '#FFB020', emoji: '🍺' },
  sports_bar: { color: '#FB923C', emoji: '🍔' },
  live_music: { color: '#8B5CF6', emoji: '🎵' },
  
  // Entertainment & Events  
  events: { color: '#EC4899', emoji: '🎟️' },        // Hot Pink/Magenta
  entertainment: { color: '#38BDF8', emoji: '🎬' }, // Sky Blue
  sports_venue: { color: '#22C55E', emoji: '🏟️' },  // Athletic Green
  sports_venues: { color: '#22C55E', emoji: '🏟️' },
  
  // Public & Utility
  parks: { color: '#16A34A', emoji: '🌳' },
  college: { color: '#1E3A8A', emoji: '🏫' },
  landmarks: { color: '#9CA3AF', emoji: '🏛️' },
  parking: { color: '#64748B', emoji: '🅿️' },
  gas: { color: '#A3E635', emoji: '⛽' },
  atm: { color: '#14B8A6', emoji: '🏧' },
  emergency: { color: '#DC2626', emoji: '🚨' },
};

// Get marker color based on category
const normalizeKey = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, '_')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const getCategoryColor = (category: string, lookup?: Map<string, CategoryStyle>): string => {
  const raw = category ?? '';
  const normalized = normalizeKey(String(raw));

  // Prefer lookup (handles UUID categories from backend)
  const direct = lookup?.get(String(raw))?.color;
  if (direct) return direct;

  const byNormalized = lookup?.get(normalized)?.color;
  if (byNormalized) return byNormalized;

  return CATEGORY_STYLES[normalized]?.color || '#E5E7EB';
};

// Get emoji for category
const getCategoryEmoji = (category: string, lookup?: Map<string, CategoryStyle>): string => {
  const raw = category ?? '';
  const normalized = normalizeKey(String(raw));

  const direct = lookup?.get(String(raw))?.emoji;
  if (direct) return direct;

  const byNormalized = lookup?.get(normalized)?.emoji;
  if (byNormalized) return byNormalized;

  // Never fall back to 📍 (explicit request)
  return CATEGORY_STYLES[normalized]?.emoji || '•';
};

// Get marker size based on hot streak
const getMarkerSize = (hotStreak: string, crowdCount: number) => {
  const baseSize = {
    hottest_spot: 44,
    on_fire: 40,
    popping_off: 36,
    rising_star: 34,
    active: 32,
    quiet: 28,
  }[hotStreak] || 24;
  
  const crowdBonus = Math.min(crowdCount / 20, 8);
  return baseSize + crowdBonus;
};

// (getCategoryEmoji is defined above)

// Create custom icon for venue
const createVenueIcon = (
  venue: Venue,
  isSelected: boolean,
  categoryStyleLookup?: Map<string, CategoryStyle>
) => {
  const color = getCategoryColor(String(venue.category), categoryStyleLookup);
  const size = getMarkerSize(venue.hot_streak, venue.current_crowd_count);
  const emoji = getCategoryEmoji(String(venue.category), categoryStyleLookup);
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
  ({ venues, categories = [], selectedVenue, onVenueSelect, userLocation, onReact, onCheckIn, onChat, onNavigate, onBoundsChange }, ref) => {
    const { user } = useAuth();
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);
    const popupRef = useRef<L.Popup | null>(null);
    const popupRootRef = useRef<Root | null>(null);

     // Map backend category UUIDs (and normalized labels) -> {color, emoji}
     const categoryStyleLookup = useMemo(() => {
       const map = new Map<string, CategoryStyle>();
       for (const c of categories) {
         if (!c?.id) continue;
         map.set(c.id, { color: c.color, emoji: c.icon });
         if (c.label) {
           map.set(normalizeKey(c.label), { color: c.color, emoji: c.icon });
         }
       }
       return map;
     }, [categories]);

    // Expose flyTo method via ref
    useImperativeHandle(ref, () => ({
      flyTo: (lat: number, lng: number, zoom: number = 16) => {
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
        }
      },
    }));

    // Helper to emit bounds
    const emitBounds = (map: L.Map) => {
      if (!onBoundsChange) return;
      const b = map.getBounds();
      onBoundsChange({
        minLat: b.getSouth(),
        maxLat: b.getNorth(),
        minLng: b.getWest(),
        maxLng: b.getEast(),
      });
    };

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

      // Initialize marker cluster group with custom styling
      const clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 60,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          let size = 40;
          let className = 'cluster-small';
          
          if (count > 100) {
            size = 56;
            className = 'cluster-large';
          } else if (count > 30) {
            size = 48;
            className = 'cluster-medium';
          }
          
          return L.divIcon({
            html: `<div class="cluster-marker ${className}"><span>${count}</span></div>`,
            className: 'marker-cluster-custom',
            iconSize: L.point(size, size),
          });
        },
      });
      
      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;

      // Click on map to deselect
      map.on('click', () => {
        onVenueSelect(null);
      });

      // Emit bounds on map move/zoom
      map.on('moveend', () => emitBounds(map));
      map.on('zoomend', () => emitBounds(map));

      // Emit initial bounds
      setTimeout(() => emitBounds(map), 100);

      return () => {
        map.remove();
        mapRef.current = null;
        clusterGroupRef.current = null;
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

    // Update venue markers with clustering
    useEffect(() => {
      if (!mapRef.current || !clusterGroupRef.current) return;

      const clusterGroup = clusterGroupRef.current;
      const currentVenueIds = new Set(venues.map(v => v.id));

      // Remove markers that are no longer in venues (but keep selected venue marker)
      markersRef.current.forEach((marker, id) => {
        if (!currentVenueIds.has(id) && selectedVenue?.id !== id) {
          clusterGroup.removeLayer(marker);
          markersRef.current.delete(id);
        }
      });

      // Add or update markers
      venues.forEach(venue => {
        const isSelected = selectedVenue?.id === venue.id;
        const existingMarker = markersRef.current.get(venue.id);

        if (existingMarker) {
          // Update existing marker icon and ensure it's in the cluster group
          existingMarker.setIcon(createVenueIcon(venue, isSelected, categoryStyleLookup));
          existingMarker.setLatLng([venue.latitude, venue.longitude]);
          
          // Ensure marker is visible in cluster group
          if (!clusterGroup.hasLayer(existingMarker)) {
            clusterGroup.addLayer(existingMarker);
          }
        } else {
          // Create new marker and add to cluster group
          const marker = L.marker([venue.latitude, venue.longitude], {
            icon: createVenueIcon(venue, isSelected, categoryStyleLookup),
          }).on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onVenueSelect(venue);
          });

          clusterGroup.addLayer(marker);
          markersRef.current.set(venue.id, marker);
        }
      });
    }, [venues, selectedVenue, onVenueSelect, categoryStyleLookup]);

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
          onChat={onChat}
          onNavigate={onNavigate}
          userCoords={userLocation}
          isAuthenticated={!!user}
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
          
          .venue-popup .leaflet-popup-tip-container {
            display: none;
          }

          /* Custom cluster marker styles */
          .marker-cluster-custom {
            background: transparent !important;
          }
          
          .cluster-marker {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            font-weight: 700;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            border: 2px solid rgba(255,255,255,0.3);
            animation: clusterPulse 3s infinite;
          }
          
          .cluster-small {
            background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
            font-size: 14px;
          }
          
          .cluster-medium {
            background: linear-gradient(135deg, #EC4899 0%, #BE185D 100%);
            font-size: 16px;
          }
          
          .cluster-large {
            background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
            font-size: 18px;
          }
          
          @keyframes clusterPulse {
            0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
            50% { box-shadow: 0 4px 30px rgba(139,92,246,0.6); }
          }
          
          .cluster-marker:hover {
            transform: scale(1.1);
            cursor: pointer;
          }

          /* Override default markercluster styles */
          .marker-cluster div {
            background-color: transparent !important;
          }
          
          .leaflet-marker-icon.marker-cluster-custom {
            background: transparent !important;
          }
        `}</style>
      </div>
    );
  }
);