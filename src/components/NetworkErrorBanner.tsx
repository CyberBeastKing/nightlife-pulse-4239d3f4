import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NetworkErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

export function NetworkErrorBanner({ 
  message = "Can't load nearby places. Check your connection.",
  onRetry 
}: NetworkErrorBannerProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mx-4 my-2">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-foreground">{message}</p>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="mt-2 h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1.5" />
                  Try again
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
