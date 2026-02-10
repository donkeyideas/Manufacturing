import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ProductionStatusData } from '@erp/shared';

interface ProductionDonutProps {
  data: ProductionStatusData;
}

const COLORS = {
  completed: '#10b981',
  inProgress: '#3b82f6',
  scheduled: '#8b5cf6',
  delayed: '#ef4444',
};

const LABELS: Record<string, string> = {
  completed: 'Completed',
  inProgress: 'In Progress',
  scheduled: 'Scheduled',
  delayed: 'Delayed',
};

export function ProductionDonut({ data }: ProductionDonutProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: LABELS[key] || key,
    value,
    color: COLORS[key as keyof typeof COLORS],
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="h-56 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              fontSize: '12px',
              color: 'var(--text-primary)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: '2.5rem' }}>
        <div className="text-center">
          <span className="text-xl font-bold text-text-primary">{total}</span>
          <p className="text-2xs text-text-muted">Work Orders</p>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-0">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-2xs text-text-muted">
              {entry.name} ({entry.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
