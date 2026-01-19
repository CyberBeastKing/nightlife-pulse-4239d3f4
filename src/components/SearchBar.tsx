import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search places...' }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div 
      className={cn(
        'glass rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-300',
        isFocused && 'ring-2 ring-primary/50 glow-primary'
      )}
    >
      <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
      />
      
      {value && (
        <button
          onClick={() => onChange('')}
          className="p-1 rounded-full hover:bg-secondary/50 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
