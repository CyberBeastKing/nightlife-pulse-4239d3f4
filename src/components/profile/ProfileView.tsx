import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProfileHeader } from './ProfileHeader';
import { NightlifeStats } from './NightlifeStats';
import { StrikeStatus } from './StrikeStatus';
import { SettingsSection } from './SettingsSection';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfileView() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-background">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-background">
        <div className="text-center space-y-4">
          <span className="text-6xl block">🌙</span>
          <h2 className="text-2xl font-bold text-foreground">Join the Night</h2>
          <p className="text-muted-foreground max-w-xs">
            Sign in to track your nightlife adventures, view your stats, and connect with venues
          </p>
          <Button 
            onClick={() => navigate('/auth')} 
            className="mt-4 gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 pb-24 space-y-6">
        <ProfileHeader profile={profile} />
        <NightlifeStats userId={user.id} />
        <StrikeStatus userId={user.id} />
        <SettingsSection />
      </div>
    </div>
  );
}
