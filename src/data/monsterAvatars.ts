// Monster avatar system for Hawkly profiles
import monster1 from '@/assets/monsters/monster-1.png';
import monster2 from '@/assets/monsters/monster-2.png';
import monster3 from '@/assets/monsters/monster-3.png';
import monster4 from '@/assets/monsters/monster-4.png';
import monster5 from '@/assets/monsters/monster-5.png';

export interface MonsterAvatar {
  id: string;
  name: string;
  image: string;
  vibe: string;
}

export const MONSTER_AVATARS: MonsterAvatar[] = [
  { id: 'fuzzy', name: 'Fuzzy', image: monster1, vibe: 'Party Mode' },
  { id: 'spike', name: 'Spike', image: monster2, vibe: 'DJ Vibes' },
  { id: 'mellow', name: 'Mellow', image: monster3, vibe: 'Lowkey' },
  { id: 'wisp', name: 'Wisp', image: monster4, vibe: 'Late Night' },
  { id: 'ember', name: 'Ember', image: monster5, vibe: 'VIP Energy' },
];

export const COLOR_THEMES = [
  { id: 'default', name: 'Default', filter: '' },
  { id: 'neon', name: 'Neon', filter: 'hue-rotate(30deg) saturate(1.3)' },
  { id: 'cool', name: 'Cool', filter: 'hue-rotate(-30deg) saturate(1.1)' },
  { id: 'warm', name: 'Warm', filter: 'hue-rotate(15deg) sepia(0.2)' },
  { id: 'midnight', name: 'Midnight', filter: 'hue-rotate(-60deg) brightness(0.9)' },
];

export const GLOW_EFFECTS = [
  { id: 'none', name: 'None', shadow: '' },
  { id: 'subtle', name: 'Subtle', shadow: '0 0 20px hsl(var(--primary) / 0.4)' },
  { id: 'electric', name: 'Electric', shadow: '0 0 30px hsl(var(--primary) / 0.6), 0 0 60px hsl(var(--primary) / 0.3)' },
  { id: 'pulse', name: 'Pulse', shadow: '0 0 25px hsl(280 80% 60% / 0.5)' },
];

export function getMonsterById(id: string): MonsterAvatar | undefined {
  return MONSTER_AVATARS.find(m => m.id === id);
}

export function getDefaultMonster(): MonsterAvatar {
  return MONSTER_AVATARS[0];
}
