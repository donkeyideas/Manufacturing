import { useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, KeyRound, Lock,
  Activity, Users, Clock,
} from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, Badge,
  Tabs, TabsList, TabsTrigger, TabsContent, cn,
} from '@erp/ui';

export function AdminSecurity() {
  const securityEvents = useMemo(() => [
    { id: 1, event: 'Failed login attempt', details: 'IP: 192.168.1.45 \u2014 user: admin@acme-mfg.com', severity: 'warning' as const, time: '5 min ago' },
    { id: 2, event: 'New API key created', details: 'Tech Assemblies Inc. \u2014 Production API key', severity: 'info' as const, time: '1 hour ago' },
    { id: 3, event: 'Password changed', details: 'sarah@pacific-steel.com', severity: 'info' as const, time: '2 hours ago' },
    { id: 4, event: 'Suspicious activity blocked', details: 'Multiple failed attempts from 45.33.22.11', severity: 'danger' as const, time: '3 hours ago' },
    { id: 5, event: 'Tenant 2FA enforced', details: 'Harbor Industries enabled mandatory 2FA', severity: 'success' as const, time: '5 hours ago' },
  ], []);

  const policies = useMemo(() => [
    { name: 'Enforce 2FA for admins', enabled: true, description: 'Require two-factor authentication for all admin accounts' },
    { name: 'Password complexity', enabled: true, description: 'Minimum 12 characters, uppercase, lowercase, number, special character' },
    { name: 'Session timeout', enabled: true, description: 'Auto-logout after 30 minutes of inactivity' },
    { name: 'IP allowlisting', enabled: false, description: 'Restrict access to approved IP addresses only' },
    { name: 'Audit logging', enabled: true, description: 'Log all user actions for compliance and auditing' },
    { name: 'Data encryption at rest', enabled: true, description: 'Encrypt all stored data using AES-256' },
    { name: 'Rate limiting', enabled: true, description: 'Limit API requests to 1000/minute per tenant' },
    { name: 'Auto-lock after failed attempts', enabled: true, description: 'Lock account after 5 consecutive failed login attempts' },
  ], []);

  const auditLog = useMemo(() => [
    { id: 1, user: 'john@acme-mfg.com', action: 'Updated billing information', resource: 'Acme Manufacturing', timestamp: '2024-02-09 14:23:00' },
    { id: 2, user: 'sarah@pacific-steel.com', action: 'Added new user', resource: 'Pacific Steel Works', timestamp: '2024-02-09 13:45:00' },
    { id: 3, user: 'admin@erp-platform.com', action: 'Revoked demo code DEMO-X7K2', resource: 'System', timestamp: '2024-02-09 12:00:00' },
    { id: 4, user: 'mike@coastal-fab.com', action: 'Exported financial report', resource: 'Coastal Fabrication', timestamp: '2024-02-09 11:30:00' },
    { id: 5, user: 'admin@erp-platform.com', action: 'Changed pricing for Starter plan', resource: 'System', timestamp: '2024-02-09 10:15:00' },
    { id: 6, user: 'emily@acme-mfg.com', action: 'Created API key', resource: 'Acme Manufacturing', timestamp: '2024-02-09 09:45:00' },
    { id: 7, user: 'admin@erp-platform.com', action: 'Updated security policy', resource: 'System', timestamp: '2024-02-08 16:30:00' },
    { id: 8, user: 'david@mountain-parts.com', action: 'Deleted inactive user', resource: 'Mountain Parts Co.', timestamp: '2024-02-08 15:00:00' },
  ], []);

  const SEVERITY_DOT: Record<string, string> = {
    warning: 'bg-amber-500',
    info: 'bg-sky-500',
    danger: 'bg-red-500',
    success: 'bg-emerald-500',
  };

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
                  <p className="text-2xs text-text-muted">Failed Logins (24h)</p>
                </div>
                <p className="text-xl font-bold text-text-primary">23</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-3.5 w-3.5 text-text-muted" />
                  <p className="text-2xs text-text-muted">Active Sessions</p>
                </div>
                <p className="text-xl font-bold text-text-primary">312</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound className="h-3.5 w-3.5 text-text-muted" />
                  <p className="text-2xs text-text-muted">2FA Adoption</p>
                </div>
                <p className="text-xl font-bold text-text-primary">67%</p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-text-muted" />
                  <p className="text-2xs text-text-muted">Security Score</p>
                </div>
                <p className="text-xl font-bold text-text-primary">92 / 100</p>
              </Card>
            </div>

            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-text-muted" />
                  <CardTitle>Recent Security Events</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {securityEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between rounded-md p-2.5 hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn('h-2 w-2 shrink-0 rounded-full', SEVERITY_DOT[evt.severity])} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text-primary">{evt.event}</p>
                        <p className="text-2xs text-text-muted truncate">{evt.details}</p>
                      </div>
                    </div>
                    <span className="text-2xs text-text-muted shrink-0 ml-3">{evt.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Tab 2: Policies ─── */}
        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-text-muted" />
                <CardTitle>Security Policies</CardTitle>
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
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-text-muted" />
                <CardTitle>Audit Log</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {auditLog.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 rounded-md p-2.5 hover:bg-surface-2 transition-colors"
                >
                  <span className="text-2xs text-text-muted shrink-0 w-36">
                    {entry.timestamp}
                  </span>
                  <span className="text-xs text-text-secondary truncate shrink-0 w-44">
                    {entry.user}
                  </span>
                  <span className="text-xs font-medium text-text-primary flex-1 truncate">
                    {entry.action}
                  </span>
                  <Badge variant={entry.resource === 'System' ? 'primary' : 'default'}>
                    {entry.resource}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
