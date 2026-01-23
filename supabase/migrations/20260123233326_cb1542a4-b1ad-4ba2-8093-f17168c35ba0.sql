-- Create enum for report reasons
CREATE TYPE public.report_reason AS ENUM (
  'harassment',
  'spam',
  'inappropriate_content',
  'threats',
  'personal_info',
  'other'
);

-- Create enum for strike status
CREATE TYPE public.strike_status AS ENUM ('warning', 'strike', 'ban');

-- Create message_reports table
CREATE TABLE public.message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason report_reason NOT NULL,
  details TEXT,
  reviewed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Prevent duplicate reports from same user
  UNIQUE(message_id, reporter_id)
);

-- Create user_strikes table
CREATE TABLE public.user_strikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  reason report_reason NOT NULL,
  status strike_status NOT NULL DEFAULT 'warning',
  strike_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_chat_bans table
CREATE TABLE public.user_chat_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = permanent
  reason TEXT
);

-- Create indexes
CREATE INDEX idx_message_reports_message_id ON public.message_reports(message_id);
CREATE INDEX idx_message_reports_reviewed ON public.message_reports(reviewed) WHERE reviewed = false;
CREATE INDEX idx_user_strikes_user_id ON public.user_strikes(user_id);
CREATE INDEX idx_user_chat_bans_user_id ON public.user_chat_bans(user_id);

-- Enable RLS
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_strikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chat_bans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_reports
CREATE POLICY "Users can report messages"
ON public.message_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
ON public.message_reports
FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

-- RLS Policies for user_strikes (users can only see their own)
CREATE POLICY "Users can view their own strikes"
ON public.user_strikes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for user_chat_bans
CREATE POLICY "Users can check their ban status"
ON public.user_chat_bans
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Function to get user's current strike count
CREATE OR REPLACE FUNCTION public.get_user_strike_count(target_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.user_strikes
  WHERE user_id = target_user_id
    AND status IN ('strike', 'ban');
$$;

-- Function to check if user is banned from chat
CREATE OR REPLACE FUNCTION public.is_user_chat_banned(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_chat_bans
    WHERE user_id = target_user_id
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- Update rate limit trigger to also check ban status
CREATE OR REPLACE FUNCTION public.check_chat_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  message_count INTEGER;
  rate_limit INTEGER := 5;
  time_window INTERVAL := '1 minute';
BEGIN
  -- First check if user is banned
  IF public.is_user_chat_banned(NEW.user_id) THEN
    RAISE EXCEPTION 'You are banned from chat due to community guideline violations.'
      USING ERRCODE = 'P0002';
  END IF;

  -- Then check rate limit
  SELECT COUNT(*)
  INTO message_count
  FROM public.chat_messages
  WHERE user_id = NEW.user_id
    AND created_at > (now() - time_window);

  IF message_count >= rate_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before sending more messages.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

-- Function to process a report and potentially issue strikes
-- This would typically be called by moderators or an automated system
CREATE OR REPLACE FUNCTION public.process_report_and_issue_strike(
  report_id UUID,
  issue_strike BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id UUID;
  v_offender_id UUID;
  v_reason report_reason;
  v_current_strikes INTEGER;
  v_new_status strike_status;
BEGIN
  -- Get report details
  SELECT mr.message_id, cm.user_id, mr.reason
  INTO v_message_id, v_offender_id, v_reason
  FROM public.message_reports mr
  JOIN public.chat_messages cm ON cm.id = mr.message_id
  WHERE mr.id = report_id;

  -- Mark report as reviewed
  UPDATE public.message_reports
  SET reviewed = true
  WHERE id = report_id;

  IF issue_strike THEN
    -- Get current strike count
    v_current_strikes := public.get_user_strike_count(v_offender_id);
    
    -- Determine new status based on strike count
    IF v_current_strikes >= 2 THEN
      v_new_status := 'ban';
    ELSIF v_current_strikes >= 1 THEN
      v_new_status := 'strike';
    ELSE
      v_new_status := 'warning';
    END IF;

    -- Insert the strike
    INSERT INTO public.user_strikes (user_id, message_id, reason, status, strike_number)
    VALUES (v_offender_id, v_message_id, v_reason, v_new_status, v_current_strikes + 1);

    -- If 3rd strike, ban the user
    IF v_current_strikes >= 2 THEN
      INSERT INTO public.user_chat_bans (user_id, reason)
      VALUES (v_offender_id, 'Banned after 3 strikes for community guideline violations')
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;
END;
$$;