import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: DiscoverFilters;
  onApply: (filters: DiscoverFilters) => void;
}

export interface DiscoverFilters {
  distance: '1' | '5' | '10' | '25';
  categories: string[];
  vibes: string[];
  status: string[];
}

const defaultFilters: DiscoverFilters = {
  distance: '5',
  categories: ['bar', 'nightclub', 'restaurant'],
  vibes: ['moderate', 'loud'],
  status: ['on_fire', 'popping_off'],
};

const distanceOptions = [
  { value: '1', label: '1 mile' },
  { value: '5', label: '5 miles' },
  { value: '10', label: '10 miles' },
  { value: '25', label: '25 miles' },
];

const categoryOptions = [
  { value: 'bar', label: 'Bars' },
  { value: 'nightclub', label: 'Clubs' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'coffee', label: 'Coffee Shops' },
  { value: 'lounge', label: 'Lounges' },
  { value: 'brewery', label: 'Breweries' },
];

const vibeOptions = [
  { value: 'quiet', label: 'Quiet' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'loud', label: 'Loud' },
];

const statusOptions = [
  { value: 'hottest_spot', label: 'HOTTEST' },
  { value: 'on_fire', label: 'ON FIRE' },
  { value: 'popping_off', label: 'POPPING OFF' },
  { value: 'all', label: 'All places' },
];

export function FilterModal({ open, onOpenChange, filters, onApply }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<DiscoverFilters>(filters);

  const handleDistanceChange = (value: string) => {
    setLocalFilters(prev => ({ ...prev, distance: value as DiscoverFilters['distance'] }));
  };

  const handleCheckboxToggle = (
    key: 'categories' | 'vibes' | 'status',
    value: string
  ) => {
    setLocalFilters(prev => {
      const current = prev[key];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: newValues };
    });
  };

  const handleClearAll = () => {
    setLocalFilters(defaultFilters);
  };

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filters</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* Distance */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Distance</h3>
            <div className="space-y-2">
              {distanceOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                      localFilters.distance === option.value
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    )}
                  >
                    {localFilters.distance === option.value && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50" />

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
            <div className="space-y-2">
              {categoryOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Checkbox
                    checked={localFilters.categories.includes(option.value)}
                    onCheckedChange={() => handleCheckboxToggle('categories', option.value)}
                  />
                  <span className="text-sm text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50" />

          {/* Vibe */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Vibe</h3>
            <div className="space-y-2">
              {vibeOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Checkbox
                    checked={localFilters.vibes.includes(option.value)}
                    onCheckedChange={() => handleCheckboxToggle('vibes', option.value)}
                  />
                  <span className="text-sm text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-border/50" />

          {/* Status */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Status</h3>
            <div className="space-y-2">
              {statusOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <Checkbox
                    checked={localFilters.status.includes(option.value)}
                    onCheckedChange={() => handleCheckboxToggle('status', option.value)}
                  />
                  <span className="text-sm text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="flex-1"
          >
            Clear All
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-gradient-to-r from-primary to-accent text-white"
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { defaultFilters };
