import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Map, Mountain, Satellite, Moon, Sun } from 'lucide-react';

export type MapStyle = 'streets-dark' | 'streets' | 'satellite' | 'topo' | 'outdoor';

interface MapStyleSwitcherProps {
  currentStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
}

const styles: { id: MapStyle; label: string; icon: React.ReactNode }[] = [
  { id: 'streets-dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  { id: 'streets', label: 'Light', icon: <Sun className="w-4 h-4" /> },
  { id: 'satellite', label: 'Satellite', icon: <Satellite className="w-4 h-4" /> },
  { id: 'topo', label: 'Topo', icon: <Mountain className="w-4 h-4" /> },
  { id: 'outdoor', label: 'Outdoor', icon: <Map className="w-4 h-4" /> },
];

export function MapStyleSwitcher({ currentStyle, onStyleChange }: MapStyleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentStyleData = styles.find(s => s.id === currentStyle);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "glass p-3 rounded-full",
          "hover:bg-secondary/50 transition-colors",
          "flex items-center justify-center"
        )}
        aria-label="Change map style"
      >
        {currentStyleData?.icon || <Map className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 glass rounded-xl p-2 min-w-[140px] animate-fade-in">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => {
                onStyleChange(style.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                currentStyle === style.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary/50"
              )}
            >
              {style.icon}
              <span>{style.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper to get MapTiler tile URL for a style
export function getMapTilerUrl(style: MapStyle): string {
  const key = 'sBCotOB5AWbR0C8uxgb9';
  
  const styleMap: Record<MapStyle, string> = {
    'streets-dark': 'streets-v2-dark',
    'streets': 'streets-v2',
    'satellite': 'satellite',
    'topo': 'topo-v2',
    'outdoor': 'outdoor-v2',
  };

  const styleName = styleMap[style];
  
  // Satellite uses jpg, others use png
  const ext = style === 'satellite' ? 'jpg' : 'png';
  
  return `https://api.maptiler.com/maps/${styleName}/{z}/{x}/{y}.${ext}?key=${key}`;
}
