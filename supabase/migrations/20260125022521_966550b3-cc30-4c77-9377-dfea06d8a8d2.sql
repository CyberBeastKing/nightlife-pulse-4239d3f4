-- Venue correction reports with voting system
CREATE TABLE public.venue_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL, -- References places_overture(id)
  user_id UUID NOT NULL,
  
  -- What's being corrected
  correction_type TEXT NOT NULL CHECK (correction_type IN ('name', 'location', 'address', 'category', 'phone', 'website', 'closed')),
  
  -- The correction data
  old_value TEXT,
  new_value TEXT,
  new_latitude DOUBLE PRECISION, -- For location corrections
  new_longitude DOUBLE PRECISION,
  
  -- Voting & consensus
  matching_correction_hash TEXT NOT NULL, -- Hash to group identical corrections
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'auto_applied')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  applied_by TEXT -- 'auto' or admin user_id
);

-- Track which users voted for which corrections
CREATE TABLE public.correction_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correction_id UUID NOT NULL REFERENCES public.venue_corrections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(correction_id, user_id) -- One vote per user per correction
);

-- Photo submissions (admin moderated, no voting)
CREATE TABLE public.venue_photo_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL,
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID
);

-- User contribution stats for gamification and anti-spam
CREATE TABLE public.user_contributions (
  user_id UUID PRIMARY KEY,
  corrections_submitted INTEGER NOT NULL DEFAULT 0,
  corrections_approved INTEGER NOT NULL DEFAULT 0,
  photos_submitted INTEGER NOT NULL DEFAULT 0,
  photos_approved INTEGER NOT NULL DEFAULT 0,
  contribution_points INTEGER NOT NULL DEFAULT 0,
  first_contribution_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.venue_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correction_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_photo_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for venue_corrections
CREATE POLICY "Anyone can view pending and applied corrections"
ON public.venue_corrections FOR SELECT
USING (status IN ('pending', 'auto_applied', 'approved'));

CREATE POLICY "Authenticated users can submit corrections"
ON public.venue_corrections FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for correction_votes
CREATE POLICY "Anyone can view votes"
ON public.correction_votes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can vote"
ON public.correction_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for venue_photo_submissions
CREATE POLICY "Users can view approved photos"
ON public.venue_photo_submissions FOR SELECT
USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can submit photos"
ON public.venue_photo_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_contributions
CREATE POLICY "Users can view all contribution stats"
ON public.user_contributions FOR SELECT
USING (true);

CREATE POLICY "System can manage contribution stats"
ON public.user_contributions FOR ALL
USING (auth.uid() = user_id);

-- Rate limiting function: max 10 corrections per 24 hours
CREATE OR REPLACE FUNCTION public.can_submit_correction(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) < 10
  FROM public.venue_corrections
  WHERE user_id = p_user_id
    AND created_at > (NOW() - INTERVAL '24 hours');
$$;

-- Function to check correction threshold and auto-apply
CREATE OR REPLACE FUNCTION public.check_correction_threshold()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_correction RECORD;
  v_vote_count INTEGER;
BEGIN
  -- Get the correction details
  SELECT * INTO v_correction
  FROM public.venue_corrections
  WHERE id = NEW.correction_id;
  
  -- Count total votes for this correction
  SELECT COUNT(*) INTO v_vote_count
  FROM public.correction_votes
  WHERE correction_id = NEW.correction_id;
  
  -- Check if threshold reached (10 votes)
  IF v_vote_count >= 10 AND v_correction.status = 'pending' THEN
    -- Apply the correction based on type
    IF v_correction.correction_type = 'name' THEN
      UPDATE public.places_overture 
      SET name = v_correction.new_value,
          updated_at = NOW()
      WHERE id = v_correction.venue_id;
      
    ELSIF v_correction.correction_type = 'location' THEN
      UPDATE public.places_overture 
      SET latitude = v_correction.new_latitude,
          longitude = v_correction.new_longitude,
          updated_at = NOW()
      WHERE id = v_correction.venue_id;
      
    ELSIF v_correction.correction_type = 'address' THEN
      UPDATE public.places_overture 
      SET address = v_correction.new_value,
          updated_at = NOW()
      WHERE id = v_correction.venue_id;
      
    ELSIF v_correction.correction_type = 'category' THEN
      UPDATE public.places_overture 
      SET category = v_correction.new_value,
          updated_at = NOW()
      WHERE id = v_correction.venue_id;
      
    ELSIF v_correction.correction_type = 'phone' THEN
      UPDATE public.places_overture 
      SET phone = v_correction.new_value,
          updated_at = NOW()
      WHERE id = v_correction.venue_id;
      
    ELSIF v_correction.correction_type = 'website' THEN
      UPDATE public.places_overture 
      SET website = v_correction.new_value,
          updated_at = NOW()
      WHERE id = v_correction.venue_id;
    END IF;
    
    -- Mark correction as auto-applied
    UPDATE public.venue_corrections
    SET status = 'auto_applied',
        applied_at = NOW(),
        applied_by = 'auto'
    WHERE id = NEW.correction_id;
    
    -- Update contributor stats for all voters
    INSERT INTO public.user_contributions (user_id, corrections_approved, contribution_points, first_contribution_at, updated_at)
    SELECT cv.user_id, 1, 10, NOW(), NOW()
    FROM public.correction_votes cv
    WHERE cv.correction_id = NEW.correction_id
    ON CONFLICT (user_id) DO UPDATE SET
      corrections_approved = user_contributions.corrections_approved + 1,
      contribution_points = user_contributions.contribution_points + 10,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to check threshold after each vote
CREATE TRIGGER auto_apply_correction_trigger
AFTER INSERT ON public.correction_votes
FOR EACH ROW
EXECUTE FUNCTION public.check_correction_threshold();

-- Function to update user contribution stats on new submission
CREATE OR REPLACE FUNCTION public.update_contribution_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_contributions (user_id, corrections_submitted, contribution_points, first_contribution_at, updated_at)
  VALUES (NEW.user_id, 1, 1, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    corrections_submitted = user_contributions.corrections_submitted + 1,
    contribution_points = user_contributions.contribution_points + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Trigger for new correction submissions
CREATE TRIGGER update_stats_on_correction
AFTER INSERT ON public.venue_corrections
FOR EACH ROW
EXECUTE FUNCTION public.update_contribution_stats();

-- Indexes for performance
CREATE INDEX idx_venue_corrections_venue_id ON public.venue_corrections(venue_id);
CREATE INDEX idx_venue_corrections_hash ON public.venue_corrections(matching_correction_hash);
CREATE INDEX idx_venue_corrections_status ON public.venue_corrections(status);
CREATE INDEX idx_correction_votes_correction_id ON public.correction_votes(correction_id);
CREATE INDEX idx_venue_photo_submissions_venue_id ON public.venue_photo_submissions(venue_id);
CREATE INDEX idx_venue_photo_submissions_status ON public.venue_photo_submissions(status);