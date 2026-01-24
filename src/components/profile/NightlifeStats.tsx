import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, ThumbsUp, Clock, TrendingUp } from 'lucide-react';

interface NightlifeStatsProps {
  userId: string;
}

interface Stats {
  messagesPosted: number;
  totalUpvotes: number;
  venuesVisited: number;
  activeDays: number;
}

export function NightlifeStats({ userId }: NightlifeStatsProps) {
  const [stats, setStats] = useState<Stats>({
    messagesPosted: 0,
    totalUpvotes: 0,
    venuesVisited: 0,
    activeDays: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch message stats
        const { data: messages, error: msgError } = await supabase
          .from('chat_messages')
          .select('id, upvotes, venue_chat_id, created_at')
          .eq('user_id', userId);

        if (msgError) throw msgError;

        if (messages) {
          const messagesPosted = messages.length;
          const totalUpvotes = messages.reduce((sum, msg) => sum + (msg.upvotes || 0), 0);
          
          // Count unique venues
          const uniqueVenues = new Set(messages.map(m => m.venue_chat_id));
          const venuesVisited = uniqueVenues.size;
          
          // Count unique active days
          const uniqueDays = new Set(
            messages.map(m => new Date(m.created_at).toDateString())
          );
          const activeDays = uniqueDays.size;

          setStats({
            messagesPosted,
            totalUpvotes,
            venuesVisited,
            activeDays
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId]);

  const statItems = [
    {
      icon: MessageCircle,
      label: 'Messages',
      value: stats.messagesPosted,
      color: 'text-primary'
    },
    {
      icon: ThumbsUp,
      label: 'Upvotes',
      value: stats.totalUpvotes,
      color: 'text-accent'
    },
    {
      icon: TrendingUp,
      label: 'Venues',
      value: stats.venuesVisited,
      color: 'text-[hsl(var(--poi-lounge))]'
    },
    {
      icon: Clock,
      label: 'Active Days',
      value: stats.activeDays,
      color: 'text-[hsl(var(--poi-bar))]'
    }
  ];

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Nightlife Stats
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item) => (
          <div 
            key={item.label}
            className="bg-secondary/50 rounded-xl p-4 text-center"
          >
            <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
            <p className="text-2xl font-bold text-foreground">
              {loading ? '—' : item.value}
            </p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
