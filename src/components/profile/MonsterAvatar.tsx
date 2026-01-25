import { useMemo } from 'react';
import { MONSTER_AVATARS, COLOR_THEMES, GLOW_EFFECTS, getDefaultMonster } from '@/data/monsterAvatars';
import { User } from 'lucide-react';

interface AvatarConfig {
  type: 'monster';
  monsterId: string;
  colorTheme: string;
  glowEffect: string;
}

interface MonsterAvatarProps {
  avatarUrl: string | null;
  username: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function parseAvatarConfig(avatarUrl: string | null): AvatarConfig | null {
  if (!avatarUrl) return null;
  
  try {
    const config = JSON.parse(avatarUrl);
    if (config.type === 'monster') {
      return config as AvatarConfig;
    }
  } catch {
    // Not a JSON config, might be legacy URL
  }
  return null;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-28 h-28',
};

export function MonsterAvatar({ avatarUrl, username, size = 'md', className = '' }: MonsterAvatarProps) {
  const config = useMemo(() => parseAvatarConfig(avatarUrl), [avatarUrl]);
  
  const monster = config 
    ? MONSTER_AVATARS.find(m => m.id === config.monsterId) || getDefaultMonster()
    : getDefaultMonster();
    
  const colorTheme = config 
    ? COLOR_THEMES.find(c => c.id === config.colorTheme) || COLOR_THEMES[0]
    : COLOR_THEMES[0];
    
  const glowEffect = config 
    ? GLOW_EFFECTS.find(g => g.id === config.glowEffect) || GLOW_EFFECTS[0]
    : GLOW_EFFECTS[0];

  // If no config and no avatarUrl, show default monster
  const showMonster = config || !avatarUrl;

  if (!showMonster && avatarUrl) {
    // Legacy: show uploaded image (shouldn't happen after migration)
    return (
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-secondary flex items-center justify-center ${className}`}
      >
        <img 
          src={avatarUrl} 
          alt={username}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default monster on error
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-secondary/50 border-2 border-primary/30 ${className}`}
      style={{ boxShadow: glowEffect.shadow }}
    >
      <img 
        src={monster.image} 
        alt={monster.name}
        className="w-full h-full object-cover"
        style={{ filter: colorTheme.filter }}
      />
    </div>
  );
}

export function getVibeFromAvatar(avatarUrl: string | null): string | null {
  const config = parseAvatarConfig(avatarUrl);
  if (!config) return null;
  
  const monster = MONSTER_AVATARS.find(m => m.id === config.monsterId);
  return monster?.vibe || null;
}
