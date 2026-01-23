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
    
    // Fetch places with their category from the joined category table
    const { data: rawPlaces, error: rawError } = await externalSupabase
      .from('places')
      .select('*, category:category_id(name)');
      
    if (rawError) {
      console.error('Error fetching places:', rawError);
      throw rawError;
    }

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

    // Map external category names to our app's category types
    const mapCategory = (categoryName: string | null): string => {
      if (!categoryName) return 'bar';
      const name = categoryName.toLowerCase();
      
      // Map common category names to our types
      if (name.includes('bar') || name.includes('pub') || name.includes('tavern')) return 'bar';
      if (name.includes('club') || name.includes('nightclub') || name.includes('night club')) return 'nightclub';
      if (name.includes('lounge')) return 'lounge';
      if (name.includes('restaurant') || name.includes('food') || name.includes('grill') || name.includes('dining')) return 'restaurant';
      if (name.includes('coffee') || name.includes('cafe') || name.includes('café')) return 'coffee';
      if (name.includes('entertainment') || name.includes('arcade') || name.includes('bowling')) return 'entertainment';
      if (name.includes('music') || name.includes('concert') || name.includes('venue')) return 'live_music';
      if (name.includes('brewery') || name.includes('brew')) return 'brewery';
      if (name.includes('sports')) return 'sports_bar';
      
      return 'bar'; // default fallback
    };

    const venues = (rawPlaces || []).map((place: any) => {
      const coords = parseWKB(place.location);
      const categoryName = place.category?.name || null;
      
      return {
        id: place.id,
        name: place.google_name || place.name || 'Unknown Venue',
        address: place.google_address || place.address,
        latitude: coords?.lat || 0,
        longitude: coords?.lng || 0,
        category: mapCategory(categoryName),
        place_type: place.place_type || 'social',
        hot_streak: place.hot_streak || 'quiet',
        current_crowd_count: place.current_crowd_count || 0,
        reactions: place.reactions || { lit: 0, vibe: 0, curious: 0, dead: 0 },
        vibe: place.vibe || { sound_level: 'moderate', energy: 'lively', crowd_type: 'mixed' },
      };
    });

    const validVenues = venues.filter((v: any) => v.latitude !== 0 && v.longitude !== 0);
    console.log('Successfully processed places:', validVenues.length, 'valid venues out of', venues.length, 'total');
    return new Response(JSON.stringify({ venues: validVenues }), {
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
