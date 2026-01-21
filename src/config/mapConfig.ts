// MapTiler configuration
// API keys can be restricted by domain in the MapTiler dashboard for security
export const MAP_CONFIG = {
  // MapTiler API key - can be set via environment variable
  // For production, restrict the key to your domain in MapTiler dashboard
  maptilerKey: import.meta.env.VITE_MAPTILER_API_KEY || '',
  
  // MapTiler style URLs
  styles: {
    dark: 'https://api.maptiler.com/maps/streets-v2-dark/{z}/{x}/{y}.png',
    satellite: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg',
    streets: 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png',
  },
  
  // Get tile URL with API key
  getTileUrl: (style: keyof typeof MAP_CONFIG.styles = 'dark') => {
    return `${MAP_CONFIG.styles[style]}?key=${MAP_CONFIG.maptilerKey}`;
  },
  
  // Default map center (Cuyahoga Falls, OH)
  defaultCenter: [41.1339, -81.4846] as [number, number],
  defaultZoom: 13,
};
