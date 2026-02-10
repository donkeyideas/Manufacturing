import { useMemo } from 'react';
import { getHomepageStats } from '@erp/demo-data';

export function StatsBar() {
  const stats = useMemo(() => getHomepageStats(), []);

  return (
    <section className="py-16 bg-surface-1 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-text-primary mb-0.5">
                {stat.label}
              </div>
              <div className="text-xs text-text-muted">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
