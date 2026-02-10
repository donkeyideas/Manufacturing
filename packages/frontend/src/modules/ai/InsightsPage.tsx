import { useState, useMemo } from 'react';
import { AlertTriangle, TrendingUp, Lightbulb, Bell } from 'lucide-react';
import { Card, CardContent, Badge } from '@erp/ui';
import { useAIInsights } from '../../data-layer/hooks/useAI';
import { format } from 'date-fns';

const CATEGORY_CONFIG: Record<string, { icon: typeof AlertTriangle; color: string; bgColor: string }> = {
  anomaly: { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  prediction: { icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  recommendation: { icon: Lightbulb, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  alert: { icon: Bell, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

const SEVERITY_VARIANT: Record<string, 'default' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'anomaly', label: 'Anomalies' },
  { key: 'prediction', label: 'Predictions' },
  { key: 'recommendation', label: 'Recommendations' },
  { key: 'alert', label: 'Alerts' },
];

export default function InsightsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { data, isLoading } = useAIInsights();
  const items = useMemo(() => data ?? [], [data]);

  const filteredInsights = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((insight: any) => insight.category === activeFilter);
  }, [items, activeFilter]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">AI Insights</h1>
        <p className="text-xs text-text-muted mt-0.5">
          AI-generated insights and recommendations across your business
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              activeFilter === tab.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-surface-1 text-text-secondary border-border hover:bg-surface-2'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Insights List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-text-muted">Loading insights...</p>
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-text-muted">No insights found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredInsights.map((insight: any) => {
            const config = CATEGORY_CONFIG[insight.category];
            const IconComponent = config?.icon || AlertTriangle;

            return (
              <Card key={insight.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <div className={`p-2 rounded-lg ${config?.bgColor || 'bg-gray-100'} shrink-0`}>
                      <IconComponent className={`h-4 w-4 ${config?.color || 'text-gray-600'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-text-primary">
                            {insight.title}
                          </p>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed">
                            {insight.description}
                          </p>
                        </div>

                        {/* Severity & Module Badges */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={SEVERITY_VARIANT[insight.severity] || 'default'}>
                            {insight.severity}
                          </Badge>
                          <Badge variant="default">
                            {insight.module}
                          </Badge>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-text-muted">
                          {format(new Date(insight.createdAt), 'MMM dd, yyyy h:mm a')}
                        </span>
                        <a
                          href={insight.actionUrl}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
