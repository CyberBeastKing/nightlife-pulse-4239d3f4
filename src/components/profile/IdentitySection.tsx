import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MapPin, User, Pencil, Lock } from 'lucide-react';
import { MonsterAvatar, getVibeFromAvatar } from './MonsterAvatar';
import { AvatarStudio } from './AvatarStudio';
import { MONSTER_AVATARS, COLOR_THEMES, GLOW_EFFECTS } from '@/data/monsterAvatars';

interface Profile {
  id: string;
  username: string;
  gender: 'male' | 'female' | 'lgbtq';
  date_of_birth: string;
  avatar_url: string | null;
  created_at: string;
}

interface IdentitySectionProps {
  profile: Profile | null;
  isLocationActive: boolean;
  onProfileUpdated?: () => void;
}

function parseAvatarConfig(avatarUrl: string | null) {
  if (!avatarUrl) {
    return { monsterId: 'fuzzy', colorTheme: 'default', glowEffect: 'none' };
  }
  try {
    const config = JSON.parse(avatarUrl);
    if (config.type === 'monster') {
      return {
        monsterId: config.monsterId || 'fuzzy',
        colorTheme: config.colorTheme || 'default',
        glowEffect: config.glowEffect || 'none',
      };
    }
  } catch {
    // Not JSON, use defaults
  }
  return { monsterId: 'fuzzy', colorTheme: 'default', glowEffect: 'none' };
}

export function IdentitySection({ profile, isLocationActive, onProfileUpdated }: IdentitySectionProps) {
  const [studioOpen, setStudioOpen] = useState(false);
  const avatarConfig = useMemo(() => parseAvatarConfig(profile?.avatar_url || null), [profile?.avatar_url]);
  const vibeTag = getVibeFromAvatar(profile?.avatar_url || null);

  if (!profile) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Anonymous User</h2>
            <p className="text-sm text-muted-foreground">Complete your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex flex-col items-center gap-4">
        {/* Large centered monster avatar */}
        <MonsterAvatar 
          avatarUrl={profile.avatar_url} 
          username={profile.username}
          size="lg"
        />
        
        {/* Username with lock tooltip */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-bold text-foreground">
                    {profile.username}
                  </h2>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Username is permanent to protect your anonymous identity</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Vibe tag from monster */}
        {vibeTag && (
          <Badge variant="secondary" className="text-xs">
            {vibeTag}
          </Badge>
        )}

        {/* Status indicators */}
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`text-xs gap-1.5 ${
              isLocationActive 
                ? 'border-primary/30 text-primary bg-primary/10' 
                : 'border-muted text-muted-foreground'
            }`}
          >
            <MapPin className="w-3 h-3" />
            {isLocationActive ? 'Location contributing' : 'Location paused'}
          </Badge>
        </div>

        {/* Edit Profile Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 mt-2"
          onClick={() => setStudioOpen(true)}
        >
          <Pencil className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      {/* Avatar Studio Modal */}
      <AvatarStudio
        open={studioOpen}
        onOpenChange={setStudioOpen}
        userId={profile.id}
        currentConfig={avatarConfig}
        onSave={() => {
          onProfileUpdated?.();
        }}
      />
    </div>
  );
}
