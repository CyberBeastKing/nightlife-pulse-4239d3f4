import { Wine, Moon, Heart, Music, Utensils, Coffee } from 'lucide-react';

interface CuratedList {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  count: number;
}

const curatedLists: CuratedList[] = [
  {
    id: 'rooftop',
    title: 'Rooftop Vibes',
    subtitle: 'Best views in town',
    icon: <Moon className="w-6 h-6" />,
    gradient: 'from-indigo-500 to-purple-600',
    count: 12,
  },
  {
    id: 'date-night',
    title: 'Date Night',
    subtitle: 'Romantic spots',
    icon: <Heart className="w-6 h-6" />,
    gradient: 'from-rose-500 to-pink-600',
    count: 18,
  },
  {
    id: 'live-music',
    title: 'Live Music',
    subtitle: 'Tonight\'s shows',
    icon: <Music className="w-6 h-6" />,
    gradient: 'from-emerald-500 to-teal-600',
    count: 8,
  },
  {
    id: 'late-night',
    title: 'Late Night Eats',
    subtitle: 'Open past midnight',
    icon: <Utensils className="w-6 h-6" />,
    gradient: 'from-amber-500 to-orange-600',
    count: 15,
  },
  {
    id: 'cocktail',
    title: 'Craft Cocktails',
    subtitle: 'Mixology masters',
    icon: <Wine className="w-6 h-6" />,
    gradient: 'from-violet-500 to-fuchsia-600',
    count: 22,
  },
  {
    id: 'coffee',
    title: 'Work & Chill',
    subtitle: 'WiFi & good coffee',
    icon: <Coffee className="w-6 h-6" />,
    gradient: 'from-amber-600 to-yellow-600',
    count: 14,
  },
];

interface CuratedListsSectionProps {
  onListClick: (listId: string) => void;
}

export function CuratedListsSection({ onListClick }: CuratedListsSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Curated For You</h2>
          <p className="text-xs text-muted-foreground">Hand-picked collections</p>
        </div>
        <button className="text-sm text-primary font-medium hover:underline">
          See all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4">
        {curatedLists.map((list) => (
          <button
            key={list.id}
            onClick={() => onListClick(list.id)}
            className="relative overflow-hidden rounded-2xl p-4 text-left group transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${list.gradient} opacity-90`} />
            
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,white_1px,transparent_1px)] bg-[length:16px_16px]" />

            {/* Content */}
            <div className="relative">
              <div className="mb-3 p-2 rounded-xl bg-white/20 w-fit backdrop-blur-sm">
                {list.icon}
              </div>
              <h3 className="font-bold text-white text-sm mb-0.5">{list.title}</h3>
              <p className="text-white/70 text-xs">{list.subtitle}</p>
              <div className="mt-2 text-white/60 text-xs font-medium">
                {list.count} spots
              </div>
            </div>

            {/* Hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10" />
          </button>
        ))}
      </div>
    </section>
  );
}
