import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { PlaceChat, PlaceChatDetails, ChatMessage, SenderLabel, ReportReason, UserStrike } from '@/components/chat/types';

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

interface VenueChatRow {
  id: string;
  venue_id: string;
  venue_name: string;
  category: string;
  created_at: string;
}

interface ChatMessageRow {
  id: string;
  venue_chat_id: string;
  sender_label: SenderLabel;
  content: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  expires_at: string;
}

export function useVenueChat(venueId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [venueChatId, setVenueChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [strikes, setStrikes] = useState<UserStrike[]>([]);

  // Check if user is banned
  const checkBanStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error: banError } = await supabase
        .from('user_chat_bans')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (banError) throw banError;
      
      if (data) {
        const isCurrentlyBanned = !data.expires_at || new Date(data.expires_at) > new Date();
        setIsBanned(isCurrentlyBanned);
      }
    } catch (err) {
      console.error('Error checking ban status:', err);
    }
  }, [user]);

  // Fetch user's strikes
  const fetchStrikes = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error: strikesError } = await supabase
        .from('user_strikes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (strikesError) throw strikesError;
      
      const mapped: UserStrike[] = (data || []).map((s: any) => ({
        id: s.id,
        reason: s.reason,
        status: s.status,
        strikeNumber: s.strike_number,
        createdAt: new Date(s.created_at),
      }));
      
      setStrikes(mapped);
    } catch (err) {
      console.error('Error fetching strikes:', err);
    }
  }, [user]);

  // Report a message
  const reportMessage = useCallback(async (
    messageId: string,
    reason: ReportReason,
    details?: string
  ): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to report messages');
      return false;
    }

    try {
      const { error: reportError } = await supabase
        .from('message_reports')
        .insert({
          message_id: messageId,
          reporter_id: user.id,
          reason: reason,
          details: details?.trim() || null,
        });

      if (reportError) {
        if (reportError.code === '23505') {
          setError('You have already reported this message');
        } else {
          throw reportError;
        }
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error reporting message:', err);
      setError('Failed to submit report');
      return false;
    }
  }, [user]);

  // Check ban status on mount
  useEffect(() => {
    checkBanStatus();
    fetchStrikes();
  }, [checkBanStatus, fetchStrikes]);

  // Get or create venue chat room
  const getOrCreateVenueChat = useCallback(async (
    venueId: string,
    venueName: string,
    category: string
  ): Promise<string | null> => {
    try {
      // Try to get existing chat
      const { data: existing, error: fetchError } = await supabase
        .from('venue_chats')
        .select('id')
        .eq('venue_id', venueId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        return existing.id;
      }

      // Create new chat room
      const { data: created, error: createError } = await supabase
        .from('venue_chats')
        .insert({
          venue_id: venueId,
          venue_name: venueName,
          category: category,
        })
        .select('id')
        .single();

      if (createError) throw createError;
      return created.id;
    } catch (err) {
      console.error('Error getting/creating venue chat:', err);
      setError('Failed to load chat room');
      return null;
    }
  }, []);

  // Fetch messages for a venue chat
  const fetchMessages = useCallback(async (chatId: string) => {
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('anonymous_messages')
        .select('*')
        .eq('venue_chat_id', chatId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      const mapped: ChatMessage[] = (data || []).map((row: ChatMessageRow) => ({
        id: row.id,
        content: row.content,
        senderLabel: row.sender_label,
        timestamp: new Date(row.created_at),
        upvotes: row.upvotes,
        downvotes: row.downvotes,
      }));

      setMessages(mapped);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a new message
  const sendMessage = useCallback(async (
    chatId: string,
    content: string,
    senderLabel: SenderLabel = 'someone_nearby'
  ): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to send messages');
      return false;
    }

    try {
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          venue_chat_id: chatId,
          user_id: user.id,
          content: content.trim(),
          sender_label: senderLabel,
        });

      if (insertError) throw insertError;
      return true;
    } catch (err: any) {
      console.error('Error sending message:', err);
      // Check for rate limit error
      if (err?.message?.includes('Rate limit exceeded') || err?.code === 'P0001') {
        setError('Slow down! Wait a moment before sending more messages.');
      } else {
        setError('Failed to send message');
      }
      return false;
    }
  }, [user]);

  // Vote on a message
  const voteMessage = useCallback(async (
    messageId: string,
    voteType: 'up' | 'down'
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get current votes
      const { data: current, error: fetchError } = await supabase
        .from('chat_messages')
        .select('upvotes, downvotes')
        .eq('id', messageId)
        .single();

      if (fetchError) throw fetchError;

      const updates = voteType === 'up'
        ? { upvotes: (current?.upvotes || 0) + 1 }
        : { downvotes: (current?.downvotes || 0) + 1 };

      const { error: updateError } = await supabase
        .from('chat_messages')
        .update(updates)
        .eq('id', messageId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error voting:', err);
      return false;
    }
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!venueChatId) return;

    const channel = supabase
      .channel(`chat-${venueChatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `venue_chat_id=eq.${venueChatId}`,
        },
        (payload) => {
          const row = payload.new as ChatMessageRow;
          const newMessage: ChatMessage = {
            id: row.id,
            content: row.content,
            senderLabel: row.sender_label,
            timestamp: new Date(row.created_at),
            upvotes: row.upvotes,
            downvotes: row.downvotes,
          };
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `venue_chat_id=eq.${venueChatId}`,
        },
        (payload) => {
          const row = payload.new as ChatMessageRow;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === row.id
                ? { ...msg, upvotes: row.upvotes, downvotes: row.downvotes }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [venueChatId]);

  return {
    messages,
    venueChatId,
    isLoading,
    error,
    isBanned,
    strikes,
    setVenueChatId,
    getOrCreateVenueChat,
    fetchMessages,
    sendMessage,
    voteMessage,
    reportMessage,
    checkBanStatus,
  };
}

// Hook to fetch active venue chats
export function useActiveVenueChats() {
  const [chats, setChats] = useState<PlaceChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        // Get venue chats with recent message counts
        const { data: venueChats, error: chatsError } = await supabase
          .from('venue_chats')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (chatsError) throw chatsError;

        // For each chat, get message count in last 10 minutes
        const chatsWithCounts = await Promise.all(
          (venueChats || []).map(async (vc: VenueChatRow) => {
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
            
            const { count } = await supabase
              .from('anonymous_messages')
              .select('*', { count: 'exact', head: true })
              .eq('venue_chat_id', vc.id)
              .gte('created_at', tenMinutesAgo);

            const style = getCategoryStyle(vc.category);
            const messageCount = count || 0;

            return {
              id: vc.id,
              placeName: vc.venue_name,
              category: vc.category,
              categoryEmoji: style.emoji,
              categoryColor: style.color,
              crowdStatus: messageCount > 15 ? 'busy' : messageCount > 5 ? 'active' : 'quiet',
              distance: 0.5, // Would need user location to calculate
              recentMessageCount: messageCount,
              lastActivity: new Date(vc.created_at),
            } as PlaceChat;
          })
        );

        // Sort by activity
        chatsWithCounts.sort((a, b) => b.recentMessageCount - a.recentMessageCount);
        setChats(chatsWithCounts);
      } catch (err) {
        console.error('Error fetching active chats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();

    // Refresh every 30 seconds
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { chats, isLoading };
}
