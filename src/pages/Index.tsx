import { useState } from 'react';
import { MapView } from '@/components/MapView';
import { BottomNav } from '@/components/BottomNav';
import { DiscoverView } from '@/components/discover/DiscoverView';
import { ChatView } from '@/components/chat/ChatView';
import { ProfileView } from '@/components/profile/ProfileView';
import { Venue } from '@/types/venue';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'map' | 'discover' | 'chat' | 'profile'>('map');
  const [chatVenue, setChatVenue] = useState<Venue | null>(null);

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

  return (
    <div className="flex flex-col h-screen bg-background">
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
