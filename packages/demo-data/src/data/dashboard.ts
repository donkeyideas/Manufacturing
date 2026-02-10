import type {
  DashboardSummary,
  ProductionStatusData,
  TimeSeriesPoint,
  RevenueChartData,
  PendingApproval,
  ActivityFeedItem,
  AIInsight,
  ModuleCard,
  AppNotification,
} from '@erp/shared';
import {
  calculateRevenueKPI,
  calculateOrdersKPI,
  calculateInventoryAlertsKPI,
  calculateOEEKPI,
} from '../calculations/kpi';

export function getDashboardSummary(): DashboardSummary {
  return {
    revenue: calculateRevenueKPI(284750, 261200),
    orders: calculateOrdersKPI(47, 42),
    inventoryAlerts: calculateInventoryAlertsKPI(8, 12),
    productionEfficiency: calculateOEEKPI(87.3, 84.1),
  };
}

// ─── Multi-range chart data ───

export function getRevenueChartDataMultiRange(): RevenueChartData {
  return {
    daily: generateDailyRevenue(30),
    weekly: generateWeeklyRevenue(12),
    monthly: generateMonthlyRevenue(12),
  };
}

export function getOrdersChartDataMultiRange(): RevenueChartData {
  return {
    daily: generateDailyOrders(30),
    weekly: generateWeeklyOrders(12),
    monthly: generateMonthlyOrders(12),
  };
}

function generateDailyRevenue(days: number): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const today = new Date();
  const baseRevenue = 9500;
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.3 : 1;
    const variation = (Math.random() - 0.4) * 3000;
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(Math.round((baseRevenue + variation) * weekendFactor), 500),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return data;
}

function generateWeeklyRevenue(weeks: number): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const today = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    const base = 47000 + (weeks - i) * 800;
    const variation = Math.round((Math.random() - 0.3) * 8000);
    data.push({
      date: date.toISOString().split('T')[0],
      value: base + variation,
      label: `Week ${weeks - i}`,
    });
  }
  return data;
}

function generateMonthlyRevenue(months: number): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const today = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const base = 195000 + (months - i) * 3500;
    const variation = Math.round((Math.random() - 0.3) * 20000);
    data.push({
      date: date.toISOString().split('T')[0],
      value: base + variation,
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    });
  }
  return data;
}

function generateDailyOrders(days: number): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.2 : 1;
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round((5 + Math.floor(Math.random() * 8)) * weekendFactor),
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    });
  }
  return data;
}

function generateWeeklyOrders(weeks: number): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const today = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    data.push({
      date: date.toISOString().split('T')[0],
      value: 28 + Math.floor(Math.random() * 20),
      label: `Week ${weeks - i}`,
    });
  }
  return data;
}

function generateMonthlyOrders(months: number): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const today = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    data.push({
      date: date.toISOString().split('T')[0],
      value: 120 + Math.floor(Math.random() * 60),
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    });
  }
  return data;
}

// Keep old functions for backward compat
export function getRevenueChartData(): TimeSeriesPoint[] {
  return generateDailyRevenue(30);
}

export function getOrdersChartData(): TimeSeriesPoint[] {
  return generateDailyOrders(30);
}

export function getProductionStatus(): ProductionStatusData {
  return {
    completed: 34,
    inProgress: 18,
    scheduled: 12,
    delayed: 3,
  };
}

export function getPendingApprovals(): PendingApproval[] {
  return [
    { id: '1', type: 'purchase_order', title: 'PO-2025-0847 - Steel Rod Supply', requestedBy: 'Maria Garcia', amount: 12450.00, date: '2025-02-07', urgency: 'high' },
    { id: '2', type: 'vendor_invoice', title: 'INV-4521 - Precision Parts Co.', requestedBy: 'James Wilson', amount: 8320.50, date: '2025-02-06', urgency: 'medium' },
    { id: '3', type: 'leave_request', title: 'Vacation Request - Feb 15-19', requestedBy: 'Sarah Chen', date: '2025-02-05', urgency: 'low' },
    { id: '4', type: 'purchase_order', title: 'PO-2025-0851 - Electronic Components', requestedBy: 'Robert Kim', amount: 4780.00, date: '2025-02-04', urgency: 'medium' },
    { id: '5', type: 'expense', title: 'Travel Expense - Client Visit', requestedBy: 'Lisa Nguyen', amount: 1250.00, date: '2025-02-03', urgency: 'low' },
  ];
}

