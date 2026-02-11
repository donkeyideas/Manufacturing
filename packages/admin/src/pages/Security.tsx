import { useState, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, KeyRound, Lock,
  Activity, Users, Clock, Loader2,
} from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, Badge,
  Tabs, TabsList, TabsTrigger, TabsContent, cn,
} from '@erp/ui';
import { formatDistanceToNow } from 'date-fns';
import { usePlatformStats, useAuditLogs } from '../data-layer/useAdminData';

/* ─── helpers ─── */

const USER_TYPE_BADGE: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'default' }> = {
  admin: { label: 'Admin', variant: 'primary' },
  user:  { label: 'User',  variant: 'success' },
  demo:  { label: 'Demo',  variant: 'warning' },
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
    </div>
  );
}

/* ─── policies (static — not in DB yet) ─── */

const policies = [
  { name: 'Enforce 2FA for admins', enabled: true, description: 'Require two-factor authentication for all admin accounts' },
  { name: 'Password complexity', enabled: true, description: 'Minimum 12 characters, uppercase, lowercase, number, special character' },
  { name: 'Session timeout', enabled: true, description: 'Auto-logout after 30 minutes of inactivity' },
  { name: 'IP allowlisting', enabled: false, description: 'Restrict access to approved IP addresses only' },
  { name: 'Audit logging', enabled: true, description: 'Log all user actions for compliance and auditing' },
  { name: 'Data encryption at rest', enabled: true, description: 'Encrypt all stored data using AES-256' },
  { name: 'Rate limiting', enabled: true, description: 'Limit API requests to 1000/minute per tenant' },
  { name: 'Auto-lock after failed attempts', enabled: true, description: 'Lock account after 5 consecutive failed login attempts' },
];

/* ─── component ─── */

