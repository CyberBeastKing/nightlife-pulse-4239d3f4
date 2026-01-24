import { useAuth } from '@/hooks/useAuth';
import { useUserSettings } from '@/hooks/useUserSettings';
import { IdentitySection } from './IdentitySection';
import { LocationTransparencyPanel } from './LocationTransparencyPanel';
import { LocationControlsSection } from './LocationControlsSection';
import { PrivacySafetySection } from './PrivacySafetySection';
import { PreferencesSection } from './PreferencesSection';
import { DataTransparencySection } from './DataTransparencySection';
import { CommunityStandingSection } from './CommunityStandingSection';
import { SignOutButton } from './SignOutButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfileView() {
  const { user, profile, loading: authLoading } = useAuth();
  const { settings, loading: settingsLoading, updateSetting } = useUserSettings();
  const navigate = useNavigate();

  const loading = authLoading || settingsLoading;

  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-background">
        <div className="p-6 space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
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
            Sign in to access your control center, manage location settings, and customize your experience
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
        {/* Identity - Low Emphasis */}
        <IdentitySection 
          profile={profile} 
          isLocationActive={settings.contributeLocation}
        />
        
        {/* Community Standing - Only shows if strikes/ban */}
        <CommunityStandingSection userId={user.id} />
        
        {/* Location Transparency Panel - MOST IMPORTANT */}
        <LocationTransparencyPanel 
          isLocationContributing={settings.contributeLocation}
          isBackgroundActive={settings.contributeLocation}
        />
        
        {/* Location Controls */}
        <LocationControlsSection
          contributeLocation={settings.contributeLocation}
          setContributeLocation={(value) => updateSetting('contributeLocation', value)}
          autoCheckinEnabled={settings.autoCheckinEnabled}
          setAutoCheckinEnabled={(value) => updateSetting('autoCheckinEnabled', value)}
        />
        
        {/* Privacy & Safety */}
        <PrivacySafetySection
          blockPlaceSuggestions={settings.blockPlaceSuggestions}
          setBlockPlaceSuggestions={(value) => updateSetting('blockPlaceSuggestions', value)}
          hideFromJoinPrompts={settings.hideFromJoinPrompts}
          setHideFromJoinPrompts={(value) => updateSetting('hideFromJoinPrompts', value)}
          muteVenueChats={settings.muteVenueChats}
          setMuteVenueChats={(value) => updateSetting('muteVenueChats', value)}
        />
        
        {/* Preferences */}
        <PreferencesSection
          pushNotifications={settings.pushNotifications}
          setPushNotifications={(value) => updateSetting('pushNotifications', value)}
          vibePreference={settings.vibePreference}
          setVibePreference={(value) => updateSetting('vibePreference', value)}
        />
        
        {/* About Hawkly - Data Transparency */}
        <DataTransparencySection />
        
        {/* Sign Out */}
        <SignOutButton />
      </div>
    </div>
  );
}
