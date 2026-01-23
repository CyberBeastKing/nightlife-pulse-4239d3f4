import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { CrowdSignals } from './CrowdSignals';
import { ChatMessage } from './ChatMessage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { PlaceChatDetails } from './types';

interface PlaceChatRoomProps {
  chat: PlaceChatDetails;
  onBack: () => void;
}

export function PlaceChatRoom({ chat, onBack }: PlaceChatRoomProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(chat.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    // Add message locally (in real app, this would go to backend)
    const newMessage = {
      id: `msg-${Date.now()}`,
      content: message.trim(),
      senderLabel: 'just_arrived' as const,
      timestamp: new Date(),
      upvotes: 0,
      downvotes: 0,
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

        {/* Messages */}
        <div className="space-y-4">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>

        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No messages yet</p>
            <p className="text-muted-foreground/70 text-xs mt-1">Be the first to share what's happening</p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="glass-strong border-t border-border/50 p-4 pb-safe">
        <div className="flex items-end gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's the vibe right now?"
            className="min-h-[44px] max-h-[120px] resize-none bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="shrink-0 h-11 w-11 rounded-full"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground/50 mt-2 text-center">
          Rate-limited • No private messages • Place-focused
        </p>
      </div>
    </div>
  );
}
