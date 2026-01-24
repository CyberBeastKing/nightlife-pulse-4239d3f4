import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface CommunityStandingSectionProps {
  userId: string;
}

export function CommunityStandingSection({ userId }: CommunityStandingSectionProps) {
  const [strikeCount, setStrikeCount] = useState(0);
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStanding = async () => {
      try {
        // Check ban status
        const { data: banData } = await supabase
          .from('user_chat_bans')
          .select('*')
          .eq('user_id', userId)
          .or('expires_at.is.null,expires_at.gt.now()')
          .maybeSingle();
        
        setIsBanned(!!banData);

        // Get strike count
        const { data: strikes } = await supabase
          .from('user_strikes')
          .select('*')
          .eq('user_id', userId);
        
        setStrikeCount(strikes?.length || 0);
      } catch (error) {
        console.error('Error fetching community standing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStanding();
  }, [userId]);

  if (loading) {
    return <Skeleton className="h-20 w-full rounded-2xl" />;
  }

  // Don't show section if user has good standing
  if (!isBanned && strikeCount === 0) {
    return null;
  }

  return (
    <div className={`glass rounded-2xl p-4 border ${
      isBanned 
        ? 'border-destructive/30 bg-destructive/5' 
        : strikeCount >= 2 
          ? 'border-accent/30 bg-accent/5' 
          : 'border-border'
    }`}>
      <div className="flex items-start gap-3">
        {isBanned ? (
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-accent" />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-foreground">
              {isBanned ? 'Chat Access Suspended' : 'Community Standing'}
            </p>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                isBanned 
                  ? 'border-destructive/30 text-destructive' 
                  : 'border-accent/30 text-accent'
              }`}
            >
              {isBanned ? 'Banned' : `${strikeCount}/3 Strikes`}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {isBanned 
              ? 'You have been banned from chat due to community guideline violations.'
              : `You have received ${strikeCount} warning${strikeCount > 1 ? 's' : ''} for chat behavior. At 3 strikes, chat access is suspended.`
            }
          </p>
          
          {!isBanned && (
            <div className="flex gap-1 mt-2">
              {[1, 2, 3].map((num) => (
                <div 
                  key={num}
                  className={`w-8 h-2 rounded-full ${
                    num <= strikeCount 
                      ? 'bg-accent' 
                      : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
