import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@erp/ui';
import { useAnalyticsDashboard } from '../../data-layer/hooks/useReports';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function AnalyticsPage() {
  const { data: analytics } = useAnalyticsDashboard();

  const categoryColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  const categoryData = useMemo(
    () =>
      (analytics?.reportsByCategory ?? []).map((item: any, index: number) => ({
        ...item,
        fill: categoryColors[index],
      })),
    [analytics?.reportsByCategory]
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Analytics Dashboard</h1>
        <p className="text-xs text-text-muted">Track report usage trends and analytics across the organization</p>
      </div>

      {/* Reports Over Time */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reports Generated Over Time</CardTitle>
            <span className="text-xs text-text-muted">Last 6 months</span>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics?.reportsOverTime ?? []}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorCount)"
                name="Reports"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Reports by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Reports"
                  radius={[4, 4, 0, 0]}
                >
                  {categoryData.map((entry: any, index: number) => (
                    <rect key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Most Frequently Run Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(analytics?.topReports ?? []).map((report: any, index: number) => (
                <div
                  key={report.reportName}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-1 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-text-secondary">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-text-primary">
                      {report.reportName}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-text-primary">
                    {report.runCount} runs
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
