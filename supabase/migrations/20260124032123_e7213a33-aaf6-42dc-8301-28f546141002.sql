-- Create check_ins table for tracking venue check-ins
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  venue_id TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '4 hours'),
  location_accuracy DOUBLE PRECISION, -- GPS accuracy in meters
  confidence_score DOUBLE PRECISION, -- 0.0 to 1.0
  is_automatic BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Users can view their own check-ins
CREATE POLICY "Users can view own check_ins"
ON public.check_ins
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create check-ins for themselves
CREATE POLICY "Users can create own check_ins"
ON public.check_ins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own check-ins (to mark inactive/expired)
CREATE POLICY "Users can update own check_ins"
ON public.check_ins
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for efficient venue queries
CREATE INDEX idx_check_ins_venue_id ON public.check_ins(venue_id);
CREATE INDEX idx_check_ins_user_active ON public.check_ins(user_id, is_active);
CREATE INDEX idx_check_ins_expires_at ON public.check_ins(expires_at);

-- Function to check if user has a recent check-in (cooldown enforcement)
CREATE OR REPLACE FUNCTION public.has_recent_checkin(target_user_id UUID, cooldown_minutes INTEGER DEFAULT 15)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.check_ins
    WHERE user_id = target_user_id
      AND checked_in_at > (now() - (cooldown_minutes || ' minutes')::INTERVAL)
  );
$$;

-- Function to calculate distance between two points in meters (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance_meters(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 6371000 * 2 * ASIN(
    SQRT(
      POWER(SIN(RADIANS(lat2 - lat1) / 2), 2) +
      COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
      POWER(SIN(RADIANS(lon2 - lon1) / 2), 2)
    )
  );
$$;

-- Function to validate and create a check-in
CREATE OR REPLACE FUNCTION public.validate_and_create_checkin(
  p_venue_id TEXT,
  p_venue_name TEXT,
  p_venue_lat DOUBLE PRECISION,
  p_venue_lon DOUBLE PRECISION,
  p_user_lat DOUBLE PRECISION,
  p_user_lon DOUBLE PRECISION,
  p_location_accuracy DOUBLE PRECISION DEFAULT NULL,
  p_is_automatic BOOLEAN DEFAULT false
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_distance DOUBLE PRECISION;
  v_confidence DOUBLE PRECISION;
  v_max_distance DOUBLE PRECISION := 30; -- 30 meters max
  v_cooldown_minutes INTEGER := 15;
  v_checkin_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated', 'code', 'AUTH_REQUIRED');
  END IF;

  -- Check cooldown
  IF public.has_recent_checkin(v_user_id, v_cooldown_minutes) THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Please wait before checking in again', 
      'code', 'COOLDOWN_ACTIVE',
      'cooldown_minutes', v_cooldown_minutes
    );
  END IF;

  -- Calculate distance
  v_distance := public.calculate_distance_meters(p_user_lat, p_user_lon, p_venue_lat, p_venue_lon);

  -- Check if within geofence
  IF v_distance > v_max_distance THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'You need to be inside this location to check in', 
      'code', 'TOO_FAR',
      'distance', v_distance,
      'max_distance', v_max_distance
    );
  END IF;

  -- Calculate confidence score (0.0 to 1.0)
  -- Higher confidence when closer and GPS is accurate
  v_confidence := GREATEST(0, 1.0 - (v_distance / v_max_distance));
  IF p_location_accuracy IS NOT NULL THEN
    -- Reduce confidence if GPS accuracy is poor (>20m)
    IF p_location_accuracy > 20 THEN
      v_confidence := v_confidence * 0.7;
    ELSIF p_location_accuracy > 10 THEN
      v_confidence := v_confidence * 0.85;
    END IF;
  END IF;

  -- Create the check-in
  INSERT INTO public.check_ins (
    user_id, venue_id, venue_name, latitude, longitude, 
    location_accuracy, confidence_score, is_automatic
  ) VALUES (
    v_user_id, p_venue_id, p_venue_name, p_user_lat, p_user_lon,
    p_location_accuracy, v_confidence, p_is_automatic
  )
  RETURNING id INTO v_checkin_id;

  RETURN json_build_object(
    'success', true, 
    'checkin_id', v_checkin_id,
    'confidence', v_confidence,
    'distance', v_distance
  );
END;
$$;

-- Enable realtime for check_ins
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;