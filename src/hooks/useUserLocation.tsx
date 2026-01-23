import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface LocationData {
  coords: { lat: number; lng: number } | null;
  locationName: string;
  isLoading: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationData | undefined>(undefined);

// Reverse geocode using OpenStreetMap Nominatim (free, no API key)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await response.json();
    
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality;
    const state = data.address?.state;
    
    if (city && state) {
      // Abbreviate common US states
      const stateAbbrev = getStateAbbreviation(state) || state;
      return `${city}, ${stateAbbrev}`;
    }
    
    return data.display_name?.split(',').slice(0, 2).join(',') || 'Unknown Location';
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return 'Unknown Location';
  }
}

function getStateAbbreviation(state: string): string | null {
  const stateMap: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
    'District of Columbia': 'DC',
  };
  return stateMap[state] || null;
}

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('Locating...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setCoords({ lat: 41.1339, lng: -81.4846 }); // Default: Cuyahoga Falls
      setLocationName('Cuyahoga Falls, OH');
      setIsLoading(false);
      return;
    }

    // Watch position for live updates
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(newCoords);
        
        // Reverse geocode to get location name
        const name = await reverseGeocode(newCoords.lat, newCoords.lng);
        setLocationName(name);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setError(err.message);
        // Fallback to default location
        setCoords({ lat: 41.1339, lng: -81.4846 });
        setLocationName('Cuyahoga Falls, OH');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // Cache for 30 seconds
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <LocationContext.Provider value={{ coords, locationName, isLoading, error }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
}
