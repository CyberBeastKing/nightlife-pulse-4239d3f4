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

    // Fetch places from external Supabase - this table has venue coordinates, hot_streak, crowd_count, category, etc.
    const { data: places, error } = await externalSupabase
      .from('places')
      .select('id, google_name, google_address, latitude, longitude, category, place_type, hot_streak, current_crowd_count, reactions, vibe');

    if (error) {
      console.error('Error fetching places:', error);
      throw error;
    }

    // Transform to match Venue type expected by frontend
    const venues = (places || []).map((place: any) => ({
      id: place.id,
      name: place.google_name || 'Unknown Venue',
      address: place.google_address,
      latitude: place.latitude,
      longitude: place.longitude,
      category: place.category || 'bar',
      place_type: place.place_type || 'social',
      hot_streak: place.hot_streak || 'quiet',
      current_crowd_count: place.current_crowd_count || 0,
      reactions: place.reactions || { lit: 0, vibe: 0, curious: 0, dead: 0 },
      vibe: place.vibe || { sound_level: 'moderate', energy: 'lively', crowd_type: 'mixed' },
    }));

    console.log('Successfully fetched places:', venues.length, 'records');

    return new Response(JSON.stringify({ venues }), {
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
