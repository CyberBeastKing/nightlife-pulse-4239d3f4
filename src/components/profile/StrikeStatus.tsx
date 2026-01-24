import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Shield, Ban, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Strike = Database['public']['Tables']['user_strikes']['Row'];

interface StrikeStatusProps {
  userId: string;
}

export function StrikeStatus({ userId }: StrikeStatusProps) {
  const [strikes, setStrikes] = useState<Strike[]>([]);
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStrikeData() {
      try {
        // Check ban status
        const { data: banData } = await supabase
          .from('user_chat_bans')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (banData) {
          const isCurrentlyBanned = !banData.expires_at || new Date(banData.expires_at) > new Date();
          setIsBanned(isCurrentlyBanned);
        }

        // Fetch strikes
        const { data: strikeData, error } = await supabase
          .from('user_strikes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStrikes(strikeData || []);
      } catch (error) {
        console.error('Error fetching strike data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStrikeData();
  }, [userId]);

  const strikeCount = strikes.filter(s => s.status === 'strike' || s.status === 'ban').length;
  const warningCount = strikes.filter(s => s.status === 'warning').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning': return 'bg-[hsl(var(--poi-bar)/0.2)] text-[hsl(var(--poi-bar))] border-[hsl(var(--poi-bar)/0.3)]';
      case 'strike': return 'bg-[hsl(var(--poi-bar-grill)/0.2)] text-[hsl(var(--poi-bar-grill))] border-[hsl(var(--poi-bar-grill)/0.3)]';
      case 'ban': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-secondary';
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      harassment: 'Harassment',
      spam: 'Spam',
      inappropriate_content: 'Inappropriate Content',
      threats: 'Threats',
      personal_info: 'Personal Info Sharing',
      other: 'Other'
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-secondary rounded w-32" />
          <div className="h-16 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        Community Standing
      </h3>

      {isBanned ? (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Ban className="w-8 h-8 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Account Restricted</p>
              <p className="text-sm text-muted-foreground">
                You've been banned from chat due to community guideline violations
              </p>
            </div>
          </div>
        </div>
      ) : strikeCount === 0 && warningCount === 0 ? (
        <div className="bg-[hsl(var(--poi-sports-venue)/0.1)] border border-[hsl(var(--poi-sports-venue)/0.3)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-[hsl(var(--poi-sports-venue))]" />
            <div>
              <p className="font-semibold text-[hsl(var(--poi-sports-venue))]">Good Standing</p>
              <p className="text-sm text-muted-foreground">
                You have no strikes or warnings. Keep it up!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Strike Summary */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[hsl(var(--poi-bar))]" />
                <span className="text-foreground font-medium">Strike Count</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      num <= strikeCount
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {strikeCount === 0 
                ? `${warningCount} warning(s) received`
                : `${strikeCount}/3 strikes - ${3 - strikeCount === 0 ? 'Next violation results in ban' : `${3 - strikeCount} remaining before ban`}`
              }
            </p>
          </div>

          {/* Strike History */}
          {strikes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Recent History</p>
              {strikes.slice(0, 3).map((strike) => (
                <div 
                  key={strike.id}
                  className="bg-secondary/30 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(strike.status)}>
                      {strike.status}
                    </Badge>
                    <span className="text-sm text-foreground">
                      {getReasonLabel(strike.reason)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(strike.created_at), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
