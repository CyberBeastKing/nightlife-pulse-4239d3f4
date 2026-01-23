import { Users, MapPin } from 'lucide-react';
import { FriendActivityCard, FriendActivity } from './cards/FriendActivityCard';
import { toast } from 'sonner';

// Mock friend activity - in production this comes from check_ins joined with users
const mockFriendActivity: FriendActivity[] = [
  {
    id: '1',
    friend: {
      id: 'u1',
      name: 'Sarah Miller',
      avatar_url: undefined,
    },
    venue: {
      id: 'v1',
      name: 'Crust & Cocktails',
      current_crowd_count: 34,
    },
    checked_in_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(), // 12 mins ago
    comment: 'Great vibe tonight! 🔥',
    distance: 1.2,
  },
  {
    id: '2',
    friend: {
      id: 'u2',
      name: 'Mike Johnson',
      avatar_url: undefined,
    },
    venue: {
      id: 'v2',
      name: 'The Bluestone',
      current_crowd_count: 52,
    },
    checked_in_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    distance: 0.8,
  },
  {
    id: '3',
    friend: {
      id: 'u3',
      name: 'Emily Chen',
      avatar_url: undefined,
    },
    venue: {
      id: 'v3',
      name: 'Mandrake Rooftop',
      current_crowd_count: 28,
    },
    checked_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    comment: 'Perfect rooftop weather 🌙',
    distance: 1.5,
  },
];

interface FriendsSectionProps {
  onVenueClick: (venueId: string) => void;
}

export function FriendsSection({ onVenueClick }: FriendsSectionProps) {
  // In production: const { data: friendActivity } = useFriendActivity(userId);
  const activities = mockFriendActivity;

  const handleJoin = (activity: FriendActivity) => {
    toast.success(`Navigating to ${activity.venue.name} to meet ${activity.friend.name.split(' ')[0]}!`);
    onVenueClick(activity.venue.id);
  };

  if (activities.length === 0) {
    return (
      <section className="mb-8 px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Where Your Friends Are</h2>
            <p className="text-xs text-muted-foreground">See who's out right now</p>
          </div>
        </div>
        
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-card/50 border border-border/30 text-center">
          <span className="text-4xl mb-3">👥</span>
          <h3 className="font-semibold text-foreground mb-1">None of your friends are out</h3>
          <p className="text-sm text-muted-foreground mb-4">Be the first to check in!</p>
          <button className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Find Places
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Where Your Friends Are</h2>
            <p className="text-xs text-muted-foreground">See who's out right now</p>
          </div>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">
          See all
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2">
        {activities.map((activity) => (
          <FriendActivityCard
            key={activity.id}
            activity={activity}
            onClick={() => onVenueClick(activity.venue.id)}
            onJoin={() => handleJoin(activity)}
          />
        ))}
      </div>
    </section>
  );
}
