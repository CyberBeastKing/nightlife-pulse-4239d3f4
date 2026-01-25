import { useState } from 'react';
import { Users, Plus, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocationSharing } from '@/hooks/useLocationSharing';
import { SharedUserItem } from './SharedUserItem';
import { toast } from 'sonner';

export function SocialSharingSection() {
  const { sharedUsers, loading, createInvite, removeSharing } = useLocationSharing();
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  const handleAddPerson = async () => {
    setIsCreatingInvite(true);
    
    try {
      const result = await createInvite();
      
      if (result) {
        // Encode the message for SMS
        const encodedMessage = encodeURIComponent(result.message);
        
        // Open native SMS app with pre-filled message
        // Using sms: protocol which works on both iOS and Android
        window.location.href = `sms:?body=${encodedMessage}`;
        
        toast.success('Invite created! Send it via text message.');
      }
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error('Failed to create invite');
    } finally {
      setIsCreatingInvite(false);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Social Sharing
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddPerson}
          disabled={isCreatingInvite}
          className="h-8 px-3 text-primary hover:text-primary hover:bg-primary/10"
        >
          {isCreatingInvite ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </>
          )}
        </Button>
      </div>
      
      <div className="p-4">
        <p className="text-sm font-medium text-foreground mb-3">
          Share Location With Others
        </p>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : sharedUsers.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              No one yet. Add friends or family to share your location.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddPerson}
              disabled={isCreatingInvite}
              className="gap-2"
            >
              {isCreatingInvite ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Invite Someone
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sharedUsers.map((user) => (
              <SharedUserItem
                key={user.id}
                id={user.id}
                username={user.username}
                status={user.status}
                isMutual={user.isMutual}
                onRemove={removeSharing}
              />
            ))}
          </div>
        )}
        
        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>
            Share your live location with friends or family. They can see where you are, 
            and if they share back, you can see them too. Disabling this does NOT affect 
            Hawkly's crowd counts.
          </p>
        </div>
      </div>
    </div>
  );
}
