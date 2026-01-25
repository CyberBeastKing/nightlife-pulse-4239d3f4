-- GDPR Account Deletion: Secure function to delete all user data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Delete from all user tables (order matters for foreign keys)
  DELETE FROM public.message_reports WHERE reporter_id = v_user_id;
  DELETE FROM public.correction_votes WHERE user_id = v_user_id;
  DELETE FROM public.venue_corrections WHERE user_id = v_user_id;
  DELETE FROM public.venue_photo_submissions WHERE user_id = v_user_id;
  DELETE FROM public.chat_messages WHERE user_id = v_user_id;
  DELETE FROM public.user_strikes WHERE user_id = v_user_id;
  DELETE FROM public.user_chat_bans WHERE user_id = v_user_id;
  DELETE FROM public.check_ins WHERE user_id = v_user_id;
  DELETE FROM public.location_sharing WHERE sharer_id = v_user_id OR recipient_id = v_user_id;
  DELETE FROM public.user_contributions WHERE user_id = v_user_id;
  DELETE FROM public.user_settings WHERE user_id = v_user_id;
  DELETE FROM public.profiles WHERE id = v_user_id;

  RETURN json_build_object('success', true, 'message', 'Account data deleted');
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;