import { useMemo } from 'react';
import { Factory, CheckCircle2, Clock, Gauge } from 'lucide-react';
import { KPICard, Card, CardHeader, CardTitle, CardContent } from '@erp/ui';
import { useManufacturingOverview, useWorkOrders, useWorkCenters } from '../../data-layer/hooks/useManufacturing';
import { formatPercent } from '@erp/shared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

export default function ManufacturingOverview() {
  const { isDemo } = useAppMode();
  const { data: overview, isLoading: isLoadingOverview } = useManufacturingOverview();
  const { data: workOrders = [], isLoading: isLoadingWorkOrders } = useWorkOrders();
  const { data: workCenters = [] } = useWorkCenters();

  const isLoading = isLoadingOverview || isLoadingWorkOrders;

  // Calculate work orders by status
  const workOrdersByStatus = useMemo(() => {
    const statusCounts = workOrders.reduce((acc: Record<string, number>, wo: any) => {
      acc[wo.status] = (acc[wo.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { status: 'Pending', count: statusCounts.pending || 0 },
      { status: 'Released', count: statusCounts.released || 0 },
      { status: 'In Progress', count: statusCounts.in_progress || 0 },
      { status: 'Completed', count: statusCounts.completed || 0 },
      { status: 'Closed', count: statusCounts.closed || 0 },
    ];
  }, [workOrders]);

  if (isLoading || !overview) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-surface-2 animate-skeleton" />
        <div className="h-3 w-72 rounded bg-surface-2 animate-skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg border border-border bg-surface-1 animate-skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 rounded-lg border border-border bg-surface-1 animate-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Manufacturing Overview</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Real-time production metrics and work center performance
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(() => {
          const aw = overview.activeWorkOrders;
          const isRich = typeof aw === 'object' && aw?.label;
          return (
            <KPICard
              label={isRich ? aw.label : 'Active Work Orders'}
              value={isRich ? aw.formattedValue : String(aw ?? overview.activeWorkOrders ?? 0)}
              icon={<Factory className="h-4 w-4" />}
              trend={isRich ? aw.trend : undefined}
              trendValue={isRich ? `${aw.changePercent}%` : undefined}
              trendIsPositive={isRich ? aw.trendIsPositive : undefined}
            />
          );
        })()}
        {(() => {
          const cr = overview.completionRate;
          const isRich = typeof cr === 'object' && cr?.label;
          const total = overview.totalWorkOrders ?? 0;
          const completed = overview.completedWorkOrders ?? 0;
          const rate = total > 0 ? ((completed / total) * 100).toFixed(1) + '%' : '0%';
          return (
            <KPICard
              label={isRich ? cr.label : 'Completion Rate'}
              value={isRich ? cr.formattedValue : rate}
              icon={<CheckCircle2 className="h-4 w-4" />}
              trend={isRich ? cr.trend : undefined}
              trendValue={isRich ? `${cr.changePercent}%` : undefined}
              trendIsPositive={isRich ? cr.trendIsPositive : undefined}
            />
          );
        })()}
        {(() => {
          const ct = overview.avgCycleTime;
          const isRich = typeof ct === 'object' && ct?.label;
          return (
            <KPICard
              label={isRich ? ct.label : 'Total Work Orders'}
              value={isRich ? ct.formattedValue : String(overview.totalWorkOrders ?? 0)}
              icon={<Clock className="h-4 w-4" />}
              trend={isRich ? ct.trend : undefined}
              trendValue={isRich ? `${Math.abs(ct.changePercent || 0)}%` : undefined}
              trendIsPositive={isRich ? ct.trendIsPositive : undefined}
            />
          );
        })()}
        {(() => {
          const oee = overview.oee;
          const isRich = typeof oee === 'object' && oee?.label;
          return (
            <KPICard
              label={isRich ? oee.label : 'Active BOMs'}
              value={isRich ? oee.formattedValue : String(overview.activeBOMs ?? 0)}
              icon={<Gauge className="h-4 w-4" />}
              trend={isRich ? oee.trend : undefined}
              trendValue={isRich ? `${oee.changePercent}%` : undefined}
              trendIsPositive={isRich ? oee.trendIsPositive : undefined}
              sparklineData={isRich ? oee.sparklineData : undefined}
            />
          );
        })()}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Work Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Work Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={workOrdersByStatus}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="status"
                  stroke="var(--text-muted)"
                  fontSize={12}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="var(--brand-500)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Work Center Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Work Center Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workCenters.length === 0 && (
                <p className="text-xs text-text-muted text-center py-8">No work centers configured</p>
              )}
              {workCenters.map((wc: any) => {
                const eff = Number(wc.efficiencyPercent ?? 0);
                return (
                  <div key={wc.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-text-primary">{wc.workCenterName}</span>
                      <span className="text-text-muted">
                        {formatPercent(eff)} • {wc.capacityHoursPerDay ?? 0}h/day
                      </span>
                    </div>
                    <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${eff}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
