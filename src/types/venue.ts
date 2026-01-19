export type HotStreak = 
  | 'on_fire' 
  | 'popping_off' 
  | 'hottest_spot' 
  | 'rising_star' 
  | 'active' 
  | 'quiet';

export type PlaceType = 'social' | 'utility' | 'exclude';

export type Category = 
  | 'bar'
  | 'nightclub'
  | 'restaurant'
  | 'coffee'
  | 'entertainment'
  | 'brewery'
  | 'lounge'
  | 'sports_bar'
  | 'live_music';

export interface Venue {
  id: string;
  name: string;
  category: Category;
  place_type: PlaceType;
  hot_streak: HotStreak;
  current_crowd_count: number;
  latitude: number;
  longitude: number;
  address?: string;
  reactions: {
    lit: number;
    vibe: number;
    curious: number;
    dead: number;
  };
  vibe: {
    sound_level: 'quiet' | 'moderate' | 'loud' | 'very_loud';
    energy: 'chill' | 'lively' | 'electric';
    crowd_type: 'casual' | 'mixed' | 'dressed_up';
  };
  distance?: number; // in miles
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type ReactionType = 'lit' | 'vibe' | 'curious' | 'dead';
