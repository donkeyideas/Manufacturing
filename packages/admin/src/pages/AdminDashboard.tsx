import { useMemo } from 'react';
import {
  Users, Building2, Activity, Server,
  KeyRound, TrendingUp, Plus,
} from 'lucide-react';
import { KPICard, Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@erp/ui';
import { formatCurrency, formatPercent } from '@erp/shared';
import {
  getAdminDashboardSummary,
  getSubscriptionBreakdown,
  getMRRChartData,
  getDemoCodeStats,
  getRecentTenantActivity,
} from '@erp/demo-data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

export function AdminDashboard() {
  const summary = useMemo(() => getAdminDashboardSummary(), []);
  const subscriptions = useMemo(() => getSubscriptionBreakdown(), []);
  const mrrData = useMemo(() => getMRRChartData(), []);
  const demoStats = useMemo(() => getDemoCodeStats(), []);
  const tenantActivity = useMemo(() => getRecentTenantActivity(), []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Admin Dashboard</h1>
        <p className="text-xs text-text-muted mt-0.5">Platform overview and management.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label={summary.activeTenants.label}
          value={summary.activeTenants.formattedValue}
          icon={<Building2 className="h-4 w-4" />}
          trend={summary.activeTenants.trend}
          trendValue={`${summary.activeTenants.changePercent}%`}
          trendIsPositive={summary.activeTenants.trendIsPositive}
        />
        <KPICard
          label={summary.totalUsers.label}
          value={summary.totalUsers.formattedValue}
          icon={<Users className="h-4 w-4" />}
          trend={summary.totalUsers.trend}
          trendValue={`${summary.totalUsers.changePercent}%`}
          trendIsPositive={summary.totalUsers.trendIsPositive}
        />
        <KPICard
          label={summary.apiRequests24h.label}
          value={summary.apiRequests24h.formattedValue}
          icon={<Activity className="h-4 w-4" />}
          trend={summary.apiRequests24h.trend}
          trendValue={`${summary.apiRequests24h.changePercent}%`}
          trendIsPositive={summary.apiRequests24h.trendIsPositive}
        />
        <KPICard
          label={summary.systemUptime.label}
          value={summary.systemUptime.formattedValue}
          icon={<Server className="h-4 w-4" />}
          trend={summary.systemUptime.trend}
          trendValue={`${summary.systemUptime.changePercent}%`}
          trendIsPositive={summary.systemUptime.trendIsPositive}
        />
      </div>

      {/* MRR + Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Recurring Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mrrData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface-1)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'MRR']}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptions}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="plan"
                  >
                    {subscriptions.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {subscriptions.map((sub) => (
                <div key={sub.plan} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: sub.color }} />
                    <span className="text-text-secondary">{sub.plan}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted">{sub.count} tenants</span>
                    <span className="font-medium text-text-primary">{formatCurrency(sub.mrr)}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Codes + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Demo Code Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-text-muted" />
                <CardTitle>Demo Codes</CardTitle>
              </div>
              <Button size="sm">
                <Plus className="h-3 w-3" />
                Generate Code
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-md bg-surface-2 p-2.5 text-center">
                <p className="text-lg font-bold text-text-primary">{demoStats.activeCodes}</p>
                <p className="text-2xs text-text-muted">Active</p>
              </div>
              <div className="rounded-md bg-surface-2 p-2.5 text-center">
                <p className="text-lg font-bold text-text-primary">{demoStats.totalGenerated}</p>
                <p className="text-2xs text-text-muted">Total Generated</p>
              </div>
              <div className="rounded-md bg-surface-2 p-2.5 text-center">
                <p className="text-lg font-bold text-emerald-600">{formatPercent(demoStats.conversionRate)}</p>
                <p className="text-2xs text-text-muted">Conversion</p>
              </div>
            </div>
            <p className="text-xs text-text-muted mb-2">Daily usage (last 7 days)</p>
            <div className="flex items-end gap-1 h-16">
              {demoStats.recentUsage.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm bg-brand-500"
                    style={{ height: `${(day.uses / 10) * 100}%`, minHeight: '4px' }}
                  />
                  <span className="text-2xs text-text-muted">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tenant Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tenant Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tenantActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md p-2 hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-xs font-medium text-text-primary">{item.tenantName}</p>
                  <p className="text-2xs text-text-muted">{item.action}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    item.plan === 'Enterprise' ? 'primary' :
                    item.plan === 'Professional' ? 'info' :
                    item.plan === 'Trial' ? 'warning' : 'default'
                  }>
                    {item.plan}
                  </Badge>
                  <span className="text-2xs text-text-muted">{item.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
