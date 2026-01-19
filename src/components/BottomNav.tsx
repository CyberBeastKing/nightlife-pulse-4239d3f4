import { Map, Flame, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = 'map' | 'discover' | 'chat' | 'profile';

interface BottomNavProps {
  activeTab: NavItem;
  onTabChange: (tab: NavItem) => void;
}

const navItems: { id: NavItem; icon: typeof Map; label: string }[] = [
  { id: 'map', icon: Map, label: 'Map' },
  { id: 'discover', icon: Flame, label: 'Discover' },
  { id: 'chat', icon: MessageCircle, label: 'Chat' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="glass-strong border-t border-border/50 px-6 py-2 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              'nav-item',
              activeTab === id && 'nav-item-active'
            )}
          >
            <Icon className={cn('w-6 h-6', activeTab === id && 'drop-shadow-[0_0_8px_hsl(var(--primary))]')} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
