import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface Profile {
  id: string;
  username: string;
  gender: 'male' | 'female' | 'lgbtq';
  date_of_birth: string;
  avatar_url: string | null;
  created_at: string;
}

interface ProfileHeaderProps {
  profile: Profile | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  if (!profile) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Anonymous User</h2>
            <p className="text-sm text-muted-foreground">Complete your profile to unlock features</p>
          </div>
        </div>
      </div>
    );
  }

  const memberSince = format(new Date(profile.created_at), 'MMMM yyyy');
  
  const genderEmoji = {
    male: '♂️',
    female: '♀️',
    lgbtq: '🏳️‍🌈'
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20 border-2 border-primary/30">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
            {profile.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground truncate">
              {profile.username}
            </h2>
            <span className="text-lg">{genderEmoji[profile.gender]}</span>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Member since {memberSince}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
