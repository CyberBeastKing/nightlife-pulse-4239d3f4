import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilters } from '@/components/CategoryFilters';
import { MapView } from '@/components/MapView';
import { BottomNav } from '@/components/BottomNav';
import { Moon } from 'lucide-react';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'map' | 'discover' | 'chat' | 'profile'>('map');
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-shrink-0 px-4 pt-safe pb-2 space-y-3">
        {/* Logo Row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Moon className="w-7 h-7 text-primary" />
            <h1 className="text-xl font-bold text-gradient-brand">HAWKLY</h1>
          </div>
          <div className="text-xs text-muted-foreground">
            🌙 Find the action
          </div>
        </div>
        
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search bars, clubs, restaurants..."
        />
        
        {/* Category Filters */}
        <CategoryFilters
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </header>
      
      {/* Map View */}
      <main className="flex-1 min-h-0">
        {activeTab === 'map' && (
          <MapView
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
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
