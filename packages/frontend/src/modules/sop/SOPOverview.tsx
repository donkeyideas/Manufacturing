import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, KPICard } from '@erp/ui';
import { useSOPOverview, useSOPs } from '../../data-layer/hooks/useSOP';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import type { SOP, SOPRevision } from '@erp/shared';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const DEPT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SOPOverview() {
  const { data: overview } = useSOPOverview();
  const { data: sopsData } = useSOPs();

  const sops: SOP[] = useMemo(() => sopsData ?? [], [sopsData]);

  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sop of sops) {
      counts[sop.department] = (counts[sop.department] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [sops]);

  const recentActivity = useMemo(() => {
    const allRevisions: (SOPRevision & { sopTitle: string; sopNumber: string })[] = sops.flatMap(
      (sop: SOP) =>
        (sop.revisionHistory || []).map((rev: SOPRevision) => ({
          sopTitle: sop.title,
          sopNumber: sop.sopNumber,
          ...rev,
        }))
    );
    return allRevisions
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(0, 5);
  }, [sops]);

  if (!overview) return null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">SOP Overview</h1>
        <p className="text-xs text-text-muted">Standard Operating Procedures management and compliance tracking</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={overview.totalSOPs.label}
          value={overview.totalSOPs.formattedValue}
          trend={overview.totalSOPs.trend}
          trendValue={`${overview.totalSOPs.changePercent > 0 ? '+' : ''}${overview.totalSOPs.changePercent}%`}
          trendIsPositive={overview.totalSOPs.trendIsPositive}
          icon={<FileText className="h-5 w-5" />}
        />
        <KPICard
          label={overview.publishedSOPs.label}
          value={overview.publishedSOPs.formattedValue}
          trend={overview.publishedSOPs.trend}
          trendValue={`${overview.publishedSOPs.changePercent > 0 ? '+' : ''}${overview.publishedSOPs.changePercent}%`}
          trendIsPositive={overview.publishedSOPs.trendIsPositive}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <KPICard
          label={overview.pendingAcknowledgments.label}
          value={overview.pendingAcknowledgments.formattedValue}
          trend={overview.pendingAcknowledgments.trend}
          trendValue={`${overview.pendingAcknowledgments.changePercent > 0 ? '+' : ''}${overview.pendingAcknowledgments.changePercent}%`}
          trendIsPositive={overview.pendingAcknowledgments.trendIsPositive}
          icon={<Clock className="h-5 w-5" />}
        />
        <KPICard
          label={overview.overdueReviews.label}
          value={overview.overdueReviews.formattedValue}
          trend={overview.overdueReviews.trend}
          trendValue={`${overview.overdueReviews.changePercent > 0 ? '+' : ''}${overview.overdueReviews.changePercent}%`}
          trendIsPositive={overview.overdueReviews.trendIsPositive}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>SOPs by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                >
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent SOP Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div
                  key={`${activity.sopNumber}-${activity.version}-${i}`}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-surface-1 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {activity.sopTitle}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      v{activity.version} - {activity.changeDescription}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xs text-text-muted">{activity.changedBy}</span>
                      <span className="text-2xs text-text-muted">
                        {new Date(activity.changedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
