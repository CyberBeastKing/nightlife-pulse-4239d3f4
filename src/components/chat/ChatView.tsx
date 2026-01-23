import { useState, useMemo, useEffect } from 'react';
import { MessageCircle, Filter, Clock, Loader2 } from 'lucide-react';
import { PlaceChatCard } from './PlaceChatCard';
import { PlaceChatRoom } from './PlaceChatRoom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActiveVenueChats } from '@/hooks/useVenueChat';
import type { PlaceChat, PlaceChatDetails } from './types';
import { Venue } from '@/types/venue';

// Hawkly POI styling lookup
const CATEGORY_STYLES: Record<string, { emoji: string; color: string }> = {
  bar: { emoji: '🍺', color: '#FFB020' },
  bars: { emoji: '🍺', color: '#FFB020' },
  nightclub: { emoji: '🎵', color: '#8B5CF6' },
  nightclubs: { emoji: '🎵', color: '#8B5CF6' },
  clubs: { emoji: '🎵', color: '#8B5CF6' },
  lounge: { emoji: '🛋️', color: '#2DD4BF' },
  lounges: { emoji: '🛋️', color: '#2DD4BF' },
  bar_grill: { emoji: '🍔', color: '#FB923C' },
  restaurant: { emoji: '🍽️', color: '#EF4444' },
  food: { emoji: '🍽️', color: '#EF4444' },
  coffee: { emoji: '☕', color: '#A16207' },
  brewery: { emoji: '🍺', color: '#FFB020' },
  sports_bar: { emoji: '🏟️', color: '#22C55E' },
  live_music: { emoji: '🎵', color: '#8B5CF6' },
  events: { emoji: '🎟️', color: '#EC4899' },
  entertainment: { emoji: '🎬', color: '#38BDF8' },
  sports_venue: { emoji: '🏟️', color: '#22C55E' },
};

const getCategoryStyle = (category: string) => {
  const normalized = category?.toLowerCase().replace(/[^a-z0-9]+/g, '_') || '';
  return CATEGORY_STYLES[normalized] || { emoji: '📍', color: '#9CA3AF' };
};

interface ChatViewProps {
  initialVenue?: Venue | null;
}

// Fallback mock data for when no real chats exist
const mockPlaceChats: PlaceChat[] = [
  {
    id: 'chat-1',
    placeName: 'Bluestone Lane',
    category: 'coffee',
    categoryEmoji: '☕',
    categoryColor: '#A16207',
    crowdStatus: 'busy',
    distance: 0.2,
    recentMessageCount: 18,
    lastActivity: new Date(Date.now() - 2 * 60000),
  },
  {
    id: 'chat-2',
    placeName: 'The Rooftop Bar',
    category: 'bar',
    categoryEmoji: '🍺',
    categoryColor: '#FFB020',
    crowdStatus: 'active',
    distance: 0.5,
    recentMessageCount: 12,
    lastActivity: new Date(Date.now() - 5 * 60000),
  },
  {
    id: 'chat-3',
    placeName: 'Neon Nightclub',
    category: 'nightclub',
    categoryEmoji: '🎵',
    categoryColor: '#8B5CF6',
    crowdStatus: 'busy',
    distance: 0.8,
    recentMessageCount: 34,
    lastActivity: new Date(Date.now() - 1 * 60000),
  },
];

// Get chat details for display
const getChatDetails = (chat: PlaceChat): PlaceChatDetails => ({
  ...chat,
  activityTrend: chat.crowdStatus === 'busy' ? 'rising' : chat.crowdStatus === 'active' ? 'steady' : 'falling',
  crowdCount: chat.crowdStatus === 'busy' ? '25-35 people' : chat.crowdStatus === 'active' ? '12-18 people' : '5-8 people',
  messages: [],
});

export function ChatView({ initialVenue }: ChatViewProps) {
  const [selectedChat, setSelectedChat] = useState<PlaceChatDetails | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  
  // Fetch real active chats from database
  const { chats: realChats, isLoading } = useActiveVenueChats();

  // Handle initial venue from map popup chat button
  useEffect(() => {
    if (initialVenue) {
      const style = getCategoryStyle(initialVenue.category);
      const venueChat: PlaceChat = {
        id: `venue-${initialVenue.id}`,
        placeName: initialVenue.name,
        category: initialVenue.category,
        categoryEmoji: style.emoji,
        categoryColor: style.color,
        crowdStatus: initialVenue.current_crowd_count > 20 ? 'busy' : initialVenue.current_crowd_count > 8 ? 'active' : 'quiet',
        distance: initialVenue.distance || 0.5,
        recentMessageCount: Math.floor(Math.random() * 20) + 5,
        lastActivity: new Date(),
      };
      const details = getChatDetails(venueChat);
      setSelectedChat(details);
    }
  }, [initialVenue]);

  // Use real chats if available, otherwise fallback to mock
  const displayChats = useMemo(() => {
    if (realChats.length > 0) return realChats;
    return mockPlaceChats;
  }, [realChats]);

  // Sort by activity
  const sortedChats = useMemo(() => {
    return [...displayChats].sort((a, b) => b.recentMessageCount - a.recentMessageCount);
  }, [displayChats]);

  const handleOpenChat = (chat: PlaceChat) => {
    const details = getChatDetails(chat);
    setSelectedChat(details);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  // Show chat room if one is selected
  if (selectedChat) {
    return <PlaceChatRoom chat={selectedChat} onBack={handleCloseChat} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-strong px-4 py-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-foreground">Chat</h1>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
          >
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Live conversations happening nearby
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Active Place Chats */}
          {!isLoading && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-foreground">Active Places</h2>
                {realChats.length > 0 && (
                  <span className="text-xs text-muted-foreground">• Live</span>
                )}
              </div>
              <div className="space-y-3">
                {sortedChats.map(chat => (
                  <PlaceChatCard
                    key={chat.id}
                    chat={chat}
                    onClick={() => handleOpenChat(chat)}
                  />
                ))}
              </div>
              {sortedChats.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No active chats nearby. Start one from a venue!
                </p>
              )}
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
