import { useState } from 'react';
import { MapView } from '@/components/MapView';
import { BottomNav } from '@/components/BottomNav';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'map' | 'discover' | 'chat' | 'profile'>('map');

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Full-bleed Map with floating UI */}
      <main className="flex-1 min-h-0 relative">
        {activeTab === 'map' && (
          <MapView
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
          />
        )}

        {activeTab === 'discover' && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center p-8">
              <span className="text-5xl mb-4 block">🔥</span>
              <h2 className="text-xl font-semibold mb-2">Discover</h2>
              <p>AI-powered recommendations coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center p-8">
              <span className="text-5xl mb-4 block">💬</span>
              <h2 className="text-xl font-semibold mb-2">Chat</h2>
              <p>Connect with friends coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center p-8">
              <span className="text-5xl mb-4 block">👤</span>
              <h2 className="text-xl font-semibold mb-2">Profile</h2>
              <p>Your nightlife stats coming soon</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
