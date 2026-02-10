// ─── Dashboard KPIs & Widgets ───

export interface DashboardKPI {
  label: string;
  value: number;
  formattedValue: string;
  previousValue?: number;
  changePercent?: number;
  trend: 'up' | 'down' | 'flat';
  trendIsPositive: boolean;
  sparklineData?: number[];
}

export interface DashboardSummary {
  revenue: DashboardKPI;
  orders: DashboardKPI;
  inventoryAlerts: DashboardKPI;
  productionEfficiency: DashboardKPI;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

export interface RevenueChartData {
  daily: TimeSeriesPoint[];
  weekly: TimeSeriesPoint[];
  monthly: TimeSeriesPoint[];
}

export interface ProductionStatusData {
  completed: number;
  inProgress: number;
  scheduled: number;
  delayed: number;
}

export interface PendingApproval {
  id: string;
  type: 'purchase_order' | 'vendor_invoice' | 'leave_request' | 'expense';
  title: string;
  requestedBy: string;
  amount?: number;
  date: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface ActivityFeedItem {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'suggestion' | 'anomaly' | 'prediction';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  actionLabel?: string;
  actionLink?: string;
}

// ─── Admin Dashboard ───

export interface AdminDashboardSummary {
  activeTenants: DashboardKPI;
  totalUsers: DashboardKPI;
  apiRequests24h: DashboardKPI;
  systemUptime: DashboardKPI;
}

export interface SubscriptionBreakdown {
  plan: string;
  count: number;
  mrr: number;
  color: string;
}

export interface DemoCodeStats {
  activeCodes: number;
  totalGenerated: number;
  conversionRate: number;
  recentUsage: { date: string; uses: number }[];
}

// ─── Notifications ───

export interface AppNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionLink?: string;
}

// ─── Module Quick Access ───

export interface ModuleCard {
  id: string;
  name: string;
  icon: string;
  path: string;
  kpiLabel: string;
  kpiValue: string;
  kpiTrend: 'up' | 'down' | 'flat';
  color: string;
}

// ─── Demo Code Management (Admin) ───

export interface DemoCodeListItem {
  id: string;
  code: string;
  label: string;
  template: 'manufacturing' | 'distribution' | 'full';
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt: string;
  usageCount: number;
  maxUses: number;
  lastUsed: string | null;
  modulesEnabled: string[];
}
