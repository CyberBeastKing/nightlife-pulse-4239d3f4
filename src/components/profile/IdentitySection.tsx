import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, User } from 'lucide-react';

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
}

export function IdentitySection({ profile, isLocationActive }: IdentitySectionProps) {
  if (!profile) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Anonymous User</h2>
            <p className="text-sm text-muted-foreground">Complete your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-4">
        {/* Icon-based avatar - subtle, not photos */}
        <Avatar className="w-16 h-16 border border-border">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-secondary text-muted-foreground text-xl">
            {profile.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-foreground truncate">
            {profile.username}
          </h2>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 mt-2">
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
        </div>
      </div>
    </div>
  );
}
