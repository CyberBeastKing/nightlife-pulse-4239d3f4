import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CrowdStatus, ActivityTrend } from './types';

interface CrowdSignalsProps {
  crowdStatus: CrowdStatus;
  crowdCount: string;
  activityTrend: ActivityTrend;
  categoryColor: string;
}

const crowdStatusConfig: Record<CrowdStatus, { label: string; class: string }> = {
  quiet: { label: 'Quiet', class: 'bg-muted text-muted-foreground' },
  active: { label: 'Active', class: 'bg-primary/20 text-primary' },
  busy: { label: 'Busy', class: 'bg-accent/20 text-accent' },
};

const trendConfig: Record<ActivityTrend, { icon: typeof TrendingUp; label: string; class: string }> = {
  rising: { icon: TrendingUp, label: 'Activity picking up', class: 'text-green-400' },
  steady: { icon: Minus, label: 'Steady activity', class: 'text-muted-foreground' },
  falling: { icon: TrendingDown, label: 'Quieting down', class: 'text-orange-400' },
};

export function CrowdSignals({ crowdStatus, crowdCount, activityTrend, categoryColor }: CrowdSignalsProps) {
  const statusConfig = crowdStatusConfig[crowdStatus];
  const trend = trendConfig[activityTrend];
  const TrendIcon = trend.icon;

  return (
    <div 
      className="glass-strong rounded-xl p-4 border-l-4"
      style={{ borderLeftColor: categoryColor }}
    >
      {/* Crowd meter row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{crowdCount}</span>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusConfig.class)}>
          {statusConfig.label}
        </span>
      </div>

      {/* Trend indicator */}
      <div className={cn('flex items-center gap-2 text-sm', trend.class)}>
        <TrendIcon className="w-4 h-4" />
        <span>{trend.label}</span>
      </div>
    </div>
  );
}
