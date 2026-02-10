import { useMemo } from 'react';
import { ShoppingCart, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { KPICard, Card, CardHeader, CardTitle, CardContent, Badge } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import { getSalesOverview, getSalesOrders } from '@erp/demo-data';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  draft: 'var(--color-gray-400)',
  approved: 'var(--color-blue-500)',
  in_progress: 'var(--color-purple-500)',
  shipped: 'var(--color-amber-500)',
  delivered: 'var(--color-emerald-500)',
  closed: 'var(--color-gray-500)',
  cancelled: 'var(--color-red-500)',
};

export default function SalesOverview() {
  const overview = useMemo(() => getSalesOverview(), []);
  const allOrders = useMemo(() => getSalesOrders(), []);

  // Calculate orders by status for donut chart
  const ordersByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    allOrders.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
      color: STATUS_COLORS[status],
    }));
  }, [allOrders]);

  // Get recent orders (top 5, sorted by date)
  const recentOrders = useMemo(() => {
    return [...allOrders]
      .sort((a, b) => new Date(b.soDate).getTime() - new Date(a.soDate).getTime())
      .slice(0, 5);
  }, [allOrders]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Sales Overview</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Track sales performance and order status
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={overview.totalOrders.label}
          value={overview.totalOrders.formattedValue}
          icon={<ShoppingCart className="h-4 w-4" />}
          trend={overview.totalOrders.trend}
          trendValue={`${overview.totalOrders.changePercent}%`}
          trendIsPositive={overview.totalOrders.trendIsPositive}
        />
        <KPICard
          label={overview.totalRevenue.label}
          value={overview.totalRevenue.formattedValue}
          icon={<DollarSign className="h-4 w-4" />}
          trend={overview.totalRevenue.trend}
          trendValue={`${overview.totalRevenue.changePercent}%`}
          trendIsPositive={overview.totalRevenue.trendIsPositive}
          sparklineData={overview.totalRevenue.sparklineData}
        />
        <KPICard
          label={overview.avgOrderValue.label}
          value={overview.avgOrderValue.formattedValue}
          icon={<TrendingUp className="h-4 w-4" />}
          trend={overview.avgOrderValue.trend}
          trendValue={`${overview.avgOrderValue.changePercent}%`}
          trendIsPositive={overview.avgOrderValue.trendIsPositive}
        />
        <KPICard
          label={overview.openQuotes.label}
          value={overview.openQuotes.formattedValue}
          icon={<FileText className="h-4 w-4" />}
          trend={overview.openQuotes.trend}
          trendValue={`${overview.openQuotes.changePercent}%`}
          trendIsPositive={overview.openQuotes.trendIsPositive}
        />
      </div>

      {/* Charts and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders by Status Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface-1)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-text-secondary">{value}</span>
                  )}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-surface-2 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-text-primary">
                        {order.soNumber}
                      </p>
                      <Badge
                        variant={
                          order.status === 'draft'
                            ? 'default'
                            : order.status === 'approved'
                            ? 'info'
                            : order.status === 'in_progress'
                            ? 'primary'
                            : order.status === 'shipped'
                            ? 'warning'
                            : order.status === 'delivered'
                            ? 'success'
                            : order.status === 'cancelled'
                            ? 'danger'
                            : 'default'
                        }
                      >
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="text-2xs text-text-muted mt-0.5">
                      {order.customerName} • {format(new Date(order.soDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-text-primary">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    {order.orderType === 'rush' && (
                      <p className="text-2xs text-amber-600 dark:text-amber-400 font-medium">
                        Rush
                      </p>
                    )}
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
