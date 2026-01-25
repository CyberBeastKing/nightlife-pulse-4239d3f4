// Reverse geocode coordinates using Nominatim (OpenStreetMap)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: 'Missing lat or lng parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Nominatim API (OpenStreetMap) - free reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Hawkly/1.0 (contact@hawkly.app)' // Required by Nominatim TOS
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    const result = {
      city: address.city || address.town || address.village || address.municipality,
      state: address.state,
      zip: address.postcode,
      country: address.country
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return new Response(
      JSON.stringify({ error: 'Geocoding failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
