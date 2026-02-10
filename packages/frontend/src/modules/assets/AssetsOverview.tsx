import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, KPICard } from '@erp/ui';
import { getAssetsOverview, getMaintenanceRecords } from '@erp/demo-data';
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

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const categoryData = [
  { name: 'Machinery', value: 1800000 },
  { name: 'Vehicles', value: 650000 },
  { name: 'Office Equipment', value: 420000 },
  { name: 'IT Equipment', value: 380000 },
  { name: 'Building', value: 1000000 },
];

export default function AssetsOverview() {
  const overview = useMemo(() => getAssetsOverview(), []);
  const maintenanceRecords = useMemo(() => getMaintenanceRecords(), []);

  const upcomingMaintenance = useMemo(() => {
    return [...maintenanceRecords]
      .sort((a, b) => new Date(a.nextMaintenanceDate).getTime() - new Date(b.nextMaintenanceDate).getTime())
      .slice(0, 4);
  }, [maintenanceRecords]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
          label={overview.totalAssets.label}
          value={overview.totalAssets.formattedValue}
          trend={overview.totalAssets.trend}
          trendValue={`${overview.totalAssets.changePercent}%`}
          trendIsPositive={overview.totalAssets.trendIsPositive}
          icon={<Building2 className="h-5 w-5" />}
        />
        <KPICard
          label={overview.totalAssetValue.label}
          value={overview.totalAssetValue.formattedValue}
          trend={overview.totalAssetValue.trend}
          trendValue={`${overview.totalAssetValue.changePercent}%`}
          trendIsPositive={overview.totalAssetValue.trendIsPositive}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          label={overview.monthlyDepreciation.label}
          value={overview.monthlyDepreciation.formattedValue}
          trend={overview.monthlyDepreciation.trend}
          trendValue={`${overview.monthlyDepreciation.changePercent}%`}
          trendIsPositive={overview.monthlyDepreciation.trendIsPositive}
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <KPICard
          label={overview.maintenanceCost.label}
          value={overview.maintenanceCost.formattedValue}
          trend={overview.maintenanceCost.trend}
          trendValue={`${overview.maintenanceCost.changePercent}%`}
          trendIsPositive={overview.maintenanceCost.trendIsPositive}
          icon={<Wrench className="h-5 w-5" />}
        />
      </div>

      {/* Assets by Category Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Assets by Category</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Upcoming Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