export function getActivityFeed(): ActivityFeedItem[] {
  const now = new Date();
  return [
    { id: '1', action: 'created', entity: 'Sales Order', entityId: 'SO-2025-1247', userId: 'u1', userName: 'Alex Thompson', timestamp: new Date(now.getTime() - 12 * 60000).toISOString(), details: 'New order for Acme Manufacturing - $18,500' },
    { id: '2', action: 'completed', entity: 'Work Order', entityId: 'WO-2025-0432', userId: 'u2', userName: 'Maria Garcia', timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), details: '500 units of Part A-200 completed' },
    { id: '3', action: 'posted', entity: 'Journal Entry', entityId: 'JE-2025-0891', userId: 'u3', userName: 'James Wilson', timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), details: 'Monthly depreciation - $4,250' },
    { id: '4', action: 'received', entity: 'Goods Receipt', entityId: 'GR-2025-0156', userId: 'u4', userName: 'Sarah Chen', timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(), details: 'PO-2025-0839 - 200 units received at Warehouse A' },
    { id: '5', action: 'approved', entity: 'Purchase Order', entityId: 'PO-2025-0845', userId: 'u5', userName: 'Robert Kim', timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(), details: 'Approved $6,200 order from TechParts Inc.' },
  ];
}

export function getAIInsights(): AIInsight[] {
  return [
    { id: '1', type: 'warning', title: 'Low Stock Alert', description: 'Steel Rod (SR-1040) will run out in approximately 3 days based on current consumption rate.', severity: 'high', actionLabel: 'Create PO', actionLink: '/procurement/orders/new' },
    { id: '2', type: 'suggestion', title: 'Vendor Consolidation', description: 'Combining orders for Vendor A and Vendor B could save ~$2,400/month in shipping costs.', severity: 'medium', actionLabel: 'View Analysis', actionLink: '/reports/analytics' },
    { id: '3', type: 'anomaly', title: 'Unusual Scrap Rate', description: 'Work Center WC-03 showing 12% scrap rate this week vs. 3% average. Possible equipment issue.', severity: 'high', actionLabel: 'View Details', actionLink: '/manufacturing/work-centers' },
    { id: '4', type: 'prediction', title: 'Demand Forecast', description: 'Based on seasonal patterns, expect 25% increase in orders for Product Line B next month.', severity: 'low', actionLabel: 'View Forecast', actionLink: '/inventory/demand-planning' },
  ];
}

export function getNotifications(): AppNotification[] {
  const now = new Date();
  return [
    { id: '1', type: 'warning', title: 'Low Stock Alert', message: 'Steel Rod (SR-1040) below reorder point. 3 days of stock remaining.', timestamp: new Date(now.getTime() - 5 * 60000).toISOString(), read: false, actionLabel: 'View Item', actionLink: '/inventory/items' },
    { id: '2', type: 'success', title: 'Work Order Completed', message: 'WO-2025-0432: 500 units of Part A-200 completed.', timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), read: false, actionLabel: 'View WO', actionLink: '/manufacturing/work-orders' },
    { id: '3', type: 'info', title: 'PO Approval Needed', message: 'PO-2025-0847 from Maria Garcia requires your approval ($12,450).', timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), read: false, actionLabel: 'Review', actionLink: '/procurement/orders' },
    { id: '4', type: 'success', title: 'Invoice Paid', message: 'INV-4520 from Precision Parts Co. marked as paid ($8,320.50).', timestamp: new Date(now.getTime() - 4 * 3600000).toISOString(), read: true },
    { id: '5', type: 'info', title: 'Report Ready', message: 'Monthly P&L report for January 2025 is ready for download.', timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(), read: true, actionLabel: 'Download', actionLink: '/reports' },
    { id: '6', type: 'error', title: 'Sync Failed', message: 'Integration with QuickBooks failed. Check connection settings.', timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(), read: true, actionLabel: 'Settings', actionLink: '/settings/integrations' },
  ];
}

export function getModuleCards(): ModuleCard[] {
  return [
    { id: 'financial', name: 'Financial', icon: 'DollarSign', path: '/financial', kpiLabel: 'Revenue MTD', kpiValue: '$284.7K', kpiTrend: 'up', color: '#3b82f6' },
    { id: 'manufacturing', name: 'Manufacturing', icon: 'Factory', path: '/manufacturing', kpiLabel: 'OEE', kpiValue: '87.3%', kpiTrend: 'up', color: '#8b5cf6' },
    { id: 'sales', name: 'Sales', icon: 'ShoppingCart', path: '/sales', kpiLabel: 'Active Orders', kpiValue: '47', kpiTrend: 'up', color: '#10b981' },
    { id: 'inventory', name: 'Inventory', icon: 'Package', path: '/inventory', kpiLabel: 'Stock Alerts', kpiValue: '8', kpiTrend: 'down', color: '#f59e0b' },
    { id: 'procurement', name: 'Procurement', icon: 'Truck', path: '/procurement', kpiLabel: 'Pending POs', kpiValue: '12', kpiTrend: 'flat', color: '#ef4444' },
    { id: 'hr', name: 'HR & Payroll', icon: 'Users', path: '/hr', kpiLabel: 'Employees', kpiValue: '156', kpiTrend: 'up', color: '#06b6d4' },
  ];
}
