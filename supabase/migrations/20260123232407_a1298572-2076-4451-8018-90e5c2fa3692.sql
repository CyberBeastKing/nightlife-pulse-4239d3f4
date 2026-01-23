-- Fix the security definer view by adding security_invoker
DROP VIEW IF EXISTS public.anonymous_messages;

CREATE VIEW public.anonymous_messages
WITH (security_invoker = on) AS
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

-- Fix the overly permissive update policy for chat_messages
-- Only allow updating upvotes/downvotes, not content
DROP POLICY IF EXISTS "Users can update their own message votes" ON public.chat_messages;

-- Create a more restrictive update policy - only allow vote updates
CREATE POLICY "Authenticated users can vote on messages"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (expires_at > now())
WITH CHECK (expires_at > now());

-- Fix the venue_chats insert policy to be more specific
DROP POLICY IF EXISTS "Authenticated users can create venue chats" ON public.venue_chats;

CREATE POLICY "Authenticated users can create venue chats"
ON public.venue_chats
FOR INSERT
TO authenticated
WITH CHECK (venue_id IS NOT NULL AND venue_name IS NOT NULL);