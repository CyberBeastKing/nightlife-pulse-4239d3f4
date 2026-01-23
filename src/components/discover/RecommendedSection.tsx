import { Star, Sparkles, MapPin } from 'lucide-react';
import { Venue } from '@/types/venue';
import { RecommendedCard } from './cards/RecommendedCard';

interface RecommendedSectionProps {
  venues: Venue[];
  onVenueClick: (venue: Venue) => void;
}

const recommendationReasons = [
  'Similar to places you loved',
  'Popular with people like you',
  'Matches your vibe preferences',
  'Based on your check-in history',
  'Friends frequent this spot',
];

export function RecommendedSection({ venues, onVenueClick }: RecommendedSectionProps) {
  // Simulate recommendation algorithm
  // In production: const { data: recommendations } = useRecommendations(userId);
  const recommendations = venues
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .map((venue, index) => ({
      venue,
      matchScore: Math.floor(Math.random() * 20) + 75, // 75-95
      reason: recommendationReasons[index % recommendationReasons.length],
    }));

  if (recommendations.length === 0) {
    return (
      <section className="mb-8 px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Recommended For You</h2>
            <p className="text-xs text-muted-foreground">Personalized picks</p>
          </div>
        </div>
        
        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-card/50 border border-border/30 text-center">
          <span className="text-4xl mb-3">⭐</span>
          <h3 className="font-semibold text-foreground mb-1">Help us learn your vibe!</h3>
          <p className="text-sm text-muted-foreground mb-4">Check in or react to places so we can recommend more</p>
          <button className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Explore Popular Places
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Recommended For You</h2>
            <p className="text-xs text-muted-foreground">Personalized picks</p>
          </div>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">
          See all
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2">
        {recommendations.map(({ venue, matchScore, reason }) => (
          <RecommendedCard
            key={venue.id}
            venue={venue}
            matchScore={matchScore}
            reason={reason}
            onClick={() => onVenueClick(venue)}
          />
        ))}
      </div>
    </section>
  );
}
