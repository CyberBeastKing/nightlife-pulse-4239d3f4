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
    const url = new URL(req.url);
    const query = url.searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ venues: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const externalSupabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const externalSupabaseKey = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_ROLE_KEY');

    if (!externalSupabaseUrl || !externalSupabaseKey) {
      throw new Error('External Supabase credentials not configured');
    }

    const externalSupabase = createClient(externalSupabaseUrl, externalSupabaseKey);

    // Search across ALL venues using ILIKE on name fields
    // We search both 'name' and 'google_name' for better coverage
    const { data: places, error } = await externalSupabase
      .from('places_overture')
      .select('*, category:category_id(id, name)')
      .eq('place_type', 'social')
      .or(`name.ilike.%${query}%,google_name.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Search query error:', error);
      throw error;
    }

    console.log(`Search for "${query}": found ${places?.length || 0} venues`);

    // Hawkly POI Color System (same as fetch-external-venues)
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

    // Map to venue format
    const venues = (places || []).map((place: any) => {
      const lat = place.latitude;
      const lng = place.longitude;
      const categoryId = place.category?.id || null;

      return {
        id: place.id,
        name: place.google_name || place.name || 'Unknown Venue',
        address: place.google_address || place.address,
        latitude: lat,
        longitude: lng,
        category: categoryId,
        place_type: place.place_type || 'social',
        hot_streak: place.hot_streak || 'quiet',
        current_crowd_count: place.current_crowd_count || 0,
        reactions: place.reactions || { lit: 0, vibe: 0, curious: 0, dead: 0 },
        vibe: place.vibe || { sound_level: 'moderate', energy: 'lively', crowd_type: 'mixed' },
      };
    });

    // Filter out invalid coordinates
    const validVenues = venues.filter((v: any) => v.latitude && v.longitude && v.latitude !== 0 && v.longitude !== 0);

    return new Response(JSON.stringify({ venues: validVenues }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Search edge function error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
