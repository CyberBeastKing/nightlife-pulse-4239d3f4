import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SharedUser {
  id: string;
  recipientId: string | null;
  recipientPhone: string | null;
  username: string | null;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  isMutual: boolean;
}

interface LocationSharingHook {
  sharedUsers: SharedUser[];
  loading: boolean;
  createInvite: () => Promise<{ token: string; message: string } | null>;
  removeSharing: (sharingId: string) => Promise<boolean>;
  refreshSharing: () => Promise<void>;
}

export function useLocationSharing(): LocationSharingHook {
  const { user } = useAuth();
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSharedUsers = useCallback(async () => {
    if (!user) {
      setSharedUsers([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch sharing relationships where user is the sharer
      const { data: sharingData, error } = await supabase
        .from('location_sharing')
        .select('*')
        .eq('sharer_id', user.id);

      if (error) throw error;

      // Get profile info for recipients
      const recipientIds = sharingData
        ?.filter(s => s.recipient_id)
        .map(s => s.recipient_id) || [];

      let profilesMap: Record<string, string> = {};
      
      if (recipientIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', recipientIds);
        
        profiles?.forEach(p => {
          profilesMap[p.id] = p.username;
        });
      }

      // Check for mutual sharing (recipient also shares with sharer)
      const mutualCheck = await Promise.all(
        sharingData?.map(async (sharing) => {
          if (!sharing.recipient_id) return false;
          
          const { data } = await supabase
            .from('location_sharing')
            .select('id')
            .eq('sharer_id', sharing.recipient_id)
            .eq('recipient_id', user.id)
            .eq('status', 'accepted')
            .single();
          
          return !!data;
        }) || []
      );

      const users: SharedUser[] = sharingData?.map((sharing, index) => ({
        id: sharing.id,
        recipientId: sharing.recipient_id,
        recipientPhone: sharing.recipient_phone,
        username: sharing.recipient_id ? profilesMap[sharing.recipient_id] || null : null,
        status: sharing.status as 'pending' | 'accepted' | 'declined',
        createdAt: sharing.created_at,
        isMutual: mutualCheck[index] || false,
      })) || [];

      setSharedUsers(users);
    } catch (error) {
      console.error('Error fetching shared users:', error);
      toast.error('Failed to load shared users');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSharedUsers();
  }, [fetchSharedUsers]);

  const createInvite = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to share your location');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('location_sharing')
        .insert({
          sharer_id: user.id,
          status: 'pending',
        })
        .select('invite_token')
        .single();

      if (error) throw error;

      // Use the current origin for the invite link
      const baseUrl = window.location.origin;
      const inviteLink = `${baseUrl}/accept-invite?token=${data.invite_token}`;
      const message = `Hey! I'm sharing my live location with you on Hawkly. Tap to accept: ${inviteLink}`;

      await fetchSharedUsers();
      
      return { token: data.invite_token, message };
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error('Failed to create invite');
      return null;
    }
  }, [user, fetchSharedUsers]);

  const removeSharing = useCallback(async (sharingId: string) => {
    if (!user) return false;

    try {
      // Get the sharing record first to find recipient
      const { data: sharing } = await supabase
        .from('location_sharing')
        .select('recipient_id')
        .eq('id', sharingId)
        .single();

      // Delete the forward sharing (user -> recipient)
      const { error: deleteError } = await supabase
        .from('location_sharing')
        .delete()
        .eq('id', sharingId);

      if (deleteError) throw deleteError;

      // Also delete reverse sharing (recipient -> user) if exists
      if (sharing?.recipient_id) {
        await supabase
          .from('location_sharing')
          .delete()
          .eq('sharer_id', sharing.recipient_id)
          .eq('recipient_id', user.id);
      }

      toast.success('Location sharing stopped');
      await fetchSharedUsers();
      return true;
    } catch (error) {
      console.error('Error removing sharing:', error);
      toast.error('Failed to remove sharing');
      return false;
    }
  }, [user, fetchSharedUsers]);

  return {
    sharedUsers,
    loading,
    createInvite,
    removeSharing,
    refreshSharing: fetchSharedUsers,
  };
}
