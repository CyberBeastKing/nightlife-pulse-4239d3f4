import { Info, Check, X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export function DataTransparencySection() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            About Hawkly
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* What we collect */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">What data is collected</p>
          <div className="space-y-1.5">
            <DataItem icon="check" text="Presence at supported social venues" />
            <DataItem icon="check" text="Anonymous crowd signals (aggregate only)" />
            <DataItem icon="check" text="Venue category preferences" />
          </div>
        </div>
        
        {/* What we don't collect */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">What is NOT collected</p>
          <div className="space-y-1.5">
            <DataItem icon="x" text="Home or workplace locations" />
            <DataItem icon="x" text="Movement paths or trails" />
            <DataItem icon="x" text="Individual heatmaps or timelines" />
            <DataItem icon="x" text="Personal contacts or messages" />
            <DataItem icon="x" text="Arrival or departure timestamps per user" />
          </div>
        </div>
        
        {/* Why it matters */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hawkly shows aggregate signals like "~42 people active here" — never individual 
            locations. Your movement data is never sold or exported. Even we cannot see 
            where specific users have been.
          </p>
        </div>
      </div>
      
      {/* Links */}
      <div className="border-t border-border divide-y divide-border">
        <button 
          onClick={() => toast.info('Privacy Policy coming soon')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
        >
          <span className="text-sm text-foreground">Privacy Policy</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <button 
          onClick={() => toast.info('Terms of Service coming soon')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
        >
          <span className="text-sm text-foreground">Terms of Service</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

function DataItem({ icon, text }: { icon: 'check' | 'x'; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon === 'check' ? (
        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
      ) : (
        <X className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      )}
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  );
}
