-- =============================================================================
-- SECURITY FIX 1: Add security_invoker to anonymous_messages view
-- This ensures the view respects RLS policies of the calling user
-- =============================================================================

-- Drop and recreate the view with security_invoker enabled
DROP VIEW IF EXISTS public.anonymous_messages;

CREATE VIEW public.anonymous_messages
WITH (security_invoker = on)
AS
SELECT 
  id,
  venue_chat_id,
  content,
  sender_label,
  upvotes,
  downvotes,
  created_at,
  expires_at
  -- NOTE: user_id is intentionally excluded to preserve anonymity
FROM public.chat_messages
WHERE expires_at > now();

-- Grant access to authenticated users
GRANT SELECT ON public.anonymous_messages TO authenticated;

-- =============================================================================
-- SECURITY FIX 2: Restrict profiles table SELECT policy
-- Hide date_of_birth by only allowing users to see their own full profile
-- Others must use the public_profiles view
-- =============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all public profiles" ON public.profiles;

-- Users can only see their own full profile (with date_of_birth)
-- This policy already exists: "Users can view own profile"
-- Just ensure it's the only SELECT policy

-- Recreate public_profiles view with security_invoker if not already set
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on)
AS
SELECT 
  id,
  username,
  avatar_url,
  gender,
  created_at
  -- NOTE: date_of_birth is intentionally excluded for privacy
FROM public.profiles;

-- Grant public read access to the safe view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- =============================================================================
-- SECURITY FIX 3: Restrict user_contributions visibility
-- Users can only see their own contribution stats
-- =============================================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all contribution stats" ON public.user_contributions;

-- Users can only view their own contribution stats
CREATE POLICY "Users can view own contribution stats"
ON public.user_contributions
FOR SELECT
USING (auth.uid() = user_id);

-- =============================================================================
-- SECURITY FIX 4: Remove recipient_phone from location_sharing
-- Phone numbers should not be stored in plaintext
-- =============================================================================

-- First, ensure no code depends on this column, then remove it
-- We'll set all existing values to NULL first for safety
UPDATE public.location_sharing SET recipient_phone = NULL WHERE recipient_phone IS NOT NULL;

-- Drop the column entirely to prevent future misuse
ALTER TABLE public.location_sharing DROP COLUMN IF EXISTS recipient_phone;