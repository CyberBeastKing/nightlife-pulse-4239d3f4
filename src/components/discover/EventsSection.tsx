import { Calendar, MapPin } from 'lucide-react';
import { EventCard, Event } from './cards/EventCard';

// Mock events - in production these would come from the database
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'DJ Night: House Sessions',
    venue: 'The Bluestone',
    start_time: '10:00 PM',
    end_time: '2:00 AM',
    date: 'Tonight',
    type: 'dj',
    price: '$15',
    going_count: 34,
    distance: 0.4,
  },
  {
    id: '2',
    title: 'Live Jazz Trio',
    venue: 'Mandrake Rooftop',
    start_time: '8:00 PM',
    end_time: '11:00 PM',
    date: 'Tonight',
    type: 'live',
    going_count: 28,
    distance: 0.8,
  },
  {
    id: '3',
    title: 'Happy Hour: 2-for-1 Cocktails',
    venue: 'Good Night John Boy',
    start_time: '5:00 PM',
    end_time: '8:00 PM',
    date: 'Tomorrow',
    type: 'happy_hour',
    going_count: 15,
    distance: 0.3,
  },
  {
    id: '4',
    title: 'Trivia Night Championship',
    venue: 'Brothers Bar & Grill',
    start_time: '7:00 PM',
    end_time: '10:00 PM',
    date: 'Tomorrow',
    type: 'trivia',
    going_count: 42,
    distance: 0.6,
  },
  {
    id: '5',
    title: 'Wine & Canvas Night',
    venue: "Cooper's Hawk",
    start_time: '7:00 PM',
    date: 'Friday',
    type: 'special',
    price: '$45',
    going_count: 22,
    distance: 1.2,
  },
];

interface EventsSectionProps {
  onEventClick: (eventId: string) => void;
}

export function EventsSection({ onEventClick }: EventsSectionProps) {
  const events = mockEvents; // In production: useEvents() hook
  
  if (events.length === 0) {
    return (
      <section className="mb-8 px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Tonight's Events</h2>
            <p className="text-xs text-muted-foreground">What's happening nearby</p>
          </div>
        </div>
        
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-card/50 border border-border/30 text-center">
          <span className="text-4xl mb-3">🎉</span>
          <h3 className="font-semibold text-foreground mb-1">No events tonight</h3>
          <p className="text-sm text-muted-foreground mb-4">Want to host one?</p>
          <button className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity">
            Create Event
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Tonight's Events</h2>
            <p className="text-xs text-muted-foreground">What's happening nearby</p>
          </div>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">
          See all
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onClick={() => onEventClick(event.id)}
          />
        ))}
      </div>
    </section>
  );
}
