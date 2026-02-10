import { cn } from '../lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValue?: boolean;
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorMap = {
  brand: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max,
  label,
  showValue = true,
  color = 'brand',
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-xs text-text-secondary">{label}</span>}
          {showValue && (
            <span className="text-xs font-medium text-text-primary">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-surface-2', sizeMap[size])}>
        <div
          className={cn('rounded-full transition-all duration-500', colorMap[color], sizeMap[size])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
