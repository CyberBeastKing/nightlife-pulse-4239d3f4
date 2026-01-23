import { Search, X, ChevronDown, MapPin } from 'lucide-react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { utilityCategories, excludedCategoryLabels } from '@/data/mockVenues';
import { Venue } from '@/types/venue';
import { CategoryData } from '@/hooks/useExternalVenues';

// Check if a label matches any excluded category
const isExcludedCategory = (label: string) => {
  const norm = label.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return excludedCategoryLabels.some(ex => 
    ex.toLowerCase().replace(/[^a-z0-9]+/g, '') === norm
  );
};

const normalizeLabel = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[^a-z0-9]+/g, '');

interface FloatingSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCategories: Set<string>;
  onCategoryToggle: (categoryId: string) => void;
  venues?: Venue[];
  categories?: CategoryData[];
  onVenueSelect?: (venue: Venue) => void;
}

export function FloatingSearchBar({
  searchValue,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
  venues = [],
  categories = [],
  onVenueSelect,
}: FloatingSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // We use LABEL-based matching (not IDs) because backend category IDs are UUIDs,
  // while our curated utility list uses slugs. This prevents duplicates.
  const utilityLabelSet = useMemo(() => {
    return new Set(utilityCategories.map((c) => normalizeLabel(c.label)));
  }, []);

  // Build utility items that use backend IDs when available (so filtering works).
  const utilityCategoriesResolved = useMemo(() => {
    const backendByNormLabel = new Map<string, CategoryData>();
    for (const c of categories) backendByNormLabel.set(normalizeLabel(c.label), c);

    return utilityCategories
      .map((u) => {
        const match = backendByNormLabel.get(normalizeLabel(u.label));
        return {
          ...u,
          // prefer backend id so selection maps to venue.category UUIDs
          id: match?.id ?? u.id,
        };
      })
      // Avoid rendering duplicates if backend already includes these in the main list
      // (we filter them out there, but keep this list strictly curated).
      .filter((u, idx, arr) => idx === arr.findIndex((x) => normalizeLabel(x.label) === normalizeLabel(u.label)));
  }, [categories]);

  // Only show non-utility and non-excluded categories in the main row
  const primaryCategories = useMemo(() => {
    return categories.filter((c) => 
      !utilityLabelSet.has(normalizeLabel(c.label)) && !isExcludedCategory(c.label)
    );
  }, [categories, utilityLabelSet]);

  const hasUtilitySelected = utilityCategoriesResolved.some((c) => selectedCategories.has(c.id));

  // Filter suggestions based on search value
  const suggestions = useMemo(() => {
    if (!searchValue || searchValue.length < 2) return [];
    const query = searchValue.toLowerCase();
    return venues
      .filter((venue) => venue.name.toLowerCase().includes(query))
      .slice(0, 6); // Limit to 6 suggestions
  }, [searchValue, venues]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (venue: Venue) => {
    onSearchChange(venue.name);
    setShowSuggestions(false);
    onVenueSelect?.(venue);
  };

  const handleInputChange = (value: string) => {
    onSearchChange(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (searchValue.length >= 2) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="absolute top-4 left-0 right-0 z-[1000] space-y-2 px-4">
      {/* Search Bar */}
      <div className="relative">
        <div
          className={cn(
            'glass rounded-full px-4 py-3 flex items-center gap-3 transition-all duration-300 shadow-lg',
            isFocused && 'ring-2 ring-primary/50 glow-primary'
          )}
        >
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />

          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={() => setIsFocused(false)}
            placeholder="Search places..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
          />

          {searchValue && (
            <button
              onClick={() => {
                onSearchChange('');
                setShowSuggestions(false);
              }}
              className="p-1 rounded-full hover:bg-secondary/50 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl animate-fade-in z-[1100] border border-border/30"
          >
            {suggestions.map((venue) => (
              <button
                key={venue.id}
                onClick={() => handleSuggestionClick(venue)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left border-b border-border/20 last:border-b-0"
              >
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {venue.name}
                  </p>
                  {venue.address && (
                    <p className="text-xs text-muted-foreground truncate">
                      {venue.address}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Centered Category Chips - Toggle Select with POI Colors */}
      <div className="flex justify-center gap-2 flex-wrap">
        {primaryCategories.map((category) => {
          const isSelected = selectedCategories.has(category.id);
          return (
            <button
              key={category.id}
              onClick={() => onCategoryToggle(category.id)}
              className={cn(
                'glass px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md',
                isSelected
                  ? 'text-white shadow-lg'
                  : 'hover:bg-secondary/80 opacity-70 hover:opacity-100'
              )}
              style={isSelected ? {
                backgroundColor: category.color,
                boxShadow: `0 0 15px ${category.color}60`,
              } : undefined}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={cn(
            'glass px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md',
            (showMore || hasUtilitySelected)
              ? 'bg-[#E5E7EB] text-gray-800 shadow-lg'
              : 'hover:bg-secondary/80 opacity-70 hover:opacity-100'
          )}
        >
          <span>📍</span>
          <span>More</span>
          <ChevronDown className={cn('w-3 h-3 transition-transform', showMore && 'rotate-180')} />
        </button>
      </div>

      {/* Utility Categories Dropdown */}
      {showMore && (
        <div className="flex justify-center gap-2 flex-wrap animate-fade-in">
        {utilityCategoriesResolved.map((category) => {
          const isSelected = selectedCategories.has(category.id);
          return (
            <button
              key={category.id}
              onClick={() => onCategoryToggle(category.id)}
              className={cn(
                'glass px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md',
                isSelected
                  ? 'text-white shadow-lg'
                  : 'hover:bg-secondary/80 opacity-70 hover:opacity-100'
              )}
              style={isSelected ? {
                backgroundColor: category.color,
                boxShadow: `0 0 15px ${category.color}60`,
              } : undefined}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          );
        })}
        </div>
      )}
    </div>
  );
}