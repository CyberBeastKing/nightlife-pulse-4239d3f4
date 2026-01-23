import { useState, useMemo } from 'react';
import { MessageCircle, Filter, Clock } from 'lucide-react';
import { PlaceChatCard } from './PlaceChatCard';
import { PlaceChatRoom } from './PlaceChatRoom';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PlaceChat, PlaceChatDetails } from './types';

// Mock data for active place chats
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
  {
    id: 'chat-4',
    placeName: 'The Velvet Lounge',
    category: 'lounge',
    categoryEmoji: '🛋️',
    categoryColor: '#2DD4BF',
    crowdStatus: 'quiet',
    distance: 1.2,
    recentMessageCount: 4,
    lastActivity: new Date(Date.now() - 15 * 60000),
  },
  {
    id: 'chat-5',
    placeName: 'Stadium Sports Bar',
    category: 'sports_bar',
    categoryEmoji: '🏟️',
    categoryColor: '#22C55E',
    crowdStatus: 'active',
    distance: 1.5,
    recentMessageCount: 8,
    lastActivity: new Date(Date.now() - 8 * 60000),
  },
];

// Mock chat details with messages
const getMockChatDetails = (chat: PlaceChat): PlaceChatDetails => ({
  ...chat,
  activityTrend: chat.crowdStatus === 'busy' ? 'rising' : chat.crowdStatus === 'active' ? 'steady' : 'falling',
  crowdCount: chat.crowdStatus === 'busy' ? '25-35 people' : chat.crowdStatus === 'active' ? '12-18 people' : '5-8 people',
  messages: [
    {
      id: 'msg-1',
      content: 'DJ just switched genres, vibes are immaculate',
      senderLabel: 'someone_nearby',
      timestamp: new Date(Date.now() - 10 * 60000),
      upvotes: 5,
      downvotes: 0,
    },
    {
      id: 'msg-2',
      content: 'Line moving fast now',
      senderLabel: 'just_arrived',
      timestamp: new Date(Date.now() - 8 * 60000),
      upvotes: 3,
      downvotes: 0,
    },
    {
      id: 'msg-3',
      content: 'Upstairs is packed, downstairs way better',
      senderLabel: 'regular',
      timestamp: new Date(Date.now() - 5 * 60000),
      upvotes: 8,
      downvotes: 1,
    },
    {
      id: 'msg-4',
      content: 'Chill crowd tonight, definitely recommend',
      senderLabel: 'leaving_soon',
      timestamp: new Date(Date.now() - 2 * 60000),
      upvotes: 2,
      downvotes: 0,
    },
  ],
});

// Mock recently participated chats
const mockMyChats: PlaceChat[] = [
  mockPlaceChats[0],
  mockPlaceChats[2],
];

export function ChatView() {
  const [selectedChat, setSelectedChat] = useState<PlaceChatDetails | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  // Sort active chats by activity
  const sortedChats = useMemo(() => {
    return [...mockPlaceChats].sort((a, b) => b.recentMessageCount - a.recentMessageCount);
  }, []);

  const handleOpenChat = (chat: PlaceChat) => {
    const details = getMockChatDetails(chat);
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
          {/* Active Place Chats */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground">Active Places</h2>
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
          </section>

          {/* My Active Chats */}
          {mockMyChats.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">Recently Participated</h2>
              </div>
              <div className="space-y-3">
                {mockMyChats.map(chat => (
                  <PlaceChatCard
                    key={`my-${chat.id}`}
                    chat={chat}
                    onClick={() => handleOpenChat(chat)}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground/70 mt-2 text-center">
                Auto-expires after 4 hours
              </p>
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
