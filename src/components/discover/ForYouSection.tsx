import { Sparkles, MapPin, Users, ChevronRight } from 'lucide-react';
import { Venue } from '@/types/venue';
import { CategoryData } from '@/hooks/useExternalVenues';

interface ForYouSectionProps {
  venues: Venue[];
  categories: CategoryData[];
  onVenueClick: (venue: Venue) => void;
}

export function ForYouSection({ venues, categories, onVenueClick }: ForYouSectionProps) {
  // Create a category lookup map
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  
  // Get personalized recommendations (for now, random selection with variety)
  const recommendations = venues
    .slice()
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  if (recommendations.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4 px-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">For You</h2>
          <p className="text-xs text-muted-foreground">Personalized picks</p>
        </div>
      </div>

      <div className="space-y-3 px-4">
        {recommendations.map((venue) => {
          const category = categoryMap.get(venue.category);
          
          return (
            <button
              key={venue.id}
              onClick={() => onVenueClick(venue)}
              className="w-full flex items-center gap-4 p-3 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/30 hover:bg-card/80 hover:border-primary/30 transition-all group text-left"
            >
              {/* Category icon bubble */}
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: `${category?.color || '#FFB020'}20` }}
              >
                {category?.icon || '📍'}
              </div>

              {/* Venue info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {venue.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {venue.address?.split(',')[1]?.trim() || 'Nearby'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {venue.current_crowd_count}+ here
                  </span>
                </div>
                {category && (
                  <span 
                    className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ 
                      backgroundColor: `${category.color}20`,
                      color: category.color 
                    }}
                  >
                    {category.label}
                  </span>
                )}
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
