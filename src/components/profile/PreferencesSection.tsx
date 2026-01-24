import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Settings, Bell, Volume2 } from 'lucide-react';

interface PreferencesSectionProps {
  pushNotifications: boolean;
  setPushNotifications: (value: boolean) => void;
  vibePreference: number; // 0 = quiet, 100 = busy
  setVibePreference: (value: number) => void;
}

export function PreferencesSection({
  pushNotifications,
  setPushNotifications,
  vibePreference,
  setVibePreference
}: PreferencesSectionProps) {
  const getVibeLabel = (value: number) => {
    if (value < 33) return 'Quiet spots';
    if (value < 66) return 'Balanced';
    return 'Busy scenes';
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Preferences
          </span>
        </div>
      </div>
      
      <div className="divide-y divide-border">
        {/* Push Notifications */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Push Notifications</p>
              <p className="text-xs text-muted-foreground">Alerts for trending venues nearby</p>
            </div>
          </div>
          <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
        </div>
        
        {/* Vibe Preference */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Vibe Preference</p>
              <p className="text-xs text-muted-foreground">
                Your preferred atmosphere: <span className="text-primary">{getVibeLabel(vibePreference)}</span>
              </p>
            </div>
          </div>
          
          <div className="px-3">
            <Slider
              value={[vibePreference]}
              onValueChange={(value) => setVibePreference(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-muted-foreground">🤫 Quiet</span>
              <span className="text-xs text-muted-foreground">🔥 Busy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
