import { Search, X } from 'lucide-react';
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

  return (
    <div className="absolute top-4 left-0 right-0 z-[1000] space-y-2 px-4">
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
      </div>

      {/* Horizontal Scrolling Category Chips (Google Maps style) */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'glass px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md flex-shrink-0',
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/50'
                : 'hover:bg-secondary/80'
            )}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
