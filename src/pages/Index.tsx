import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapView } from '@/components/MapView';
import { BottomNav } from '@/components/BottomNav';
import { DiscoverView } from '@/components/discover/DiscoverView';
import { ChatView } from '@/components/chat/ChatView';
import { ProfileView } from '@/components/profile/ProfileView';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { OfflineOverlay } from '@/components/OfflineOverlay';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { useExternalVenues } from '@/hooks/useExternalVenues';
import { useAutoCheckIn } from '@/hooks/useAutoCheckIn';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Venue } from '@/types/venue';

const Index = () => {
  const [searchParams] = useSearchParams();
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const { user } = useAuth();
  const { updateSetting } = useUserSettings();
  const { data: venueData } = useExternalVenues();
  const { isOnline, checkConnection } = useNetworkStatus();
  
  // Initialize automatic check-in detection
  useAutoCheckIn(venueData?.venues ?? []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'map' | 'discover' | 'chat' | 'profile'>('map');
  const [chatVenue, setChatVenue] = useState<Venue | null>(null);

  // Handle tab param from URL (e.g., after accepting invite)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['map', 'discover', 'chat', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam as 'map' | 'discover' | 'chat' | 'profile');
    }
  }, [searchParams]);

  const handleOnboardingComplete = async (fullLocation: boolean) => {
    completeOnboarding(fullLocation);
    
    // If user is logged in, also save to their settings
    if (user) {
      await updateSetting('contributeLocation', fullLocation);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleNavigateToMapFromDiscover = (venue: Venue) => {
    // Switch to map tab and set up to show this venue
    setActiveTab('map');
    setSearchQuery(venue.name);
    // Add venue's category to selected if not already
    if (venue.category) {
      setSelectedCategories(prev => new Set([...prev, venue.category]));
    }
  };

  const handleOpenVenueChat = (venue: Venue) => {
    // Switch to chat tab and open this venue's chat room
    setChatVenue(venue);
    setActiveTab('chat');
  };

  // Clear chat venue when leaving chat tab
  const handleTabChange = (tab: 'map' | 'discover' | 'chat' | 'profile') => {
    if (tab !== 'chat') {
      setChatVenue(null);
    }
    setActiveTab(tab);
  };

  // Show onboarding for first-time users
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Offline overlay */}
      {!isOnline && <OfflineOverlay onRetry={checkConnection} />}

      {/* Full-bleed Map with floating UI */}
      <main className="flex-1 min-h-0 relative">
        {activeTab === 'map' && (
          <MapView
            searchQuery={searchQuery}
            selectedCategories={selectedCategories}
            onSearchChange={setSearchQuery}
            onCategoryToggle={handleCategoryToggle}
            onOpenVenueChat={handleOpenVenueChat}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverView onNavigateToMap={handleNavigateToMapFromDiscover} />
        )}

        {activeTab === 'chat' && (
          <ChatView initialVenue={chatVenue} />
        )}

        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;
