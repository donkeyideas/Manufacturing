import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, KPICard } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import { Building2, DollarSign, TrendingDown, Wrench } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { useAssetsOverview, useFixedAssets, useMaintenanceRecords } from '../../data-layer/hooks/useAssets';

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function AssetsOverview() {
  const { data: overview, isLoading: isLoadingOverview } = useAssetsOverview();
  const { data: assets = [] } = useFixedAssets();
  const { data: maintenanceRecords = [] } = useMaintenanceRecords();

  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    for (const asset of assets) {
      const cat = (asset as any).assetCategory || 'Uncategorized';
      catMap[cat] = (catMap[cat] || 0) + Number((asset as any).currentValue ?? (asset as any).originalCost ?? 0);
    }
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const upcomingMaintenance = useMemo(() => {
    return [...maintenanceRecords]
      .sort((a, b) => new Date(a.nextMaintenanceDate).getTime() - new Date(b.nextMaintenanceDate).getTime())
      .slice(0, 4);
  }, [maintenanceRecords]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMaintenanceTypeBadge = (type: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded';
    switch (type) {
      case 'preventive':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Preventive</span>;
      case 'corrective':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Corrective</span>;
      case 'inspection':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Inspection</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{type}</span>;
    }
  };

  if (isLoadingOverview) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-surface-2 animate-skeleton" />
        <div className="h-3 w-72 rounded bg-surface-2 animate-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-lg border border-border bg-surface-1 animate-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Assets Overview</h1>
        <p className="text-xs text-text-muted">Track and manage your organization's fixed assets and maintenance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={overview?.totalAssets?.label ?? 'Total Assets'}
          value={overview?.totalAssets?.formattedValue ?? String(overview?.totalAssets ?? assets.length)}
          trend={overview?.totalAssets?.trend}
          trendValue={overview?.totalAssets?.changePercent != null ? `${overview.totalAssets.changePercent}%` : undefined}
          trendIsPositive={overview?.totalAssets?.trendIsPositive}
          icon={<Building2 className="h-5 w-5" />}
        />
        <KPICard
          label={overview?.totalAssetValue?.label ?? 'Total Asset Value'}
          value={overview?.totalAssetValue?.formattedValue ?? formatCurrency(overview?.totalValue ?? 0)}
          trend={overview?.totalAssetValue?.trend}
          trendValue={overview?.totalAssetValue?.changePercent != null ? `${overview.totalAssetValue.changePercent}%` : undefined}
          trendIsPositive={overview?.totalAssetValue?.trendIsPositive}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          label={overview?.monthlyDepreciation?.label ?? 'Monthly Depreciation'}
          value={overview?.monthlyDepreciation?.formattedValue ?? 'N/A'}
          trend={overview?.monthlyDepreciation?.trend}
          trendValue={overview?.monthlyDepreciation?.changePercent != null ? `${overview.monthlyDepreciation.changePercent}%` : undefined}
          trendIsPositive={overview?.monthlyDepreciation?.trendIsPositive}
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <KPICard
          label={overview?.maintenanceCost?.label ?? 'Maintenance Records'}
          value={overview?.maintenanceCost?.formattedValue ?? String(maintenanceRecords.length)}
          trend={overview?.maintenanceCost?.trend}
          trendValue={overview?.maintenanceCost?.changePercent != null ? `${overview.maintenanceCost.changePercent}%` : undefined}
          trendIsPositive={overview?.maintenanceCost?.trendIsPositive}
          icon={<Wrench className="h-5 w-5" />}
        />
      </div>

      {/* Assets by Category Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Assets by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-sm text-text-muted">
              No category data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMaintenance.length > 0 ? (
            <div className="space-y-3">
              {upcomingMaintenance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-1 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-full bg-surface-1">
                      <Wrench className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {record.assetName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-text-muted">{record.assetNumber}</p>
                        <span className="text-xs text-text-muted">-</span>
                        <p className="text-xs text-text-muted">{record.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getMaintenanceTypeBadge(record.maintenanceType)}
                    <p className="text-sm font-medium text-text-secondary">
                      {formatDate(record.nextMaintenanceDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted py-4 text-center">No upcoming maintenance records</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
