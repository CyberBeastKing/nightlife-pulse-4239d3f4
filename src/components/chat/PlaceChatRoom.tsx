import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react';
import { CrowdSignals } from './CrowdSignals';
import { ChatMessage } from './ChatMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useVenueChat } from '@/hooks/useVenueChat';
import { useAuth } from '@/hooks/useAuth';
import type { PlaceChatDetails, SenderLabel } from './types';

interface PlaceChatRoomProps {
  chat: PlaceChatDetails;
  onBack: () => void;
}

export function PlaceChatRoom({ chat, onBack }: PlaceChatRoomProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const {
    messages,
    isLoading,
    error,
    setVenueChatId,
    getOrCreateVenueChat,
    fetchMessages,
    sendMessage,
    voteMessage,
  } = useVenueChat();

  // Initialize chat room
  useEffect(() => {
    const initChat = async () => {
      // Extract venue ID from chat id (format: "venue-{id}" or just the id)
      const venueId = chat.id.startsWith('venue-') ? chat.id.replace('venue-', '') : chat.id;
      
      const chatId = await getOrCreateVenueChat(venueId, chat.placeName, chat.category);
      if (chatId) {
        setVenueChatId(chatId);
        await fetchMessages(chatId);
      }
    };
    
    initChat();
  }, [chat.id, chat.placeName, chat.category, getOrCreateVenueChat, setVenueChatId, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    // Extract venue ID and get chat ID
    const venueId = chat.id.startsWith('venue-') ? chat.id.replace('venue-', '') : chat.id;
    const chatId = await getOrCreateVenueChat(venueId, chat.placeName, chat.category);
    
    if (!chatId) return;

    setIsSending(true);
    
    // Randomly assign a sender label for anonymity
    const labels: SenderLabel[] = ['someone_nearby', 'just_arrived', 'leaving_soon', 'regular'];
    const randomLabel = labels[Math.floor(Math.random() * labels.length)];
    
    const success = await sendMessage(chatId, message.trim(), randomLabel);
    
    if (success) {
      setMessage('');
    }
    
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVote = async (messageId: string, type: 'up' | 'down') => {
    await voteMessage(messageId, type);
  };

  // Combine real-time messages with any initial mock messages
  const displayMessages = messages.length > 0 ? messages : chat.messages;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="glass-strong px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">{chat.categoryEmoji}</span>
              <h1 className="font-semibold text-foreground truncate">{chat.placeName}</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              {chat.distance < 1 ? `${Math.round(chat.distance * 5280)} ft away` : `${chat.distance.toFixed(1)} mi away`}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Crowd signals at top */}
        <CrowdSignals
          crowdStatus={chat.crowdStatus}
          crowdCount={chat.crowdCount}
          activityTrend={chat.activityTrend}
          categoryColor={chat.categoryColor}
        />

        {/* System message */}
        <div className="flex items-center justify-center gap-2 py-3">
          <AlertCircle className="w-4 h-4 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground/70 text-center">
            Messages expire after 4 hours • Stay anonymous
          </span>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          {displayMessages.map(msg => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              onVote={handleVote}
            />
          ))}
        </div>

        {displayMessages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No messages yet</p>
            <p className="text-muted-foreground/70 text-xs mt-1">Be the first to share what's happening</p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="glass-strong border-t border-border/50 p-4 pb-safe">
        {user ? (
          <>
            <div className="flex items-end gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's the vibe right now?"
                className="min-h-[44px] max-h-[120px] resize-none bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                rows={1}
                maxLength={500}
                disabled={isSending}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                size="icon"
                className="shrink-0 h-11 w-11 rounded-full"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/50 mt-2 text-center">
              Rate-limited • No private messages • Place-focused
            </p>
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-muted-foreground text-sm">Sign in to join the conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
