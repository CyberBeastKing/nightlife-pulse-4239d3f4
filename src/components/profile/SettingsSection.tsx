import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  LogOut, 
  Bell, 
  MapPin, 
  Moon,
  Shield,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export function SettingsSection() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Push Notifications',
          description: 'Get notified about trending venues',
          type: 'toggle' as const,
          value: notifications,
          onChange: setNotifications
        },
        {
          icon: MapPin,
          label: 'Location Sharing',
          description: 'Share your presence at venues',
          type: 'toggle' as const,
          value: locationSharing,
          onChange: setLocationSharing
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          description: 'Always on for night owls',
          type: 'toggle' as const,
          value: true,
          onChange: () => toast.info('Dark mode is always on 🌙'),
          disabled: true
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: Shield,
          label: 'Privacy Policy',
          type: 'link' as const,
          onClick: () => toast.info('Privacy Policy coming soon')
        },
        {
          icon: HelpCircle,
          label: 'Help & Support',
          type: 'link' as const,
          onClick: () => toast.info('Help center coming soon')
        }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" />
        Settings
      </h3>

      {settingsGroups.map((group) => (
        <div key={group.title} className="glass rounded-2xl overflow-hidden">
          <div className="px-4 py-2 bg-secondary/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {group.title}
            </p>
          </div>
          <div className="divide-y divide-border">
            {group.items.map((item) => (
              <div 
                key={item.label}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    {item.type === 'toggle' && item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </div>
                
                {item.type === 'toggle' ? (
                  <Switch 
                    checked={item.value}
                    onCheckedChange={item.onChange}
                    disabled={item.disabled}
                  />
                ) : (
                  <button 
                    onClick={item.onClick}
                    className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Sign Out Button */}
      <Button
        variant="destructive"
        className="w-full mt-6"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>

      {/* App Version */}
      <p className="text-center text-xs text-muted-foreground pt-4">
        Hawkly v1.0.0 • Made for night owls 🦉
      </p>
    </div>
  );
}
