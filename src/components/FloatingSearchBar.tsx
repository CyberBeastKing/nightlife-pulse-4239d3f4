import { Search, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { categories, utilityCategories } from '@/data/mockVenues';

interface FloatingSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedCategories: Set<string>;
  onCategoryToggle: (categoryId: string) => void;
}

export function FloatingSearchBar({
  searchValue,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
}: FloatingSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const hasUtilitySelected = utilityCategories.some((c) => selectedCategories.has(c.id));

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

      {/* Centered Category Chips - Toggle Select with POI Colors */}
      <div className="flex justify-center gap-2 flex-wrap">
        {categories.map((category) => {
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
        {utilityCategories.map((category) => {
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
