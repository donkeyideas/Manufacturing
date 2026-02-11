import {
  Users, Building2, KeyRound,
  LogIn, CheckCircle2, XCircle, Shield,
} from 'lucide-react';
import { KPICard, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, SkeletonKPICard } from '@erp/ui';
import { formatDistanceToNow } from 'date-fns';
import {
  usePlatformStats,
  useDemoCodeStats,
  useAuditLogs,
  useTenants,
} from '../data-layer/useAdminData';

/* ─── Helpers ─── */

const PLAN_BADGE_VARIANT: Record<string, 'primary' | 'info' | 'warning' | 'success' | 'default'> = {
  Enterprise: 'primary',
  Professional: 'info',
  Starter: 'success',
  Trial: 'warning',
};

function planBadgeVariant(plan: string | null) {
  if (!plan) return 'default' as const;
  return PLAN_BADGE_VARIANT[plan] ?? ('default' as const);
}

/* ─── Component ─── */

export function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: demoStats, isLoading: demoLoading } = useDemoCodeStats();
  const { data: auditData, isLoading: auditLoading } = useAuditLogs({ limit: 10 });
  const { data: tenants, isLoading: tenantsLoading } = useTenants();

  /* Compute plan breakdown from tenants list */
  const planCounts = (tenants ?? []).reduce<Record<string, number>>((acc, t) => {
    const plan = t.plan ?? 'Unknown';
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Admin Dashboard</h1>
        <p className="text-xs text-text-muted mt-0.5">Platform overview and management.</p>
      </div>

      {/* ─── KPI Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <SkeletonKPICard />
            <SkeletonKPICard />
            <SkeletonKPICard />
            <SkeletonKPICard />
          </>
        ) : (
          <>
            <KPICard
              label="Total Tenants"
              value={String(stats?.totalTenants ?? 0)}
              icon={<Building2 className="h-4 w-4" />}
            />
            <KPICard
              label="Total Users"
              value={String(stats?.totalUsers ?? 0)}
              icon={<Users className="h-4 w-4" />}
            />
            <KPICard
              label="Active Demo Codes"
              value={String(stats?.activeDemoCodes ?? 0)}
              icon={<KeyRound className="h-4 w-4" />}
            />
            <KPICard
              label="Logins Last 24h"
              value={String(stats?.loginsLast24h ?? 0)}
              icon={<LogIn className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      {/* ─── Tenants by Plan + Demo Code Stats ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tenants by Plan */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tenants by Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {tenantsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : Object.keys(planCounts).length === 0 ? (
              <p className="text-xs text-text-muted py-4 text-center">No tenants yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(planCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={planBadgeVariant(plan)}>{plan}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-text-primary">
                          {count} {count === 1 ? 'tenant' : 'tenants'}
                        </span>
                        <div className="w-32 h-2 rounded-full bg-surface-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${(count / (tenants?.length || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-muted">
                  <span>Total</span>
                  <span className="font-medium text-text-primary">{tenants?.length ?? 0} tenants</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Code Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-text-muted" />
              <CardTitle>Demo Codes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {demoLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-md bg-surface-2 p-2.5 text-center space-y-1">
                    <Skeleton className="h-6 w-10 mx-auto" />
                    <Skeleton className="h-3 w-14 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-surface-2 p-2.5 text-center">
                  <p className="text-lg font-bold text-text-primary">{demoStats?.totalCodes ?? 0}</p>
                  <p className="text-2xs text-text-muted">Total Codes</p>
                </div>
                <div className="rounded-md bg-surface-2 p-2.5 text-center">
                  <p className="text-lg font-bold text-emerald-600">{demoStats?.activeCodes ?? 0}</p>
                  <p className="text-2xs text-text-muted">Active</p>
                </div>
                <div className="rounded-md bg-surface-2 p-2.5 text-center">
                  <p className="text-lg font-bold text-text-primary">{demoStats?.totalUses ?? 0}</p>
                  <p className="text-2xs text-text-muted">Total Uses</p>
                </div>
                <div className="rounded-md bg-surface-2 p-2.5 text-center">
                  <p className="text-lg font-bold text-red-500">{demoStats?.expiredCodes ?? 0}</p>
                  <p className="text-2xs text-text-muted">Expired</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Recent Audit Logs + Tenant List ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Audit Logs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-text-muted" />
              <CardTitle>Recent Audit Logs</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {auditLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-36" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : !auditData?.logs?.length ? (
              <p className="text-xs text-text-muted py-4 text-center">No audit logs yet.</p>
            ) : (
              auditData.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-md p-2 hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {log.success ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{log.email}</p>
                      <p className="text-2xs text-text-muted">
                        {log.success ? 'Login successful' : log.failureReason ?? 'Login failed'}
                        {' '}&middot;{' '}{log.userType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge variant={log.success ? 'success' : 'danger'}>
                      {log.success ? 'OK' : 'FAIL'}
                    </Badge>
                    <span className="text-2xs text-text-muted whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            )}
            {auditData && auditData.total > 10 && (
              <p className="text-2xs text-text-muted text-center pt-2">
                Showing 10 of {auditData.total} entries
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tenant List */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-text-muted" />
              <CardTitle>Tenants</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {tenantsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : !tenants?.length ? (
              <p className="text-xs text-text-muted py-4 text-center">No tenants yet.</p>
            ) : (
              tenants.slice(0, 10).map((tenant) => (
                <div
                  key={tenant.id}
                  className="flex items-center justify-between rounded-md p-2 hover:bg-surface-2 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-text-primary truncate">{tenant.name}</p>
                    <p className="text-2xs text-text-muted">
                      {tenant.slug}
                      {tenant.industryType ? ` \u00b7 ${tenant.industryType}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge variant={planBadgeVariant(tenant.plan)}>
                      {tenant.plan ?? 'None'}
                    </Badge>
                    <Badge variant={tenant.isActive ? 'success' : 'danger'}>
                      {tenant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
            {tenants && tenants.length > 10 && (
              <p className="text-2xs text-text-muted text-center pt-2">
                Showing 10 of {tenants.length} tenants
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
