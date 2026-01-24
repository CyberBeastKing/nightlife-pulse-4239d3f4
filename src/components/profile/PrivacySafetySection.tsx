import { Switch } from '@/components/ui/switch';
import { Shield, MapPinOff, UserX, VolumeX } from 'lucide-react';

interface PrivacySafetySectionProps {
  blockPlaceSuggestions: boolean;
  setBlockPlaceSuggestions: (value: boolean) => void;
  hideFromJoinPrompts: boolean;
  setHideFromJoinPrompts: (value: boolean) => void;
  muteVenueChats: boolean;
  setMuteVenueChats: (value: boolean) => void;
}

export function PrivacySafetySection({
  blockPlaceSuggestions,
  setBlockPlaceSuggestions,
  hideFromJoinPrompts,
  setHideFromJoinPrompts,
  muteVenueChats,
  setMuteVenueChats
}: PrivacySafetySectionProps) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Privacy & Safety
          </span>
        </div>
      </div>
      
      <div className="divide-y divide-border">
        <PrivacyToggle
          icon={MapPinOff}
          label="Block place suggestions"
          description="Hide certain venues from your recommendations"
          checked={blockPlaceSuggestions}
          onChange={setBlockPlaceSuggestions}
        />
        <PrivacyToggle
          icon={UserX}
          label="Hide from 'Join' prompts"
          description="Don't appear in friend activity suggestions"
          checked={hideFromJoinPrompts}
          onChange={setHideFromJoinPrompts}
        />
        <PrivacyToggle
          icon={VolumeX}
          label="Mute venue chats"
          description="Disable notifications for chat messages"
          checked={muteVenueChats}
          onChange={setMuteVenueChats}
        />
      </div>
    </div>
  );
}

interface PrivacyToggleProps {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function PrivacyToggle({ icon: Icon, label, description, checked, onChange }: PrivacyToggleProps) {
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
