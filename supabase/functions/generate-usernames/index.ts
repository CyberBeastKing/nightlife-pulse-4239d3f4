import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Word lists for username generation
const maleAdjectives = [
  "Swift", "Bold", "Brave", "Cool", "Epic", "Grand", "Iron", "King", "Lone", "Noble",
  "Prime", "Royal", "Sharp", "Steel", "Storm", "Thunder", "Titan", "Urban", "Wise", "Zero",
  "Alpha", "Blaze", "Chief", "Dark", "Elite", "Flash", "Ghost", "Hawk", "Ice", "Jet"
];

const maleNouns = [
  "Wolf", "Bear", "Lion", "Fox", "Eagle", "Hawk", "Cobra", "Tiger", "Shark", "Falcon",
  "Knight", "Rider", "Hunter", "Warrior", "Legend", "Phoenix", "Shadow", "Viper", "Raven", "Storm",
  "Beast", "Blade", "Flame", "Frost", "Ninja", "Pilot", "Ranger", "Scout", "Titan", "Viking"
];

const femaleAdjectives = [
  "Bright", "Cosmic", "Crystal", "Dream", "Elegant", "Fairy", "Golden", "Jade", "Luna", "Mystic",
  "Nova", "Pearl", "Queen", "Rose", "Sage", "Serene", "Star", "Sweet", "Velvet", "Wild",
  "Aurora", "Blush", "Charm", "Divine", "Echo", "Flora", "Grace", "Haven", "Iris", "Joy"
];

const femaleNouns = [
  "Angel", "Bloom", "Butterfly", "Dancer", "Dove", "Ember", "Flame", "Flower", "Gem", "Heart",
  "Ivy", "Jewel", "Lily", "Lotus", "Meadow", "Moon", "Ocean", "Phoenix", "Rain", "Sage",
  "Sky", "Snow", "Spirit", "Star", "Storm", "Sun", "Swan", "Wave", "Willow", "Wind"
];

const lgbtqAdjectives = [
  "Rainbow", "Prism", "Cosmic", "Stellar", "Radiant", "Vibrant", "Infinite", "Unity", "Proud", "Brave",
  "Bright", "Colorful", "Dazzling", "Electric", "Free", "Glowing", "Harmony", "Iridescent", "Joyful", "Kind",
  "Luminous", "Magical", "Noble", "Openly", "Peaceful", "Queer", "Resilient", "Spirited", "True", "Unique"
];

const lgbtqNouns = [
  "Journey", "Spirit", "Soul", "Heart", "Wave", "Light", "Star", "Dream", "Path", "Quest",
  "Phoenix", "Aurora", "Horizon", "Sunrise", "Spark", "Flame", "Glow", "Shine", "Ray", "Beam",
  "Prism", "Spectrum", "Canvas", "Mosaic", "Tapestry", "Harmony", "Melody", "Rhythm", "Echo", "Voice"
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomNumbers(): string {
  // Generate 4 random digits
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateUsername(gender: "male" | "female" | "lgbtq"): string {
  const numbers = generateRandomNumbers();
  
  switch (gender) {
    case "male": {
      const adj = getRandomElement(maleAdjectives);
      const noun = getRandomElement(maleNouns);
      return `Mr${adj}${noun}${numbers}`;
    }
    case "female": {
      const adj = getRandomElement(femaleAdjectives);
      const noun = getRandomElement(femaleNouns);
      return `Mrs${adj}${noun}${numbers}`;
    }
    case "lgbtq": {
      const adj = getRandomElement(lgbtqAdjectives);
      const noun = getRandomElement(lgbtqNouns);
      return `${adj}${noun}${numbers}`;
    }
    default:
      throw new Error("Invalid gender");
  }
}

async function checkUsernameExists(supabase: any, username: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single();
  
  return !!data;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gender } = await req.json();

    if (!gender || !["male", "female", "lgbtq"].includes(gender)) {
      return new Response(
        JSON.stringify({ error: "Invalid gender. Must be 'male', 'female', or 'lgbtq'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate 3 unique usernames
    const usernames: string[] = [];
    const maxAttempts = 30; // Prevent infinite loops
    let attempts = 0;

    while (usernames.length < 3 && attempts < maxAttempts) {
      const candidate = generateUsername(gender);
      
      // Check if already in our list
      if (usernames.includes(candidate)) {
        attempts++;
        continue;
      }

      // Check if exists in database
      const exists = await checkUsernameExists(supabase, candidate);
      if (!exists) {
        usernames.push(candidate);
      }
      
      attempts++;
    }

    // If we couldn't generate 3 unique usernames, add timestamp-based fallbacks
    while (usernames.length < 3) {
      const timestamp = Date.now().toString().slice(-4);
      const fallback = generateUsername(gender).slice(0, -4) + timestamp;
      if (!usernames.includes(fallback)) {
        usernames.push(fallback);
      }
    }

    return new Response(
      JSON.stringify({ usernames }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating usernames:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate usernames" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
