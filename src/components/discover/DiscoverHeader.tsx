import { Bell, SlidersHorizontal, Zap } from 'lucide-react';

interface DiscoverHeaderProps {
  onSearchClick: () => void;
  onFilterClick?: () => void;
}

export function DiscoverHeader({ onSearchClick, onFilterClick }: DiscoverHeaderProps) {
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
    if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
    if (hour < 21) return { text: 'Good evening', emoji: '🌆' };
    return { text: 'Night owl mode', emoji: '🦉' };
  };

  const greeting = getGreeting();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
      <div className="px-4 py-4">
        {/* Top row with greeting and actions */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span>{greeting.emoji}</span>
              {greeting.text}
            </p>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Discover
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onFilterClick}
              className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Filter"
            >
              <SlidersHorizontal className="w-5 h-5 text-foreground" />
            </button>
            <button 
              className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {/* Notification dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>
          </div>
        </div>

        {/* Live activity indicator */}
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>127 places active now</span>
          </div>
        </div>
      </div>
    </header>
  );
}
