// Centralized Hawkly POI Category System
// Used across venue cards, markers, and filters

export interface CategoryStyle {
  emoji: string;
  label: string;
  color: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  bar: { emoji: '🍺', label: 'Bar', color: '#FFB020' },
  nightclub: { emoji: '🪩', label: 'Nightclub', color: '#8B5CF6' },
  restaurant: { emoji: '🍽️', label: 'Restaurant', color: '#EF4444' },
  coffee: { emoji: '☕', label: 'Coffee Shop', color: '#A16207' },
  entertainment: { emoji: '🎭', label: 'Entertainment', color: '#38BDF8' },
  brewery: { emoji: '🍻', label: 'Brewery', color: '#FFB020' },
  lounge: { emoji: '🍸', label: 'Lounge', color: '#2DD4BF' },
  sports_bar: { emoji: '🏈', label: 'Sports Bar', color: '#FB923C' },
  live_music: { emoji: '🎵', label: 'Live Music', color: '#8B5CF6' },
  bar_grill: { emoji: '🍔', label: 'Bar & Grill', color: '#FB923C' },
  events: { emoji: '🎟️', label: 'Events', color: '#EC4899' },
  sports_venue: { emoji: '🏟️', label: 'Sports Venue', color: '#22C55E' },
  venue: { emoji: '📍', label: 'Venue', color: '#64748B' }, // fallback
};

// Get category style with fallback
export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.venue;
}

// Normalize category string for lookup
export function normalizeCategory(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, '_')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
