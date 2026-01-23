-- Create gender enum for username generation
CREATE TYPE public.gender_identity AS ENUM ('male', 'female', 'lgbtq');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  gender gender_identity NOT NULL,
  date_of_birth DATE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is 21+
CREATE OR REPLACE FUNCTION public.is_over_21(dob DATE)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dob <= (CURRENT_DATE - INTERVAL '21 years')::DATE;
$$;

-- RLS Policies for profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Users can insert their own profile (with age check)
CREATE POLICY "Users can create own profile if 21+"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid() 
  AND public.is_over_21(date_of_birth)
);

-- Users can update own profile BUT NOT username (enforced via trigger)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Users can delete own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (id = auth.uid());

-- Prevent username changes after creation
CREATE OR REPLACE FUNCTION public.prevent_username_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.username IS NOT NULL AND NEW.username != OLD.username THEN
    RAISE EXCEPTION 'Username cannot be changed after creation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_username_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_username_change();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Public view for displaying user info to others (friends feature later)
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  gender,
  avatar_url,
  created_at
FROM public.profiles;

-- RLS for the view is inherited from base table
-- Additional policy for viewing other users' public profiles (for friends feature)
CREATE POLICY "Users can view all public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);