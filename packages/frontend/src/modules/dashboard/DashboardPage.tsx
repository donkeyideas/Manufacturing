import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, AlertTriangle, Gauge,
  Clock, Sparkles, ArrowRight, TrendingUp, TrendingDown,
  Factory, Package, Truck, Users, Timer, Shield,
  CheckCircle, Zap, FlaskConical, Award, Scissors,
  FileEdit, Building2, FolderKanban,
} from 'lucide-react';
import { KPICard, Card, CardHeader, CardTitle, CardContent, Badge, cn } from '@erp/ui';
import { formatCurrency, formatCompact } from '@erp/shared';
import {
  getRevenueChartDataMultiRange,
  getOrdersChartDataMultiRange,
  getProductionStatus,
  getActivityFeed,
  getIndustryAIInsights,
  getIndustryPendingApprovals,
  getIndustryModuleCards,
} from '@erp/demo-data';
import { useIndustry, useAppMode } from '../../data-layer/providers/AppModeProvider';
import { useDashboardSummary } from '../../data-layer/hooks/useDashboard';
import { useWorkOrders } from '../../data-layer/hooks/useManufacturing';
import { useSalesOrders } from '../../data-layer/hooks/useSales';
import { usePurchaseOrders } from '../../data-layer/hooks/useProcurement';
import { RevenueChart, type TimeRange } from './components/RevenueChart';
import { ProductionDonut } from './components/ProductionDonut';
import { IndustrySelector } from './components/IndustrySelector';
import { formatDistanceToNow } from 'date-fns';

