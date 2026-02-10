import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, AlertTriangle, Gauge,
  Clock, Sparkles, ArrowRight, TrendingUp, TrendingDown,
  Factory, Package, Truck, Users,
} from 'lucide-react';
import { KPICard, Card, CardHeader, CardTitle, CardContent, Badge, Button, cn } from '@erp/ui';
import { formatCurrency, formatPercent } from '@erp/shared';
import {
  getDashboardSummary,
  getRevenueChartDataMultiRange,
  getOrdersChartDataMultiRange,
  getProductionStatus,
  getPendingApprovals,
  getActivityFeed,
  getAIInsights,
  getModuleCards,
} from '@erp/demo-data';
import { RevenueChart } from './components/RevenueChart';
import { ProductionDonut } from './components/ProductionDonut';
import { formatDistanceToNow } from 'date-fns';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign className="h-4 w-4" />,
  Factory: <Factory className="h-4 w-4" />,
  ShoppingCart: <ShoppingCart className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  Truck: <Truck className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const summary = useMemo(() => getDashboardSummary(), []);
  const revenueData = useMemo(() => getRevenueChartDataMultiRange(), []);
  const ordersData = useMemo(() => getOrdersChartDataMultiRange(), []);
  const productionStatus = useMemo(() => getProductionStatus(), []);
  const pendingApprovals = useMemo(() => getPendingApprovals(), []);
  const activityFeed = useMemo(() => getActivityFeed(), []);
  const aiInsights = useMemo(() => getAIInsights(), []);
  const moduleCards = useMemo(() => getModuleCards(), []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Welcome back. Here's what's happening today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-2xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
          <span>|</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={summary.revenue.label}
          value={summary.revenue.formattedValue}
          icon={<DollarSign className="h-4 w-4" />}
          trend={summary.revenue.trend}
          trendValue={`${summary.revenue.changePercent}%`}
          trendIsPositive={summary.revenue.trendIsPositive}
          sparklineData={summary.revenue.sparklineData}
        />
        <KPICard
          label={summary.orders.label}
          value={summary.orders.formattedValue}
          icon={<ShoppingCart className="h-4 w-4" />}
          trend={summary.orders.trend}
          trendValue={`${summary.orders.changePercent}%`}
          trendIsPositive={summary.orders.trendIsPositive}
          sparklineData={summary.orders.sparklineData}
        />
        <KPICard
          label={summary.inventoryAlerts.label}
          value={summary.inventoryAlerts.formattedValue}
          icon={<AlertTriangle className="h-4 w-4" />}
          trend={summary.inventoryAlerts.trend}
          trendValue={`${summary.inventoryAlerts.changePercent}%`}
          trendIsPositive={summary.inventoryAlerts.trendIsPositive}
        />
        <KPICard
          label={summary.productionEfficiency.label}
          value={summary.productionEfficiency.formattedValue}
          icon={<Gauge className="h-4 w-4" />}
          trend={summary.productionEfficiency.trend}
          trendValue={`${summary.productionEfficiency.changePercent}%`}
          trendIsPositive={summary.productionEfficiency.trendIsPositive}
          sparklineData={summary.productionEfficiency.sparklineData}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart revenueData={revenueData} ordersData={ordersData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductionDonut data={productionStatus} />
          </CardContent>
        </Card>
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Approvals</CardTitle>
              <Badge variant="primary">{pendingApprovals.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {pendingApprovals.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-md p-2 hover:bg-surface-2 transition-colors cursor-pointer group"
              >
                <div
                  className={cn(
                    'mt-0.5 h-2 w-2 rounded-full shrink-0',
                    item.urgency === 'high' ? 'bg-red-500' :
                    item.urgency === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xs text-text-muted">{item.requestedBy}</span>
                    {item.amount && (
                      <span className="text-2xs font-medium text-text-secondary">
                        {formatCurrency(item.amount)}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              </div>
            ))}
            <button className="w-full text-center text-2xs text-brand-600 dark:text-brand-400 font-medium py-1.5 hover:bg-surface-2 rounded-md transition-colors mt-1">
              View All Approvals
            </button>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {activityFeed.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-md p-2 hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-text-muted shrink-0">
                  <Clock className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-primary">
                    <span className="font-medium">{item.userName}</span>{' '}
                    {item.action} {item.entity}{' '}
                    <span className="text-brand-600 dark:text-brand-400">{item.entityId}</span>
                  </p>
                  <p className="text-2xs text-text-muted mt-0.5">
                    {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <CardTitle>AI Insights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-md border border-border p-2.5 hover:bg-surface-2 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={
                      insight.severity === 'high' ? 'danger' :
                      insight.severity === 'medium' ? 'warning' : 'info'
                    }
                  >
                    {insight.type}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-text-primary">{insight.title}</p>
                <p className="text-2xs text-text-muted mt-0.5 line-clamp-2">
                  {insight.description}
                </p>
                {insight.actionLabel && (
                  <button
                    onClick={() => insight.actionLink && navigate(insight.actionLink)}
                    className="mt-1.5 flex items-center gap-1 text-2xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    {insight.actionLabel}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Module Quick Access */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {moduleCards.map((mod) => {
            const icon = MODULE_ICONS[mod.icon];
            return (
              <Card
                key={mod.id}
                className="p-3 cursor-pointer hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all group"
                onClick={() => navigate(mod.path)}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md mb-2"
                  style={{ backgroundColor: `${mod.color}15`, color: mod.color }}
                >
                  {icon || <div className="h-4 w-4" />}
                </div>
                <p className="text-xs font-semibold text-text-primary">{mod.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-2xs text-text-muted">{mod.kpiLabel}:</span>
                  <span className="text-2xs font-medium text-text-primary">{mod.kpiValue}</span>
                  {mod.kpiTrend === 'up' && <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />}
                  {mod.kpiTrend === 'down' && <TrendingDown className="h-2.5 w-2.5 text-red-500" />}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
