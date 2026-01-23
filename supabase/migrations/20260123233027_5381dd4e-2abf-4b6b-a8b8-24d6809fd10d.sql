-- Rate limiting function: check if user has exceeded message limit
-- Limit: 5 messages per minute per user
CREATE OR REPLACE FUNCTION public.check_chat_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  message_count INTEGER;
  rate_limit INTEGER := 5;  -- Max messages per window
  time_window INTERVAL := '1 minute';  -- Time window
BEGIN
  -- Count messages from this user in the time window
  SELECT COUNT(*)
  INTO message_count
  FROM public.chat_messages
  WHERE user_id = NEW.user_id
    AND created_at > (now() - time_window);

  -- If limit exceeded, reject the insert
  IF message_count >= rate_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before sending more messages.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to enforce rate limiting before insert
CREATE TRIGGER enforce_chat_rate_limit
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_chat_rate_limit();

-- Also add a trigger to prevent content modification after creation (only votes can be updated)
CREATE OR REPLACE FUNCTION public.prevent_message_content_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow upvotes/downvotes to be changed, not content
  IF OLD.content != NEW.content THEN
    RAISE EXCEPTION 'Message content cannot be modified after posting.'
      USING ERRCODE = 'P0001';
  END IF;
  
  IF OLD.sender_label != NEW.sender_label THEN
    RAISE EXCEPTION 'Sender label cannot be modified.'
      USING ERRCODE = 'P0001';
  END IF;
  
  IF OLD.user_id != NEW.user_id THEN
    RAISE EXCEPTION 'User ID cannot be modified.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_message_modification
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_message_content_change();