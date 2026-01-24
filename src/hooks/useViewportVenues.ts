import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Venue } from '@/types/venue';

export interface CategoryData {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

interface ViewportVenuesResponse {
  venues: Venue[];
  categories: CategoryData[];
}

export function useViewportVenues() {
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [debouncedBounds, setDebouncedBounds] = useState<Bounds | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  
  // Track cached venues to merge with new viewport results
  const venueCache = useRef<Map<string, Venue>>(new Map());
  const categoriesCache = useRef<CategoryData[]>([]);

  // Debounce bounds updates
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setDebouncedBounds(bounds);
    }, 400);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [bounds]);

  const query = useQuery({
    queryKey: ['viewport-venues', debouncedBounds],
    queryFn: async (): Promise<ViewportVenuesResponse> => {
      // Build query params for viewport
      const params = new URLSearchParams();
      if (debouncedBounds) {
        params.set('minLat', debouncedBounds.minLat.toString());
        params.set('maxLat', debouncedBounds.maxLat.toString());
        params.set('minLng', debouncedBounds.minLng.toString());
        params.set('maxLng', debouncedBounds.maxLng.toString());
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-external-venues?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Viewport fetch failed: ${response.statusText}`);
      }

      const result: ViewportVenuesResponse = await response.json();

      // Merge new venues into cache
      result.venues.forEach(venue => {
        venueCache.current.set(venue.id, venue);
      });

      // Update categories cache
      if (result.categories.length > 0) {
        categoriesCache.current = result.categories;
      }

      console.log(`Viewport: ${result.venues.length} venues fetched, ${venueCache.current.size} total cached`);

      return {
        venues: Array.from(venueCache.current.values()),
        categories: categoriesCache.current,
      };
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnMount: false,
    enabled: debouncedBounds !== null,
  });

  const updateBounds = useCallback((newBounds: Bounds) => {
    setBounds(newBounds);
  }, []);

  return {
    ...query,
    updateBounds,
    bounds,
  };
}
