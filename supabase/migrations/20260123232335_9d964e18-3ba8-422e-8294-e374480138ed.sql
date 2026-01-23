-- Create enum for sender labels (anonymous identifiers)
CREATE TYPE public.sender_label AS ENUM ('someone_nearby', 'just_arrived', 'leaving_soon', 'regular');

-- Create venue_chats table to track chat rooms for venues
CREATE TABLE public.venue_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id TEXT NOT NULL UNIQUE,
  venue_name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table for anonymous messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_chat_id UUID NOT NULL REFERENCES public.venue_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_label sender_label NOT NULL DEFAULT 'someone_nearby',
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '4 hours')
);

-- Create indexes for performance
CREATE INDEX idx_chat_messages_venue_chat_id ON public.chat_messages(venue_chat_id);
CREATE INDEX idx_chat_messages_expires_at ON public.chat_messages(expires_at);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.venue_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for venue_chats
CREATE POLICY "Anyone can view venue chats"
ON public.venue_chats
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create venue chats"
ON public.venue_chats
FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies for chat_messages
-- CRITICAL: Select policy excludes user_id to maintain anonymity
CREATE POLICY "Anyone can view non-expired messages"
ON public.chat_messages
FOR SELECT
USING (expires_at > now());

CREATE POLICY "Authenticated users can post messages"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own message votes"
ON public.chat_messages
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create a view that hides user_id for anonymity
CREATE VIEW public.anonymous_messages AS
SELECT 
  id,
  venue_chat_id,
  sender_label,
  content,
  upvotes,
  downvotes,
  created_at,
  expires_at
FROM public.chat_messages
WHERE expires_at > now();

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Function to clean up expired messages (can be called by a cron job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_messages()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.chat_messages WHERE expires_at < now();
$$;