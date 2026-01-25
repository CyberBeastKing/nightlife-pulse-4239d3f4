-- GDPR Compliance: Allow users to delete their own settings
CREATE POLICY "Users can delete own settings"
ON public.user_settings FOR DELETE
USING (auth.uid() = user_id);