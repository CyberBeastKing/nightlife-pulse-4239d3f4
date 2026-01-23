import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  venue: string;
  time: string;
  date: string;
  type: 'dj' | 'live' | 'happy_hour' | 'special';
  price?: string;
}

// Mock events - in production these would come from the database
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'DJ Night: House Sessions',
    venue: 'The Bluestone',
    time: '10 PM',
    date: 'Tonight',
    type: 'dj',
    price: '$15',
  },
  {
    id: '2',
    title: 'Live Jazz Trio',
    venue: 'Mandrake Rooftop',
    time: '8 PM',
    date: 'Tonight',
    type: 'live',
  },
  {
    id: '3',
    title: 'Happy Hour Special',
    venue: 'Good Night John Boy',
    time: '5-8 PM',
    date: 'Tomorrow',
    type: 'happy_hour',
  },
  {
    id: '4',
    title: 'Wine & Canvas Night',
    venue: 'Cooper\'s Hawk',
    time: '7 PM',
    date: 'Friday',
    type: 'special',
    price: '$45',
  },
];

const eventTypeConfig = {
  dj: { emoji: '🎧', label: 'DJ Night', color: '#8B5CF6' },
  live: { emoji: '🎵', label: 'Live Music', color: '#22C55E' },
  happy_hour: { emoji: '🍺', label: 'Happy Hour', color: '#FFB020' },
  special: { emoji: '✨', label: 'Special Event', color: '#EC4899' },
};

interface EventsSectionProps {
  onEventClick: (eventId: string) => void;
}

export function EventsSection({ onEventClick }: EventsSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">What's On</h2>
            <p className="text-xs text-muted-foreground">Events & happenings</p>
          </div>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">
          See all
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
        {mockEvents.map((event) => {
          const config = eventTypeConfig[event.type];
          
          return (
            <button
              key={event.id}
              onClick={() => onEventClick(event.id)}
              className="flex-shrink-0 w-64 p-4 rounded-2xl bg-card border border-border/30 text-left hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all group"
            >
              {/* Header with type badge */}
              <div className="flex items-start justify-between mb-3">
                <span 
                  className="px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                  style={{ 
                    backgroundColor: `${config.color}20`,
                    color: config.color 
                  }}
                >
                  <span>{config.emoji}</span>
                  {config.label}
                </span>
                {event.price && (
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Ticket className="w-3 h-3" />
                    {event.price}
                  </span>
                )}
              </div>

              {/* Event title */}
              <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {event.title}
              </h3>

              {/* Venue and time */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{event.venue}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.time}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
