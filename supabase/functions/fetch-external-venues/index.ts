import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const externalSupabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const externalSupabaseKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_ROLE_KEY');

    if (!externalSupabaseUrl || !externalSupabaseKey) {
      throw new Error('External Supabase credentials not configured');
    }

    const externalSupabase = createClient(externalSupabaseUrl, externalSupabaseKey);

    // Use PostGIS to extract lat/lng from the location column via RPC or a computed column
    // Since the location is stored as WKB, we need to use ST_X and ST_Y to extract coordinates
    // We'll call an RPC function or use a view - for now, let's try fetching with a raw query
    
    // Fetch categories first (table is named 'categories' plural)
    const { data: rawCategories, error: catError } = await externalSupabase
      .from('categories')
      .select('id, name, icon, color');
    
    if (catError) {
      console.error('Error fetching categories:', catError);
    }

    // Fetch all 'social' places from the new Overture Maps table with pagination
    // Supabase has a 1000 row default limit, so we paginate to get all venues
    const PAGE_SIZE = 1000;
    let allPlaces: any[] = [];
    let page = 0;
    let hasMore = true;
    
    while (hasMore) {
      const { data: pageData, error: pageError } = await externalSupabase
        .from('places_overture')
        .select('*, category:category_id(id, name)')
        .eq('place_type', 'social')
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      
      if (pageError) {
        console.error('Error fetching places page:', page, pageError);
        throw pageError;
      }
      
      if (pageData && pageData.length > 0) {
        allPlaces = allPlaces.concat(pageData);
        page++;
        hasMore = pageData.length === PAGE_SIZE;
      } else {
        hasMore = false;
      }
    }
    
    console.log('Fetched total places:', allPlaces.length);
    
    // Debug: log first place to see column structure
    if (allPlaces.length > 0) {
      const sample = allPlaces[0];
      console.log('Sample place keys:', Object.keys(sample));
      console.log('Sample geog:', sample.geog);
      console.log('Sample location:', sample.location);
      console.log('Sample latitude:', sample.latitude);
      console.log('Sample longitude:', sample.longitude);
    }
    
    const rawPlaces = allPlaces;

    // Parse WKB hex string to extract coordinates
    // WKB format: 0101000020E6100000 + X (8 bytes) + Y (8 bytes)
    // SRID 4326 (E6100000 = 4326 in little-endian)
    const parseWKB = (wkb: string): { lng: number; lat: number } | null => {
      if (!wkb || typeof wkb !== 'string' || wkb.length < 50) return null;
      try {
        // Remove the header (first 18 chars: 0101000020E6100000)
        const coordsHex = wkb.slice(18);
        
        // X coordinate (longitude) - first 16 hex chars (8 bytes, little-endian)
        const xHex = coordsHex.slice(0, 16);
        // Y coordinate (latitude) - next 16 hex chars (8 bytes, little-endian)
        const yHex = coordsHex.slice(16, 32);
        
        // Convert hex to little-endian double
        const hexToDouble = (hex: string): number => {
          const bytes = new Uint8Array(8);
          for (let i = 0; i < 8; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
          }
          const view = new DataView(bytes.buffer);
          return view.getFloat64(0, true); // true = little-endian
        };
        
        return {
          lng: hexToDouble(xHex),
          lat: hexToDouble(yHex)
        };
      } catch (e) {
        console.log('WKB parse error:', e);
        return null;
      }
    };

    // Build a category lookup map from the fetched categories
    const categoryMap = new Map<string, { id: string; name: string }>();
    (rawCategories || []).forEach((cat: any) => {
      categoryMap.set(cat.id, { id: cat.id, name: cat.name });
    });

    // Hawkly POI Color System (canonical)
    const HAWKLY: Record<string, { label?: string; icon: string; color: string }> = {
      bar: { icon: '🍺', color: '#FFB020' },
      nightclub: { icon: '🎵', color: '#8B5CF6' },
      lounge: { icon: '🛋️', color: '#2DD4BF' },
      bar_grill: { icon: '🍔', color: '#FB923C' },
      restaurant: { icon: '🍽️', color: '#EF4444' },
      coffee: { icon: '☕', color: '#A16207' },
      events: { icon: '🎟️', color: '#EC4899' },
      entertainment: { label: 'Entertainment 🎮', icon: '🎬', color: '#38BDF8' },
      sports_venue: { icon: '🏟️', color: '#22C55E' },
      live_music: { icon: '🎵', color: '#8B5CF6' },
      brewery: { icon: '🍺', color: '#FFB020' },
      sports_bar: { icon: '🍔', color: '#FB923C' },
    };

    const slugify = (value: string) =>
      value
        .toLowerCase()
        .trim()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

    const toHawklyKey = (name?: string): string | null => {
      if (!name) return null;
      const s = slugify(name);

      // Strong synonyms from your UI copy
      if (s === 'bars' || s === 'bar') return 'bar';
      if (s === 'nightclubs' || s === 'nightclub' || s === 'clubs') return 'nightclub';
      if (s === 'lounges' || s === 'lounge') return 'lounge';
      if (s === 'bar_and_grill' || s === 'bar_grill' || s === 'bar_and_grills') return 'bar_grill';
      if (s === 'restaurants' || s === 'restaurant' || s === 'food') return 'restaurant';
      if (s === 'coffee_shops' || s === 'coffee_shop' || s === 'coffee') return 'coffee';
      if (s === 'events' || s === 'event') return 'events';
      if (s === 'entertainment' || s === 'arcades' || s === 'cinemas' || s === 'bowling') return 'entertainment';
      if (s === 'sports_venues' || s === 'sports_venue' || s === 'sports') return 'sports_venue';
      if (s === 'live_music' || s === 'music') return 'live_music';
      if (s === 'brewery' || s === 'breweries') return 'brewery';
      if (s === 'sports_bar' || s === 'sports_bars') return 'sports_bar';

      return null;
    };

    const categories = (rawCategories || []).map((cat: any) => {
      const hawklyKey = toHawklyKey(cat.name);
      const hawkly = hawklyKey ? HAWKLY[hawklyKey] : null;

      return {
        id: cat.id,
        label: hawkly?.label ?? cat.name ?? 'Unknown',
        icon: hawkly?.icon ?? cat.icon ?? '•',
        color: hawkly?.color ?? cat.color ?? '#64748B',
      };
    });

    const venues = (rawPlaces || []).map((place: any) => {
      // Overture data has direct latitude/longitude columns
      // Fall back to WKB parsing for legacy 'places' table if needed
      let lat = place.latitude;
      let lng = place.longitude;
      
      // If no direct coords, try WKB parsing from geog/location columns
      if (!lat || !lng) {
        const coords = parseWKB(place.geog) || parseWKB(place.location);
        lat = coords?.lat || 0;
        lng = coords?.lng || 0;
      }
      
      const categoryId = place.category?.id || null;

      return {
        id: place.id,
        name: place.google_name || place.name || 'Unknown Venue',
        address: place.google_address || place.address,
        latitude: lat,
        longitude: lng,
        category: categoryId, // keep UUID so filtering matches chip selections
        place_type: place.place_type || 'social',
        hot_streak: place.hot_streak || 'quiet',
        current_crowd_count: place.current_crowd_count || 0,
        reactions: place.reactions || { lit: 0, vibe: 0, curious: 0, dead: 0 },
        vibe: place.vibe || { sound_level: 'moderate', energy: 'lively', crowd_type: 'mixed' },
      };
    });

    const validVenues = venues.filter((v: any) => v.latitude !== 0 && v.longitude !== 0);
    console.log('Successfully processed places:', validVenues.length, 'valid venues out of', venues.length, 'total');
    console.log('Categories found:', categories.length);
    
    return new Response(JSON.stringify({ venues: validVenues, categories }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Edge function error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