const ICON_MAP: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign className="h-4 w-4" />,
  ShoppingCart: <ShoppingCart className="h-4 w-4" />,
  AlertTriangle: <AlertTriangle className="h-4 w-4" />,
  Gauge: <Gauge className="h-4 w-4" />,
  Timer: <Timer className="h-4 w-4" />,
  Truck: <Truck className="h-4 w-4" />,
  Shield: <Shield className="h-4 w-4" />,
  CheckCircle: <CheckCircle className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  Clock: <Clock className="h-4 w-4" />,
  FlaskConical: <FlaskConical className="h-4 w-4" />,
  Award: <Award className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  Scissors: <Scissors className="h-4 w-4" />,
  FileEdit: <FileEdit className="h-4 w-4" />,
  Factory: <Factory className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  FolderKanban: <FolderKanban className="h-4 w-4" />,
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { isDemo } = useAppMode();
  const { industryType, setIndustryType, industryProfile } = useIndustry();

  // KPI summary — uses hook (demo or live)
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();

  // Shared time-range state for charts + production donut
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  // Fetch real data for charts in live mode
  const { data: workOrders = [] } = useWorkOrders();
  const { data: salesOrders = [] } = useSalesOrders();
  const { data: purchaseOrders = [] } = usePurchaseOrders();

  // Cutoff date based on active time range
  const rangeCutoff = useMemo(() => {
    const now = new Date();
    if (timeRange === 'daily') { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
    if (timeRange === 'weekly') { const d = new Date(now); d.setDate(d.getDate() - 84); return d; }
    const d = new Date(now); d.setMonth(d.getMonth() - 12); return d;
  }, [timeRange]);

  // Production status — from real work orders, filtered by time range
  const productionStatus = useMemo(() => {
    if (isDemo) return getProductionStatus();
    const statusMap: Record<string, number> = {};
    for (const wo of workOrders) {
      const woDate = new Date((wo as any).startDate || (wo as any).createdAt || '2000-01-01');
      if (woDate < rangeCutoff) continue;
      const s = (wo as any).status || 'planned';
      if (s === 'completed' || s === 'closed') statusMap.completed = (statusMap.completed || 0) + 1;
      else if (s === 'in_progress') statusMap.inProgress = (statusMap.inProgress || 0) + 1;
      else if (s === 'planned' || s === 'released') statusMap.scheduled = (statusMap.scheduled || 0) + 1;
      else statusMap.delayed = (statusMap.delayed || 0) + 1;
    }
    return statusMap;
  }, [isDemo, workOrders, rangeCutoff]);

  // Revenue & Orders charts — proper time-range grouping from real sales orders
  const { revenueData, ordersData } = useMemo(() => {
    if (isDemo) {
      return {
        revenueData: getRevenueChartDataMultiRange(),
        ordersData: getOrdersChartDataMultiRange(),
      };
    }

    const now = new Date();

    // Helper: get ISO week-start key (Monday) for a date
    const weekKey = (d: Date) => {
      const copy = new Date(d);
      const day = copy.getDay();
      copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1));
      return copy.toISOString().slice(0, 10);
    };

    // Pre-parse all sales orders once
    const parsed = salesOrders.map((so: any) => {
      const d = so.soDate || so.orderDate;
      if (!d) return null;
      const date = new Date(d);
      return { date, amount: Number(so.totalAmount ?? 0) };
    }).filter(Boolean) as { date: Date; amount: number }[];

    // ---- DAILY (last 30 days) ----
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevMap: Record<string, number> = {};
    const dailyOrdMap: Record<string, number> = {};
    for (const p of parsed) {
      if (p.date < thirtyDaysAgo) continue;
      const key = p.date.toISOString().slice(0, 10);
      dailyRevMap[key] = (dailyRevMap[key] || 0) + p.amount;
      dailyOrdMap[key] = (dailyOrdMap[key] || 0) + 1;
    }
    const dailyRev = Object.entries(dailyRevMap).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const d = new Date(key + 'T00:00:00');
        return { label: `${d.toLocaleString('en', { month: 'short' })} ${d.getDate()}`, value };
      });
    const dailyOrd = Object.entries(dailyOrdMap).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const d = new Date(key + 'T00:00:00');
        return { label: `${d.toLocaleString('en', { month: 'short' })} ${d.getDate()}`, value };
      });

    // ---- WEEKLY (last 12 weeks) ----
    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

    const weeklyRevMap: Record<string, number> = {};
    const weeklyOrdMap: Record<string, number> = {};
    for (const p of parsed) {
      if (p.date < twelveWeeksAgo) continue;
      const key = weekKey(p.date);
      weeklyRevMap[key] = (weeklyRevMap[key] || 0) + p.amount;
      weeklyOrdMap[key] = (weeklyOrdMap[key] || 0) + 1;
    }
    const weeklyRev = Object.entries(weeklyRevMap).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const d = new Date(key + 'T00:00:00');
        return { label: `${d.toLocaleString('en', { month: 'short' })} ${d.getDate()}`, value };
      });
    const weeklyOrd = Object.entries(weeklyOrdMap).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const d = new Date(key + 'T00:00:00');
        return { label: `${d.toLocaleString('en', { month: 'short' })} ${d.getDate()}`, value };
      });

    // ---- MONTHLY (last 12 months) ----
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyRevMap: Record<string, number> = {};
    const monthlyOrdMap: Record<string, number> = {};
    for (const p of parsed) {
      if (p.date < twelveMonthsAgo) continue;
      const key = `${p.date.getFullYear()}-${String(p.date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevMap[key] = (monthlyRevMap[key] || 0) + p.amount;
      monthlyOrdMap[key] = (monthlyOrdMap[key] || 0) + 1;
    }
    const monthlyRev = Object.entries(monthlyRevMap).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [y, m] = key.split('-');
        return { label: new Date(Number(y), Number(m) - 1).toLocaleString('en', { month: 'short', year: '2-digit' }), value };
      });
    const monthlyOrd = Object.entries(monthlyOrdMap).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [y, m] = key.split('-');
        return { label: new Date(Number(y), Number(m) - 1).toLocaleString('en', { month: 'short', year: '2-digit' }), value };
      });

    return {
      revenueData: { daily: dailyRev, weekly: weeklyRev, monthly: monthlyRev },
      ordersData: { daily: dailyOrd, weekly: weeklyOrd, monthly: monthlyOrd },
    };
  }, [isDemo, salesOrders]);

  // Module cards — in live mode, build from summary data
  const moduleCards = useMemo(() => {
    if (isDemo) return getIndustryModuleCards(industryType);
    if (!summary) return [];
    const s = summary as any;
    return [
      { id: 'sales', name: 'Sales', icon: 'DollarSign', color: '#3b82f6', path: '/sales', kpiLabel: 'Revenue', kpiValue: `$${formatCompact(s.totalRevenue ?? 0)}` },
      { id: 'inventory', name: 'Inventory', icon: 'Package', color: '#10b981', path: '/inventory', kpiLabel: 'Items', kpiValue: Number(s.totalItems ?? 0).toLocaleString() },
      { id: 'manufacturing', name: 'Manufacturing', icon: 'Factory', color: '#8b5cf6', path: '/manufacturing', kpiLabel: 'Active WOs', kpiValue: Number(s.activeWorkOrders ?? 0).toLocaleString() },
      { id: 'procurement', name: 'Procurement', icon: 'Truck', color: '#f59e0b', path: '/procurement', kpiLabel: 'Open POs', kpiValue: Number(s.openPurchaseOrders ?? 0).toLocaleString() },
      { id: 'hr', name: 'HR', icon: 'Users', color: '#ec4899', path: '/hr', kpiLabel: 'Customers', kpiValue: Number(s.totalCustomers ?? 0).toLocaleString() },
      { id: 'financial', name: 'Financial', icon: 'DollarSign', color: '#14b8a6', path: '/financial', kpiLabel: 'Vendors', kpiValue: Number(s.totalVendors ?? 0).toLocaleString() },
    ];
  }, [isDemo, industryType, summary]);

  // Pending approvals — in live mode, show draft/pending POs and planned WOs
  const pendingApprovals = useMemo(() => {
    if (isDemo) return getIndustryPendingApprovals(industryType);
    const items: { id: string; title: string; requestedBy: string; urgency: string; amount?: number; path: string }[] = [];
    for (const po of purchaseOrders) {
      const s = (po as any).status;
      if (s === 'draft' || s === 'pending_approval' || s === 'pending') {
        items.push({
          id: (po as any).id,
          title: `PO ${(po as any).poNumber || (po as any).id} — ${(po as any).vendorName || 'Vendor'}`,
          requestedBy: (po as any).vendorName || 'Procurement',
          urgency: Number((po as any).totalAmount ?? 0) > 50000 ? 'high' : 'medium',
          amount: Number((po as any).totalAmount ?? 0),
          path: '/procurement/orders',
        });
      }
    }
    for (const wo of workOrders) {
      const s = (wo as any).status;
      if (s === 'planned') {
        items.push({
          id: (wo as any).id,
          title: `WO ${(wo as any).woNumber || (wo as any).id} — ${(wo as any).productName || 'Work Order'}`,
          requestedBy: 'Manufacturing',
          urgency: 'low',
          path: '/manufacturing/work-orders',
        });
      }
    }
    return items.slice(0, 6);
  }, [isDemo, industryType, purchaseOrders, workOrders]);

  // Activity feed — in live mode, build from recent SOs, WOs, POs sorted by date
  const activityFeed = useMemo(() => {
    if (isDemo) return getActivityFeed();
    const items: { id: string; userName: string; action: string; entity: string; entityId: string; timestamp: string; path: string }[] = [];
    for (const so of salesOrders.slice(0, 20)) {
      const date = (so as any).soDate || (so as any).orderDate || (so as any).createdAt;
      if (!date) continue;
      items.push({
        id: `so-${(so as any).id}`,
        userName: (so as any).customerName || 'System',
        action: 'created sales order',
        entity: '',
        entityId: (so as any).soNumber || (so as any).id,
        timestamp: new Date(date).toISOString(),
        path: '/sales/orders',
      });
    }
    for (const wo of workOrders.slice(0, 20)) {
      const date = (wo as any).startDate || (wo as any).createdAt;
      if (!date) continue;
      items.push({
        id: `wo-${(wo as any).id}`,
        userName: 'Manufacturing',
        action: (wo as any).status === 'completed' ? 'completed work order' : 'started work order',
        entity: '',
        entityId: (wo as any).woNumber || (wo as any).id,
        timestamp: new Date(date).toISOString(),
        path: '/manufacturing/work-orders',
      });
    }
    for (const po of purchaseOrders.slice(0, 10)) {
      const date = (po as any).poDate || (po as any).orderDate || (po as any).createdAt;
      if (!date) continue;
      items.push({
        id: `po-${(po as any).id}`,
        userName: (po as any).vendorName || 'Procurement',
        action: 'submitted purchase order',
        entity: '',
        entityId: (po as any).poNumber || (po as any).id,
        timestamp: new Date(date).toISOString(),
        path: '/procurement/orders',
      });
    }
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6);
  }, [isDemo, salesOrders, workOrders, purchaseOrders]);

  // AI Insights — in live mode, generate data-driven observations
  const aiInsights = useMemo(() => {
    if (isDemo) return getIndustryAIInsights(industryType);
    const insights: { id: string; type: string; severity: string; title: string; description: string; actionLabel?: string; actionLink?: string }[] = [];
    // Insight: delayed/overdue work orders
    const delayedWOs = workOrders.filter((wo: any) => wo.status === 'delayed' || wo.status === 'overdue');
    if (delayedWOs.length > 0) {
      insights.push({
        id: 'delayed-wos',
        type: 'Alert',
        severity: 'high',
        title: `${delayedWOs.length} Work Order${delayedWOs.length > 1 ? 's' : ''} Delayed`,
        description: `There are ${delayedWOs.length} delayed work orders that need attention. Review and reassign resources to prevent further delays.`,
        actionLabel: 'View Work Orders',
        actionLink: '/manufacturing/work-orders',
      });
    }
    // Insight: pending POs value
    const pendingPOTotal = purchaseOrders
      .filter((po: any) => po.status === 'draft' || po.status === 'pending_approval')
      .reduce((sum: number, po: any) => sum + Number(po.totalAmount ?? 0), 0);
    if (pendingPOTotal > 0) {
      insights.push({
        id: 'pending-pos',
        type: 'Recommendation',
        severity: 'medium',
        title: `${formatCurrency(pendingPOTotal)} in Pending Purchase Orders`,
        description: `You have purchase orders awaiting approval totaling ${formatCurrency(pendingPOTotal)}. Review and approve to maintain supplier relationships.`,
        actionLabel: 'Review POs',
        actionLink: '/procurement/orders',
      });
    }
    // Insight: completion rate
    const completedWOs = workOrders.filter((wo: any) => wo.status === 'completed' || wo.status === 'closed').length;
    const totalWOs = workOrders.length;
    if (totalWOs > 0) {
      const rate = Math.round((completedWOs / totalWOs) * 100);
      insights.push({
        id: 'completion-rate',
        type: rate >= 50 ? 'Positive' : 'Alert',
        severity: rate >= 50 ? 'low' : 'medium',
        title: `${rate}% Work Order Completion Rate`,
        description: `${completedWOs.toLocaleString()} of ${totalWOs.toLocaleString()} work orders completed. ${rate >= 50 ? 'Good progress — keep it up!' : 'Consider allocating more resources to improve throughput.'}`,
        actionLabel: 'View Manufacturing',
        actionLink: '/manufacturing',
      });
    }
    // Insight: revenue summary
    const s = summary as any;
    if (s && Number(s.totalRevenue ?? 0) > 0) {
      insights.push({
        id: 'revenue-summary',
        type: 'Trend',
        severity: 'low',
        title: `Total Revenue: $${formatCompact(Number(s.totalRevenue))}`,
        description: `Across ${Number(s.openSalesOrders ?? 0).toLocaleString()} open sales orders with ${Number(s.totalCustomers ?? 0).toLocaleString()} customers.`,
        actionLabel: 'View Sales',
        actionLink: '/sales',
      });
    }
    return insights;
  }, [isDemo, industryType, workOrders, purchaseOrders, summary]);

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
        <div className="hidden sm:flex items-center gap-3">
          <IndustrySelector
            value={industryType}
            onChange={setIndustryType}
            readOnly={!isDemo}
          />
          <div className="flex items-center gap-2 text-2xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
            <span>|</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* KPI Row — dynamic based on industry */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg border border-border bg-surface-1 animate-skeleton" />
          ))}
        </div>
      ) : summary && (
        <div className={cn(
          'grid gap-4',
          industryProfile.dashboardKPIs.length <= 4
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
        )}>
          {industryProfile.dashboardKPIs.map((kpiDef) => {
            const kpi = (summary as any)[kpiDef.key];
            if (!kpi) return null;
            // Handle both demo format (rich KPI object) and live format (flat number)
            const isRichKPI = typeof kpi === 'object' && kpi.label;
            return (
              <KPICard
                key={kpiDef.key}
                label={isRichKPI ? kpi.label : kpiDef.key.replace(/([A-Z])/g, ' $1').trim()}
                value={isRichKPI ? kpi.formattedValue : String(kpi)}
                icon={ICON_MAP[kpiDef.icon] || <Gauge className="h-4 w-4" />}
                trend={isRichKPI ? kpi.trend : undefined}
                trendValue={isRichKPI ? `${kpi.changePercent}%` : undefined}
                trendIsPositive={isRichKPI ? kpi.trendIsPositive : undefined}
                sparklineData={isRichKPI ? kpi.sparklineData : undefined}
              />
            );
          })}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart revenueData={revenueData as any} ordersData={ordersData as any} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Production Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductionDonut data={productionStatus as any} />
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
            {pendingApprovals.length === 0 && (
              <p className="text-xs text-text-muted py-6 text-center">No pending approvals</p>
            )}
            {pendingApprovals.slice(0, 4).map((item: any) => {
              const path = item.path
                ?? (item.type === 'purchase_order' ? '/procurement/orders'
                  : item.type === 'vendor_invoice' ? '/procurement/invoices'
                  : item.type === 'leave_request' ? '/hr/leave'
                  : '/procurement');
              return (
              <div
                key={item.id}
                onClick={() => navigate(path)}
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
              );
            })}
            {pendingApprovals.length > 0 && (
              <button onClick={() => navigate('/procurement/orders')} className="w-full text-center text-2xs text-brand-600 dark:text-brand-400 font-medium py-1.5 hover:bg-surface-2 rounded-md transition-colors mt-1">
                View All Approvals
              </button>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {activityFeed.length === 0 && (
              <p className="text-xs text-text-muted py-6 text-center">No recent activity</p>
            )}
            {activityFeed.map((item: any) => {
              const path = item.path
                ?? (String(item.entity || '').toLowerCase().includes('sales') ? '/sales/orders'
                  : String(item.entity || '').toLowerCase().includes('work order') ? '/manufacturing/work-orders'
                  : String(item.entity || '').toLowerCase().includes('purchase') ? '/procurement/orders'
                  : String(item.entity || '').toLowerCase().includes('journal') ? '/financial/journal-entries'
                  : '/dashboard');
              return (
              <div
                key={item.id}
                onClick={() => navigate(path)}
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
              );
            })}
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
            {aiInsights.length === 0 && (
              <p className="text-xs text-text-muted py-6 text-center">No insights available yet</p>
            )}
            {aiInsights.map((insight: any) => (
              <div
                key={insight.id}
                onClick={() => insight.actionLink && navigate(insight.actionLink)}
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
                    onClick={(e) => { e.stopPropagation(); insight.actionLink && navigate(insight.actionLink); }}
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

      {/* Module Quick Access — demo mode only */}
      {moduleCards.length > 0 && <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Modules</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {moduleCards.map((mod) => {
            const icon = ICON_MAP[mod.icon];
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
                  {(mod as any).kpiTrend === 'up' && <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />}
                  {(mod as any).kpiTrend === 'down' && <TrendingDown className="h-2.5 w-2.5 text-red-500" />}
                </div>
              </Card>
            );
          })}
        </div>
      </div>}
    </div>
  );
}
