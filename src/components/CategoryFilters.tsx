import { cn } from '@/lib/utils';
import { categories } from '@/data/mockVenues';

interface CategoryFiltersProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryFilters({ selectedCategory, onSelect }: CategoryFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={cn(
              'category-chip whitespace-nowrap flex items-center gap-2 transition-all duration-200',
              isSelected && 'category-chip-active'
            )}
            style={isSelected ? {
              backgroundColor: category.color,
              borderColor: category.color,
              color: '#fff',
              boxShadow: `0 0 12px ${category.color}60`,
            } : undefined}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
