import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { RevenueChartData } from '@erp/shared';
import { formatCurrency, formatCompact } from '@erp/shared';
import { cn } from '@erp/ui';

type TimeRange = 'daily' | 'weekly' | 'monthly';
type Metric = 'revenue' | 'orders';

interface RevenueChartProps {
  revenueData: RevenueChartData;
  ordersData: RevenueChartData;
}

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'daily', label: '30D' },
  { key: 'weekly', label: '12W' },
  { key: 'monthly', label: '12M' },
];

const METRICS: { key: Metric; label: string }[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'orders', label: 'Orders' },
];

export function RevenueChart({ revenueData, ordersData }: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [metric, setMetric] = useState<Metric>('revenue');

  const chartData = useMemo(() => {
    const source = metric === 'revenue' ? revenueData : ordersData;
    return source[timeRange];
  }, [metric, timeRange, revenueData, ordersData]);

  const isRevenue = metric === 'revenue';
  const color = isRevenue ? '#3b82f6' : '#10b981';
  const gradientId = `chartGradient-${metric}`;

  const formatValue = isRevenue
    ? (v: number) => `$${formatCompact(v)}`
    : (v: number) => v.toString();

  const tooltipFormatter = isRevenue
    ? (value: number) => [formatCurrency(value), 'Revenue']
    : (value: number) => [value.toLocaleString(), 'Orders'];

  const xInterval = timeRange === 'daily' ? 4 : timeRange === 'weekly' ? 1 : 1;

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex items-center gap-1 rounded-lg bg-surface-2 p-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                metric === m.key
                  ? 'bg-surface-1 text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg bg-surface-2 p-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setTimeRange(r.key)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                timeRange === r.key
                  ? 'bg-surface-1 text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {isRevenue ? (
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                tickLine={false} axisLine={false}
                interval={xInterval}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                tickLine={false} axisLine={false}
                tickFormatter={formatValue}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
                formatter={tooltipFormatter}
              />
              <Area
                type="monotone" dataKey="value"
                stroke={color} strokeWidth={2}
                fill={`url(#${gradientId})`}
                animationDuration={500}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                tickLine={false} axisLine={false}
                interval={xInterval}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                tickLine={false} axisLine={false}
                tickFormatter={formatValue}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                }}
                formatter={tooltipFormatter}
              />
              <Bar
                dataKey="value" fill={color}
                radius={[4, 4, 0, 0]}
                animationDuration={500}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
