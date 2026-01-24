import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UserSettings {
  contributeLocation: boolean;
  blockPlaceSuggestions: boolean;
  hideFromJoinPrompts: boolean;
  muteVenueChats: boolean;
  pushNotifications: boolean;
  vibePreference: number;
}

const defaultSettings: UserSettings = {
  contributeLocation: true,
  blockPlaceSuggestions: false,
  hideFromJoinPrompts: false,
  muteVenueChats: false,
  pushNotifications: true,
  vibePreference: 50,
};

interface UseUserSettingsReturn {
  settings: UserSettings;
  loading: boolean;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export function useUserSettings(): UseUserSettingsReturn {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no settings exist, create them
        if (error.code === 'PGRST116') {
          const { data: newSettings, error: insertError } = await supabase
            .from('user_settings')
            .insert({ user_id: user.id })
            .select()
            .single();

          if (insertError) throw insertError;
          
          if (newSettings) {
            setSettings({
              contributeLocation: newSettings.contribute_location,
              blockPlaceSuggestions: newSettings.block_place_suggestions,
              hideFromJoinPrompts: newSettings.hide_from_join_prompts,
              muteVenueChats: newSettings.mute_venue_chats,
              pushNotifications: newSettings.push_notifications,
              vibePreference: newSettings.vibe_preference,
            });
          }
        } else {
          throw error;
        }
      } else if (data) {
        setSettings({
          contributeLocation: data.contribute_location,
          blockPlaceSuggestions: data.block_place_suggestions,
          hideFromJoinPrompts: data.hide_from_join_prompts,
          muteVenueChats: data.mute_venue_chats,
          pushNotifications: data.push_notifications,
          vibePreference: data.vibe_preference,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(async <K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ) => {
    if (!user) return;

    // Optimistic update
    setSettings(prev => ({ ...prev, [key]: value }));

    // Map camelCase to snake_case
    const columnMap: Record<keyof UserSettings, string> = {
      contributeLocation: 'contribute_location',
      blockPlaceSuggestions: 'block_place_suggestions',
      hideFromJoinPrompts: 'hide_from_join_prompts',
      muteVenueChats: 'mute_venue_chats',
      pushNotifications: 'push_notifications',
      vibePreference: 'vibe_preference',
    };

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ [columnMap[key]]: value })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('Failed to save setting');
      // Revert on error
      fetchSettings();
    }
  }, [user, fetchSettings]);

  return {
    settings,
    loading,
    updateSetting,
    refreshSettings: fetchSettings,
  };
}
