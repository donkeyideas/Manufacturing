import type {
  AdminDashboardSummary,
  SubscriptionBreakdown,
  DemoCodeStats,
  TimeSeriesPoint,
} from '@erp/shared';
import { calculateKPI } from '../calculations/kpi';
import { formatCompact, formatPercent } from '@erp/shared';

export function getAdminDashboardSummary(): AdminDashboardSummary {
  return {
    activeTenants: calculateKPI('Active Tenants', 34, 28, (v) => v.toString()),
    totalUsers: calculateKPI('Total Users', 487, 412, (v) => formatCompact(v)),
    apiRequests24h: calculateKPI('API Requests (24h)', 128400, 115200, (v) => formatCompact(v)),
    systemUptime: calculateKPI('System Uptime', 99.97, 99.94, (v) => formatPercent(v, 2)),
  };
}

export function getSubscriptionBreakdown(): SubscriptionBreakdown[] {
  return [
    { plan: 'Enterprise', count: 8, mrr: 31920, color: '#3b82f6' },
    { plan: 'Professional', count: 14, mrr: 20860, color: '#8b5cf6' },
    { plan: 'Starter', count: 12, mrr: 7140, color: '#10b981' },
  ];
}

export function getMRRChartData(): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const today = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const baseMRR = 45000 + (11 - i) * 1200;
    const variation = Math.round((Math.random() - 0.3) * 3000);

    data.push({
      date: date.toISOString().split('T')[0],
      value: baseMRR + variation,
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    });
  }
  return data;
}

export function getDemoCodeStats(): DemoCodeStats {
  return {
    activeCodes: 12,
    totalGenerated: 87,
    conversionRate: 23.5,
    recentUsage: [
      { date: '2025-02-03', uses: 4 },
      { date: '2025-02-04', uses: 7 },
      { date: '2025-02-05', uses: 3 },
      { date: '2025-02-06', uses: 9 },
      { date: '2025-02-07', uses: 5 },
      { date: '2025-02-08', uses: 6 },
      { date: '2025-02-09', uses: 8 },
    ],
  };
}

export function getRecentTenantActivity() {
  return [
    { tenantName: 'Acme Manufacturing', action: 'New user added', time: '5 min ago', plan: 'Enterprise' },
    { tenantName: 'Pacific Steel Works', action: 'Upgraded to Professional', time: '1 hour ago', plan: 'Professional' },
    { tenantName: 'Coastal Fabrication', action: 'Invoice generated', time: '2 hours ago', plan: 'Starter' },
    { tenantName: 'Mountain Parts Co.', action: 'Demo code redeemed', time: '3 hours ago', plan: 'Trial' },
    { tenantName: 'Tech Assemblies Inc.', action: 'API key created', time: '5 hours ago', plan: 'Enterprise' },
  ];
}
