import { MapPin } from 'lucide-react';
import { Venue } from '@/types/venue';
import { NearbyListItem } from './cards/NearbyListItem';

interface NearbySectionProps {
  venues: Venue[];
  onVenueClick: (venue: Venue) => void;
}

export function NearbySection({ venues, onVenueClick }: NearbySectionProps) {
  // Sort by distance and filter for nearby (< 2 miles)
  const nearbyVenues = venues
    .map(v => ({
      ...v,
      distance: v.distance ?? Math.random() * 2, // Mock distance if not provided
    }))
    .filter(v => v.distance !== undefined && v.distance <= 2)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    .slice(0, 10);

  if (nearbyVenues.length === 0) {
    return (
      <section className="mb-8 px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Near You</h2>
            <p className="text-xs text-muted-foreground">Within 2 miles</p>
          </div>
        </div>
        
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-card/50 border border-border/30 text-center">
          <span className="text-4xl mb-3">📍</span>
          <h3 className="font-semibold text-foreground mb-1">No places nearby</h3>
          <p className="text-sm text-muted-foreground mb-4">Try expanding your search radius</p>
          <button className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity">
            View All Places
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Near You</h2>
            <p className="text-xs text-muted-foreground">Within 2 miles</p>
          </div>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">
          See all
        </button>
      </div>

      {/* Vertical list */}
      <div className="space-y-2 px-4">
        {nearbyVenues.map((venue) => (
          <NearbyListItem
            key={venue.id}
            venue={venue}
            onClick={() => onVenueClick(venue)}
          />
        ))}
      </div>
    </section>
  );
}
