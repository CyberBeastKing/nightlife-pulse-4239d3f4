import { Switch } from '@/components/ui/switch';
import { MapPin, AlertTriangle, Zap } from 'lucide-react';
import { SocialSharingSection } from './SocialSharingSection';

interface LocationControlsSectionProps {
  contributeLocation: boolean;
  setContributeLocation: (value: boolean) => void;
  autoCheckinEnabled: boolean;
  setAutoCheckinEnabled: (value: boolean) => void;
}

export function LocationControlsSection({
  contributeLocation,
  setContributeLocation,
  autoCheckinEnabled,
  setAutoCheckinEnabled,
}: LocationControlsSectionProps) {
  return (
    <div className="space-y-4">
      {/* Hawkly System Location */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Hawkly System
            </span>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Contribute Location Toggle */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Contribute Location to Hawkly
                </p>
              </div>
              <Switch 
                checked={contributeLocation}
                onCheckedChange={setContributeLocation}
              />
            </div>
            
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                Improves crowd accuracy
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                Anonymous — never shows individual paths
              </p>
              <p className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                Never tracks home or workplace
              </p>
            </div>
            
            {!contributeLocation && (
              <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">
                    Some features may be unavailable. Crowd accuracy will be reduced.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Auto Check-in Toggle */}
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Automatic Check-ins
                </p>
              </div>
              <Switch 
                checked={autoCheckinEnabled && contributeLocation}
                onCheckedChange={setAutoCheckinEnabled}
                disabled={!contributeLocation}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically check in when you stay at a venue for 2-3 minutes. 
              You can always undo via the notification.
            </p>
          </div>
        </div>
      </div>
      
      {/* Social Location Sharing - Now uses the new component */}
      <SocialSharingSection />
      
      {/* OS-Level Reality */}
      <div className="px-4">
        <p className="text-xs text-muted-foreground text-center">
          If you disable location access in your phone settings, 
          Hawkly cannot collect location data.
        </p>
      </div>
    </div>
  );
}