export function AdminSecurity() {
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');

  const stats = usePlatformStats();
  const auditLogs = useAuditLogs({
    limit: 50,
    userType: userTypeFilter === 'all' ? undefined : userTypeFilter,
  });

  /* derive recent login events for the overview tab (last 5) */
  const recentEvents = useMemo(() => {
    if (!auditLogs.data?.logs) return [];
    return auditLogs.data.logs.slice(0, 5);
  }, [auditLogs.data]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Security</h1>
        <p className="text-xs text-text-muted mt-0.5">Platform security overview, policies, and audit log.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Security Overview ─── */}
        <TabsContent value="overview">
          <div className="space-y-4">
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-text-muted" />
                  <p className="text-2xs text-text-muted">Logins (24h)</p>
                </div>
                {stats.isLoading ? (
                  <div className="h-7 flex items-center"><Loader2 className="h-4 w-4 animate-spin text-text-muted" /></div>
                ) : (
                  <p className="text-xl font-bold text-text-primary">{stats.data?.loginsLast24h ?? '--'}</p>
                )}
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-3.5 w-3.5 text-text-muted" />
                  <p className="text-2xs text-text-muted">Active Users</p>
                </div>
                {stats.isLoading ? (
                  <div className="h-7 flex items-center"><Loader2 className="h-4 w-4 animate-spin text-text-muted" /></div>
                ) : (
                  <p className="text-xl font-bold text-text-primary">{stats.data?.activeUsers ?? '--'}</p>
                )}
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound className="h-3.5 w-3.5 text-text-muted" />
                  <p className="text-2xs text-text-muted">2FA Adoption</p>
                </div>
                <p className="text-xl font-bold text-text-muted">--</p>
                <p className="text-2xs text-text-muted">Coming soon</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-text-muted" />
                  <p className="text-2xs text-text-muted">Security Score</p>
                </div>
                <p className="text-xl font-bold text-text-muted">--</p>
                <p className="text-2xs text-text-muted">Coming soon</p>
              </Card>
            </div>

            {/* Recent Security Events — pulled from real audit logs */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-text-muted" />
                  <CardTitle>Recent Login Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {auditLogs.isLoading ? (
                  <Spinner />
                ) : recentEvents.length === 0 ? (
                  <p className="text-xs text-text-muted py-4 text-center">No recent login activity.</p>
                ) : (
                  recentEvents.map((evt) => {
                    const badge = USER_TYPE_BADGE[evt.userType] ?? USER_TYPE_BADGE.user;
                    return (
                      <div
                        key={evt.id}
                        className="flex items-center justify-between rounded-md p-2.5 hover:bg-surface-2 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'h-2 w-2 shrink-0 rounded-full',
                              evt.success ? 'bg-emerald-500' : 'bg-red-500',
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-text-primary">
                              {evt.success ? 'Successful login' : 'Failed login'}
                              {evt.failureReason ? ` — ${evt.failureReason}` : ''}
                            </p>
                            <p className="text-2xs text-text-muted truncate">
                              {evt.email}
                              {evt.ipAddress ? ` \u2014 IP: ${evt.ipAddress}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          <span className="text-2xs text-text-muted">
                            {formatDistanceToNow(new Date(evt.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Tab 2: Policies ─── */}
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-text-muted" />
                  <CardTitle>Security Policies</CardTitle>
                </div>
                <Badge variant="default">Configuration coming soon</Badge>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {policies.map((policy) => (
                <div
                  key={policy.name}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-xs font-medium text-text-primary">{policy.name}</p>
                    <p className="text-2xs text-text-muted mt-0.5">{policy.description}</p>
                  </div>
                  <Badge variant={policy.enabled ? 'success' : 'default'}>
                    <div
                      className={cn(
                        'h-1.5 w-1.5 rounded-full mr-1',
                        policy.enabled ? 'bg-emerald-500' : 'bg-gray-400',
                      )}
                    />
                    {policy.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 3: Audit Log ─── */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-text-muted" />
                  <CardTitle>Audit Log</CardTitle>
                  {auditLogs.data?.total != null && (
                    <span className="text-2xs text-text-muted">({auditLogs.data.total} total)</span>
                  )}
                </div>
                {/* User type filter */}
                <div className="flex items-center gap-1">
                  {(['all', 'user', 'admin', 'demo'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setUserTypeFilter(type)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-2xs font-medium transition-colors',
                        userTypeFilter === type
                          ? 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
                          : 'text-text-muted hover:bg-surface-2',
                      )}
                    >
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {auditLogs.isLoading ? (
                <Spinner />
              ) : !auditLogs.data?.logs.length ? (
                <p className="text-xs text-text-muted py-8 text-center">No audit log entries found.</p>
              ) : (
                <div className="space-y-1">
                  {/* Table header */}
                  <div className="hidden sm:flex items-center gap-3 px-2.5 py-1.5 text-2xs font-medium text-text-muted uppercase tracking-wide">
                    <span className="w-36 shrink-0">Timestamp</span>
                    <span className="w-48 shrink-0">Email</span>
                    <span className="w-16 shrink-0">Type</span>
                    <span className="flex-1">Result</span>
                    <span className="w-28 shrink-0 text-right">IP Address</span>
                  </div>

                  {auditLogs.data.logs.map((entry) => {
                    const badge = USER_TYPE_BADGE[entry.userType] ?? USER_TYPE_BADGE.user;
                    return (
                      <div
                        key={entry.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 rounded-md p-2.5 hover:bg-surface-2 transition-colors"
                      >
                        <span className="text-2xs text-text-muted shrink-0 w-36" title={entry.createdAt}>
                          {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-text-secondary truncate shrink-0 w-48">
                          {entry.email}
                        </span>
                        <span className="shrink-0 w-16">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </span>
                        <span className="text-xs font-medium flex-1 truncate">
                          {entry.success ? (
                            <span className="text-emerald-600 dark:text-emerald-400">Login successful</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">
                              Failed{entry.failureReason ? ` — ${entry.failureReason}` : ''}
                            </span>
                          )}
                        </span>
                        <span className="text-2xs text-text-muted shrink-0 w-28 sm:text-right font-mono">
                          {entry.ipAddress ?? '--'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
