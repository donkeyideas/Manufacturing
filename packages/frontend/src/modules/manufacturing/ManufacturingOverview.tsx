import { useMemo } from 'react';
import { Factory, CheckCircle2, Clock, Gauge } from 'lucide-react';
import { KPICard, Card, CardHeader, CardTitle, CardContent } from '@erp/ui';
import { useManufacturingOverview, useWorkOrders } from '../../data-layer/hooks/useManufacturing';
import { getWorkCenters } from '@erp/demo-data';
import { formatPercent } from '@erp/shared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ManufacturingOverview() {
  const { data: overview, isLoading: isLoadingOverview } = useManufacturingOverview();
  const { data: workOrders = [], isLoading: isLoadingWorkOrders } = useWorkOrders();
  const workCenters = useMemo(() => getWorkCenters(), []);

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
        <KPICard
          label={overview.activeWorkOrders.label}
          value={overview.activeWorkOrders.formattedValue}
          icon={<Factory className="h-4 w-4" />}
          trend={overview.activeWorkOrders.trend}
          trendValue={`${overview.activeWorkOrders.changePercent}%`}
          trendIsPositive={overview.activeWorkOrders.trendIsPositive}
        />
        <KPICard
          label={overview.completionRate.label}
          value={overview.completionRate.formattedValue}
          icon={<CheckCircle2 className="h-4 w-4" />}
          trend={overview.completionRate.trend}
          trendValue={`${overview.completionRate.changePercent}%`}
          trendIsPositive={overview.completionRate.trendIsPositive}
        />
        <KPICard
          label={overview.avgCycleTime.label}
          value={overview.avgCycleTime.formattedValue}
          icon={<Clock className="h-4 w-4" />}
          trend={overview.avgCycleTime.trend}
          trendValue={`${Math.abs(overview.avgCycleTime.changePercent || 0)}%`}
          trendIsPositive={overview.avgCycleTime.trendIsPositive}
        />
        <KPICard
          label={overview.oee.label}
          value={overview.oee.formattedValue}
          icon={<Gauge className="h-4 w-4" />}
          trend={overview.oee.trend}
          trendValue={`${overview.oee.changePercent}%`}
          trendIsPositive={overview.oee.trendIsPositive}
          sparklineData={overview.oee.sparklineData}
        />
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
              {workCenters.map((wc) => (
                <div key={wc.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text-primary">{wc.workCenterName}</span>
                    <span className="text-text-muted">
                      {formatPercent(wc.efficiencyPercent)} • {wc.capacityHoursPerDay}h/day
                    </span>
                  </div>
                  <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${wc.efficiencyPercent}%` }}
                    />
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
