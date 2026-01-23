import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlaceChat, CrowdStatus } from './types';

interface PlaceChatCardProps {
  chat: PlaceChat;
  onClick: () => void;
}

const crowdStatusConfig: Record<CrowdStatus, { label: string; class: string }> = {
  quiet: { label: 'Quiet', class: 'bg-muted/50 text-muted-foreground' },
  active: { label: 'Active', class: 'bg-primary/20 text-primary' },
  busy: { label: 'Busy', class: 'bg-accent/20 text-accent' },
};

export function PlaceChatCard({ chat, onClick }: PlaceChatCardProps) {
  const statusConfig = crowdStatusConfig[chat.crowdStatus];

  return (
    <button
      onClick={onClick}
      className="w-full glass rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:bg-card/90 active:scale-[0.98] border-l-4"
      style={{ borderLeftColor: chat.categoryColor }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Place info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{chat.categoryEmoji}</span>
            <h3 className="font-semibold text-foreground truncate">{chat.placeName}</h3>
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusConfig.class)}>
              {statusConfig.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {chat.distance < 1 ? `${Math.round(chat.distance * 5280)} ft` : `${chat.distance.toFixed(1)} mi`}
            </span>
          </div>
        </div>

        {/* Right: Activity indicator */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{chat.recentMessageCount}</span>
          </div>
          <span className="text-xs text-muted-foreground/70">last 10 min</span>
        </div>
      </div>
    </button>
  );
}
