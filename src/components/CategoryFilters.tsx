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
              'whitespace-nowrap flex items-center gap-2 transition-all duration-200 px-4 py-2 rounded-full font-medium text-sm',
              isSelected ? 'scale-105' : 'opacity-80 hover:opacity-100'
            )}
            style={{
              backgroundColor: category.color,
              borderColor: category.color,
              color: '#fff',
              boxShadow: isSelected ? `0 0 16px ${category.color}80` : `0 0 8px ${category.color}40`,
            }}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
}
