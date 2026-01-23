import { MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface FriendActivity {
  id: string;
  friend: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  venue: {
    id: string;
    name: string;
    image_url?: string;
    current_crowd_count?: number;
  };
  checked_in_at: string;
  comment?: string;
  distance?: number;
}

interface FriendActivityCardProps {
  activity: FriendActivity;
  onClick: () => void;
  onJoin?: () => void;
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  return 'Yesterday';
}

export function FriendActivityCard({ activity, onClick, onJoin }: FriendActivityCardProps) {
  const distance = activity.distance ? `${activity.distance.toFixed(1)} mi` : null;
  const timeAgo = getTimeAgo(activity.checked_in_at);
  const initials = activity.friend.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[280px] text-left group"
    >
      <div className="overflow-hidden rounded-2xl bg-card border border-border/30 hover:border-primary/50 transition-all hover:scale-[1.02]">
        {/* Friend header */}
        <div className="flex items-center gap-3 p-3 border-b border-border/20">
          <Avatar className="w-10 h-10 border-2 border-primary/30">
            <AvatarImage src={activity.friend.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {activity.friend.name} <span className="font-normal text-muted-foreground">checked in</span>
            </p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
        </div>

        {/* Image area */}
        <div className="relative h-[140px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-secondary" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {activity.venue.name}
          </h3>
          
          {activity.comment && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2 italic">
              "{activity.comment}"
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {activity.venue.current_crowd_count || 20} people
            </span>
            {distance && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {distance}
              </span>
            )}
          </div>
          
          {/* CTA Button */}
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.();
            }}
            className="w-full bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold hover:opacity-90"
          >
            Join {activity.friend.name.split(' ')[0]}
          </Button>
        </div>
      </div>
    </button>
  );
}
