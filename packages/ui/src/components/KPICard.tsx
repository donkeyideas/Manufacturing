import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../lib/utils';

interface KPICardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  trendIsPositive?: boolean;
  sparklineData?: number[];
  className?: string;
}

export function KPICard({
  label,
  value,
  icon,
  trend,
  trendValue,
  trendIsPositive = true,
  sparklineData,
  className,
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'flat'
      ? 'text-text-muted'
      : (trend === 'up' && trendIsPositive) || (trend === 'down' && !trendIsPositive)
        ? 'text-emerald-500'
        : 'text-red-500';

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface-1 p-4 transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2">
        <span className="text-2xl font-bold text-text-primary">{value}</span>
      </div>

      {(trend || sparklineData) && (
        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {trendValue && <span>{trendValue}</span>}
            </div>
          )}
          {sparklineData && (
            <MiniSparkline data={sparklineData} color={trendColor} />
          )}
        </div>
      )}
    </div>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 20;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className={cn('ml-auto', color)}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
