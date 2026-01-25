-- SECURITY FIX 1: Prevent chat de-anonymization
-- Restrict direct access to chat_messages - force use of anonymous_messages view

-- Drop existing permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view non-expired messages" ON public.chat_messages;

-- Create restrictive policy: users can only see their OWN messages directly
-- Everyone else must use the anonymous_messages view
CREATE POLICY "Users can only view own messages directly"
ON public.chat_messages FOR SELECT
USING (auth.uid() = user_id);

-- SECURITY FIX 2: Prevent location history stalking
-- Add automatic cleanup of old check-ins and restrict historical queries

-- Create function to clean up old check-ins (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_checkins()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.check_ins 
  WHERE checked_in_at < (now() - INTERVAL '24 hours')
    AND is_active = false;
$$;

-- Create function to prevent historical location queries
-- Only allow viewing check-ins from last 4 hours
CREATE OR REPLACE FUNCTION public.is_recent_checkin(checkin_time timestamptz)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT checkin_time > (now() - INTERVAL '4 hours');
$$;

-- Update check_ins SELECT policy to only show recent check-ins
DROP POLICY IF EXISTS "Users can view own check_ins" ON public.check_ins;

CREATE POLICY "Users can view own recent check_ins"
ON public.check_ins FOR SELECT
USING (
  auth.uid() = user_id 
  AND checked_in_at > (now() - INTERVAL '4 hours')
);

-- Add policy comment for documentation
COMMENT ON POLICY "Users can view own recent check_ins" ON public.check_ins 
IS 'Prevents location history stalking by limiting visibility to last 4 hours';

-- Enable pg_cron extension check for automatic cleanup (if available)
-- Note: Actual scheduling would be done via Supabase dashboard or edge function