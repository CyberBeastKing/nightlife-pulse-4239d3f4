import { useState } from 'react';
import { Trash2, Clock, Check, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SharedUserItemProps {
  id: string;
  username: string | null;
  phone: string | null;
  status: 'pending' | 'accepted' | 'declined';
  isMutual: boolean;
  onRemove: (id: string) => Promise<boolean>;
}

export function SharedUserItem({ 
  id, 
  username, 
  phone, 
  status, 
  isMutual,
  onRemove 
}: SharedUserItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(id);
    setIsRemoving(false);
  };

  const displayName = username || phone || 'Invited User';
  
  const statusConfig = {
    pending: { icon: Clock, label: 'Pending', className: 'text-muted-foreground' },
    accepted: { icon: Check, label: 'Active', className: 'text-primary' },
    declined: { icon: X, label: 'Declined', className: 'text-destructive' },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          {phone && !username ? (
            <Phone className="w-4 h-4 text-primary" />
          ) : (
            <span className="text-lg">👤</span>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <div className="flex items-center gap-1.5">
            <StatusIcon className={`w-3 h-3 ${statusConfig[status].className}`} />
            <span className={`text-xs ${statusConfig[status].className}`}>
              {statusConfig[status].label}
            </span>
            {isMutual && status === 'accepted' && (
              <span className="text-xs text-muted-foreground ml-1">• Mutual</span>
            )}
          </div>
        </div>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            disabled={isRemoving}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Sharing Location?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop sharing your location with {displayName}? 
              They will no longer see your location, and you will no longer see theirs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Stop Sharing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
