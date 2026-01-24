import { Search, X, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  const [searchResults, setSearchResults] = useState<Venue[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

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

  // Search venues via API endpoint (searches ALL 29k+ venues)
  const searchVenues = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-venues?q=${encodeURIComponent(query)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data.venues || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

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
    onSearchChange('');
    setShowSuggestions(false);
    setSearchResults([]);
    onVenueSelect?.(venue);
  };

  const handleInputChange = (value: string) => {
    onSearchChange(value);
    setShowSuggestions(value.length >= 2);

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchVenues(value);
    }, 300);
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
        {showSuggestions && (searchResults.length > 0 || isSearching) && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl animate-fade-in z-[1100] border border-border/30"
          >
            {isSearching ? (
              <div className="px-4 py-3 flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            ) : (
              searchResults.map((venue) => (
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
              ))
            )}
          </div>
        )}
      </div>

      {/* Centered Category Chips - Horizontal scroll with fixed More button */}
      <div className="flex items-center gap-2">
        {/* Scrollable chips container */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1">
            {primaryCategories.map((category) => {
              const isSelected = selectedCategories.has(category.id);
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryToggle(category.id)}
                  className={cn(
                    'glass px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md flex-shrink-0',
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
        </div>

        {/* Fixed More Button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={cn(
            'glass px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md flex-shrink-0',
            (showMore || hasUtilitySelected)
              ? 'bg-muted text-foreground shadow-lg'
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