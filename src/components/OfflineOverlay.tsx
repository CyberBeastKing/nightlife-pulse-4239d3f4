import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface OfflineOverlayProps {
  onRetry: () => Promise<boolean>;
}

export function OfflineOverlay({ onRetry }: OfflineOverlayProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <WifiOff className="w-10 h-10 text-muted-foreground" />
        </div>
        
        <h2 className="text-xl font-semibold text-foreground mb-2">
          You're offline
        </h2>
        
        <p className="text-muted-foreground mb-6">
          Reconnect to see updates.
        </p>
        
        <Button 
          onClick={handleRetry} 
          disabled={isRetrying}
          className="min-w-[120px]"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
