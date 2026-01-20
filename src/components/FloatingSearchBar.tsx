import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { categories } from '@/data/mockVenues';

interface FloatingSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function FloatingSearchBar({
  searchValue,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: FloatingSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const activeCategory = categories.find((c) => c.id === selectedCategory);
  const hasActiveFilter = selectedCategory !== 'all';

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] space-y-2">
      {/* Search Bar */}
      <div
        className={cn(
          'glass rounded-full px-4 py-3 flex items-center gap-3 transition-all duration-300 shadow-lg',
          isFocused && 'ring-2 ring-primary/50 glow-primary'
        )}
      >
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />

        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search places..."
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
        />

        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="p-1 rounded-full hover:bg-secondary/50 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'p-2 rounded-full transition-all',
            hasActiveFilter || showFilters
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary/50 text-muted-foreground'
          )}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Chips Dropdown */}
      {showFilters && (
        <div className="glass rounded-2xl p-3 shadow-lg animate-fade-in">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onCategoryChange(category.id);
                  setShowFilters(false);
                }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5',
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-secondary/80 text-muted-foreground hover:bg-secondary'
                )}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filter Badge */}
      {hasActiveFilter && !showFilters && activeCategory && (
        <button
          onClick={() => setShowFilters(true)}
          className="glass rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 w-fit shadow-lg animate-fade-in"
        >
          <span>{activeCategory.icon}</span>
          <span>{activeCategory.label}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCategoryChange('all');
            }}
            className="ml-1 p-0.5 rounded-full hover:bg-secondary/50"
          >
            <X className="w-3 h-3" />
          </button>
        </button>
      )}
    </div>
  );
}
