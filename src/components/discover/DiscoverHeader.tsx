import { Bell, SlidersHorizontal, MapPin, TrendingUp, Flame } from 'lucide-react';

interface DiscoverHeaderProps {
  onFilterClick?: () => void;
  trendingCount?: number;
  hottestSpot?: string;
  location?: string;
}

export function DiscoverHeader({ 
  onFilterClick,
  trendingCount = 4,
  hottestSpot = "Leo's Italian Social",
  location = "Akron, OH"
}: DiscoverHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30">
      <div className="px-4 py-4">
        {/* Top row with title and actions */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Discover
            </h1>
            <p className="text-sm text-muted-foreground">
              Find what's happening around you
            </p>
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 text-accent" />
          <span>{location}</span>
        </div>

        {/* Stats Cards - 2 columns now (Active metric hidden until real data) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Trending Now Card */}
          <div className="rounded-xl p-3 bg-primary/15 border border-primary/30">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-primary/80">Trending</span>
            </div>
            <p className="text-lg font-bold text-foreground">{trendingCount} Places</p>
          </div>

          {/* Hottest Spot Card */}
          <div className="rounded-xl p-3 bg-destructive/15 border border-destructive/30">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs text-destructive/80">Hottest</span>
            </div>
            <p className="text-xs font-bold text-foreground truncate" title={hottestSpot}>
              {hottestSpot.length > 18 ? `${hottestSpot.slice(0, 18)}...` : hottestSpot}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}