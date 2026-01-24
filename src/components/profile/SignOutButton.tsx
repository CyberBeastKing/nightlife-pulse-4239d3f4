import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export function SignOutButton() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
      
      <p className="text-center text-xs text-muted-foreground">
        Hawkly v1.0.0
      </p>
    </div>
  );
}
