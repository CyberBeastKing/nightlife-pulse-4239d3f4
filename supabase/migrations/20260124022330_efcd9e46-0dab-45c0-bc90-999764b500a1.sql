-- Create user settings table for persistent preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  -- Location settings
  contribute_location BOOLEAN NOT NULL DEFAULT true,
  -- Privacy settings
  block_place_suggestions BOOLEAN NOT NULL DEFAULT false,
  hide_from_join_prompts BOOLEAN NOT NULL DEFAULT false,
  mute_venue_chats BOOLEAN NOT NULL DEFAULT false,
  -- Preferences
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  vibe_preference INTEGER NOT NULL DEFAULT 50 CHECK (vibe_preference >= 0 AND vibe_preference <= 100),
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own settings
CREATE POLICY "Users can view own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own settings
CREATE POLICY "Users can create own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create settings on profile creation
CREATE OR REPLACE FUNCTION public.create_user_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create settings when profile is created
CREATE TRIGGER create_settings_on_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.create_user_settings();