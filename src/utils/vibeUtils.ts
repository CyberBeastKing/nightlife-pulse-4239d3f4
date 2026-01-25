import { Venue } from '@/types/venue';

// Sound level display mappings
export const SOUND_LEVEL_LABELS = {
  quiet: 'Quiet',
  moderate: 'Moderate',
  loud: 'Loud',
  very_loud: 'Very Loud'
} as const;

export const ENERGY_LABELS = {
  chill: 'Chill',
  lively: 'Lively',
  electric: 'Electric'
} as const;

export type SoundLevel = keyof typeof SOUND_LEVEL_LABELS;
export type EnergyLevel = keyof typeof ENERGY_LABELS;

/**
 * Normalizes vibe data from either string or object format
 * Returns a simple string label for sound level
 */
export function getVibeString(vibe: Venue['vibe']): string {
  if (typeof vibe === 'string') {
    return vibe || 'Moderate';
  }
  return SOUND_LEVEL_LABELS[vibe?.sound_level] || 'Moderate';
}

/**
 * Normalizes vibe data and returns both sound and energy labels
 * Useful for components that display both values
 */
export function getVibeDetails(vibe: Venue['vibe']): { sound: string; energy: string } {
  if (typeof vibe === 'string') {
    return { sound: 'Moderate', energy: vibe || 'Lively' };
  }
  return {
    sound: SOUND_LEVEL_LABELS[vibe?.sound_level] || 'Moderate',
    energy: ENERGY_LABELS[vibe?.energy] || 'Lively'
  };
}

/**
 * Normalizes vibe data for components that need the raw sound_level key
 * Returns a normalized vibe object with typed sound_level
 */
export function normalizeVibeData(vibe: Venue['vibe']): { sound_level: SoundLevel; energy: EnergyLevel } {
  if (typeof vibe === 'string') {
    const normalized = vibe.toLowerCase() as SoundLevel;
    return { 
      sound_level: SOUND_LEVEL_LABELS[normalized] ? normalized : 'moderate',
      energy: 'lively' 
    };
  }
  return {
    sound_level: vibe?.sound_level || 'moderate',
    energy: vibe?.energy || 'lively'
  };
}
