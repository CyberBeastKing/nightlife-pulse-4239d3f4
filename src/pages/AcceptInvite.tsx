import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';

type InviteStatus = 'loading' | 'valid' | 'invalid' | 'expired' | 'accepted' | 'error' | 'needs-auth';

interface InviteData {
  id: string;
  sharerId: string;
  sharerUsername: string | null;
  status: string;
}

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [status, setStatus] = useState<InviteStatus>('loading');
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (authLoading) return;
    
    if (!token) {
      setStatus('invalid');
      return;
    }

    validateInvite();
  }, [token, authLoading, user]);

  const validateInvite = async () => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    try {
      // Find the invite by token
      const { data: invite, error } = await supabase
        .from('location_sharing')
        .select('id, sharer_id, status, recipient_id')
        .eq('invite_token', token)
        .maybeSingle();

      if (error) throw error;

      if (!invite) {
        setStatus('invalid');
        return;
      }

      // Check if already accepted
      if (invite.status === 'accepted' && invite.recipient_id) {
        setStatus('accepted');
        return;
      }

      // Check if user is trying to accept their own invite
      if (user && invite.sharer_id === user.id) {
        setStatus('invalid');
        toast.error("You can't accept your own invite");
        return;
      }

      // Get sharer's username
      const { data: sharerProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', invite.sharer_id)
        .maybeSingle();

      setInviteData({
        id: invite.id,
        sharerId: invite.sharer_id,
        sharerUsername: sharerProfile?.username || null,
        status: invite.status,
      });

      // If user is not logged in, they need to sign in first
      if (!user) {
        setStatus('needs-auth');
        return;
      }

      setStatus('valid');
    } catch (error) {
      console.error('Error validating invite:', error);
      setStatus('error');
    }
  };

  const handleAcceptInvite = async () => {
    if (!user || !inviteData) return;

    setIsAccepting(true);

    try {
      // Update the original invite with recipient info
      const { error: updateError } = await supabase
        .from('location_sharing')
        .update({
          recipient_id: user.id,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', inviteData.id);

      if (updateError) throw updateError;

      // Create reverse sharing (recipient shares with sharer)
      const { error: reverseError } = await supabase
        .from('location_sharing')
        .insert({
          sharer_id: user.id,
          recipient_id: inviteData.sharerId,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        });

      // Ignore duplicate error for reverse sharing
      if (reverseError && reverseError.code !== '23505') {
        throw reverseError;
      }

      toast.success('Location sharing activated!');
      setStatus('accepted');
      
      // Redirect to profile after short delay
      setTimeout(() => {
        navigate('/?tab=profile');
      }, 2000);
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Failed to accept invite');
      setStatus('error');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleSignIn = () => {
    // Store the current URL to redirect back after auth
    sessionStorage.setItem('redirectAfterAuth', window.location.href);
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Validating invite...</p>
          </div>
        )}

        {status === 'needs-auth' && inviteData && (
          <div className="glass rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Location Sharing Invite</h1>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {inviteData.sharerUsername || 'Someone'}
                </span>{' '}
                wants to share their location with you on Hawkly
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Sign in or create an account to accept this invite
              </p>
              <Button onClick={handleSignIn} className="w-full gap-2">
                <LogIn className="w-4 h-4" />
                Sign In to Accept
              </Button>
            </div>
          </div>
        )}

        {status === 'valid' && inviteData && (
          <div className="glass rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Accept Location Sharing?</h1>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {inviteData.sharerUsername || 'Someone'}
                </span>{' '}
                wants to share their location with you
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 text-left space-y-2">
              <p className="text-sm text-muted-foreground">By accepting:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  You'll see their live location
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  They'll see your live location
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Either of you can stop sharing anytime
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Decline
              </Button>
              <Button
                onClick={handleAcceptInvite}
                disabled={isAccepting}
                className="flex-1 gap-2"
              >
                {isAccepting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Accept
              </Button>
            </div>
          </div>
        )}

        {status === 'accepted' && (
          <div className="glass rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">You're Connected!</h1>
              <p className="text-muted-foreground">
                Location sharing is now active. You can manage shared locations in your profile.
              </p>
            </div>
            <Button onClick={() => navigate('/?tab=profile')} className="w-full">
              Go to Profile
            </Button>
          </div>
        )}

        {status === 'invalid' && (
          <div className="glass rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Invalid Invite</h1>
              <p className="text-muted-foreground">
                This invite link is invalid or has already been used.
              </p>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              Go Home
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="glass rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Something Went Wrong</h1>
              <p className="text-muted-foreground">
                We couldn't process this invite. Please try again or ask for a new invite.
              </p>
            </div>
            <Button onClick={() => validateInvite()} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
