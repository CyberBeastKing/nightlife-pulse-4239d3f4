import { Check, Shield, MapPin, Eye, EyeOff } from 'lucide-react';

interface LocationTransparencyPanelProps {
  isLocationContributing: boolean;
  isBackgroundActive: boolean;
}

export function LocationTransparencyPanel({ 
  isLocationContributing, 
  isBackgroundActive 
}: LocationTransparencyPanelProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Location & Presence</h3>
        </div>
      </div>
      
      {/* Status Items */}
      <div className="p-4 space-y-3">
        <StatusItem 
          label="Location tracking" 
          isActive={isLocationContributing} 
        />
        <StatusItem 
          label="Automatic check-ins" 
          isActive={isLocationContributing} 
        />
        <StatusItem 
          label="Background activity" 
          isActive={isBackgroundActive} 
        />
      </div>
      
      {/* Explanation */}
      <div className="px-4 pb-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Hawkly uses your location continuously to estimate real-time activity at places. 
          Your identity is never shown.
        </p>
      </div>
    </div>
  );
}

function StatusItem({ label, isActive }: { label: string; isActive: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        isActive ? 'bg-primary/20' : 'bg-secondary'
      }`}>
        {isActive ? (
          <Check className="w-3 h-3 text-primary" />
        ) : (
          <EyeOff className="w-3 h-3 text-muted-foreground" />
        )}
      </div>
      <span className={`text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
        {label}: <span className="font-medium">{isActive ? 'ON' : 'OFF'}</span>
      </span>
    </div>
  );
}
