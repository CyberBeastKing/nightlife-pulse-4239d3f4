import { useState, useEffect } from 'react';

// Free reverse geocoding using Nominatim (OpenStreetMap)
// Rate limit: 1 request per second, so we cache results in localStorage

const GEOCODE_CACHE_KEY = 'hawkly_geocode_cache';

interface GeocodedAddress {
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

// Get cached geocode result
const getCachedGeocode = (lat: number, lng: number): GeocodedAddress | null => {
  try {
    const cache = localStorage.getItem(GEOCODE_CACHE_KEY);
    if (!cache) return null;
    
    const parsed = JSON.parse(cache);
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`; // Round to ~10m precision
    return parsed[key] || null;
  } catch {
    return null;
  }
};

// Cache geocode result
const setCachedGeocode = (lat: number, lng: number, data: GeocodedAddress) => {
  try {
    const cache = localStorage.getItem(GEOCODE_CACHE_KEY);
    const parsed = cache ? JSON.parse(cache) : {};
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    parsed[key] = data;
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(parsed));
  } catch (error) {
    console.error('Failed to cache geocode:', error);
  }
};

// Reverse geocode coordinates to get city/state via edge function proxy
export const reverseGeocode = async (
  lat: number, 
  lng: number
): Promise<GeocodedAddress | null> => {
  // Check cache first
  const cached = getCachedGeocode(lat, lng);
  if (cached) return cached;

  try {
    // Use edge function proxy to avoid CORS issues
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reverse-geocode?lat=${lat}&lng=${lng}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) throw new Error('Geocoding failed');

    const result: GeocodedAddress = await response.json();

    // Cache the result
    setCachedGeocode(lat, lng, result);

    return result;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
};

// US state abbreviations
const STATE_ABBREVIATIONS: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC'
};

// Build full address string with abbreviated state
export const buildFullAddress = (
  streetAddress: string,
  geocoded: GeocodedAddress | null
): string => {
  if (!geocoded) return streetAddress;

  const parts = [streetAddress];
  
  if (geocoded.city) {
    parts.push(geocoded.city);
  }
  
  if (geocoded.state) {
    // Use abbreviated state name if available
    const abbreviated = STATE_ABBREVIATIONS[geocoded.state] || geocoded.state;
    parts.push(abbreviated);
  }
  
  return parts.join(', ');
};

// Hook for using enhanced addresses
export const useEnhancedAddress = (
  streetAddress: string,
  latitude: number,
  longitude: number
) => {
  const [fullAddress, setFullAddress] = useState(streetAddress);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const enhance = async () => {
      // Skip if no valid coordinates
      if (!latitude || !longitude) {
        setFullAddress(streetAddress);
        return;
      }

      setIsLoading(true);
      const geocoded = await reverseGeocode(latitude, longitude);
      
      if (mounted) {
        setFullAddress(buildFullAddress(streetAddress, geocoded));
        setIsLoading(false);
      }
    };

    enhance();

    return () => {
      mounted = false;
    };
  }, [streetAddress, latitude, longitude]);

  return { fullAddress, isLoading };
};
