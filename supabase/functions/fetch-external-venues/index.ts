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
    
    const { data: places, error } = await externalSupabase
      .rpc('get_places_with_coords')
      .select('*');

    if (error) {
      // Fallback: If RPC doesn't exist, try fetching raw and parse WKB client-side
      console.log('RPC not available, trying direct fetch with WKB parsing');
      
      const { data: rawPlaces, error: rawError } = await externalSupabase
        .from('places')
        .select('*');
        
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

      const venues = (rawPlaces || []).map((place: any) => {
        const coords = parseWKB(place.location);
        
        return {
          id: place.id,
          name: place.google_name || place.name || 'Unknown Venue',
          address: place.google_address || place.address,
          latitude: coords?.lat || 0,
          longitude: coords?.lng || 0,
          category: place.category || 'bar',
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
    }

    // RPC succeeded - transform response
    const venues = (places || []).map((place: any) => ({
      id: place.id,
      name: place.google_name || place.name || 'Unknown Venue',
      address: place.google_address || place.address,
      latitude: place.latitude || place.lat || 0,
      longitude: place.longitude || place.lng || 0,
      category: place.category || 'bar',
      place_type: place.place_type || 'social',
      hot_streak: place.hot_streak || 'quiet',
      current_crowd_count: place.current_crowd_count || 0,
      reactions: place.reactions || { lit: 0, vibe: 0, curious: 0, dead: 0 },
      vibe: place.vibe || { sound_level: 'moderate', energy: 'lively', crowd_type: 'mixed' },
    }));

    const validVenues = venues.filter((v: any) => v.latitude !== 0 && v.longitude !== 0);
    console.log('Successfully processed places via RPC:', validVenues.length, 'valid venues');

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
