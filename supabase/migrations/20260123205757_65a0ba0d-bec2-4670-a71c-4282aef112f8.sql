-- Drop the insecure view and recreate with security_invoker
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT 
  id,
  username,
  gender,
  avatar_url,
  created_at
FROM public.profiles;