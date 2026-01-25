import { Calendar, Clock, MapPin, Ticket, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEnhancedAddress } from '@/utils/geocoding';

export interface Event {
  id: string;
  title: string;
  venue: string;
  venue_id?: string;
  venue_address?: string;
  venue_latitude?: number;
  venue_longitude?: number;
  start_time: string;
  end_time?: string;
  date: string;
  type: 'dj' | 'live' | 'happy_hour' | 'special' | 'trivia';
  price?: string;
  going_count?: number;
  distance?: number;
  image_url?: string;
}

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const eventTypeConfig = {
  dj: { emoji: '🎧', label: 'DJ Night', color: '#8B5CF6' },
  live: { emoji: '🎵', label: 'Live Music', color: '#22C55E' },
  happy_hour: { emoji: '🍺', label: 'Happy Hour', color: '#FFB020' },
  special: { emoji: '✨', label: 'Special Event', color: '#EC4899' },
  trivia: { emoji: '🧠', label: 'Trivia', color: '#38BDF8' },
};

export function EventCard({ event, onClick }: EventCardProps) {
  const config = eventTypeConfig[event.type] || eventTypeConfig.special;
  const distance = event.distance ? `${event.distance.toFixed(1)} mi` : null;
  const goingCount = event.going_count || Math.floor(Math.random() * 50) + 10;
  
  // Enhanced address with city/state
  const { fullAddress } = useEnhancedAddress(
    event.venue_address || event.venue || '',
    event.venue_latitude || 0,
    event.venue_longitude || 0
  );

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-[280px] text-left group"
    >
      <div className="overflow-hidden rounded-2xl bg-card border border-border/30 hover:border-primary/50 transition-all hover:scale-[1.02]">
        {/* Image area */}
        <div className="relative h-[180px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-card to-secondary" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Time badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-accent text-white text-xs font-bold shadow-lg">
            🎉 {event.date.toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[48px]">
            {event.title}
          </h3>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Clock className="w-3 h-3" />
            <span>{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
          </div>
          
          {/* Venue address */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{fullAddress || event.venue}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {goingCount} going
            </span>
            {distance && (
              <span className="flex items-center gap-1">
                {distance}
              </span>
            )}
          </div>
          
          {/* CTA Button */}
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold hover:opacity-90"
          >
            <Ticket className="w-3.5 h-3.5 mr-1.5" />
            {event.price ? `Get Tickets · ${event.price}` : 'View Details'}
          </Button>
        </div>
      </div>
    </button>
  );
}
