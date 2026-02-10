import { useMemo } from 'react';
import {
  Settings, Mail, Database, Bell,
} from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, Badge,
  Tabs, TabsList, TabsTrigger, TabsContent, cn,
} from '@erp/ui';

export function SystemSettings() {
  const generalSettings = useMemo(() => [
    { label: 'Platform Name', value: 'Manufacturing ERP' },
    { label: 'Support Email', value: 'support@erp-platform.com' },
    { label: 'Default Timezone', value: 'UTC-5 (Eastern)' },
    { label: 'Default Currency', value: 'USD' },
    { label: 'Maintenance Window', value: 'Sundays 2:00 AM - 4:00 AM EST' },
    { label: 'API Version', value: 'v3.0.0' },
  ], []);

  const emailConfig = useMemo(() => [
    { label: 'SMTP Server', value: 'smtp.sendgrid.net' },
    { label: 'Port', value: '587 (TLS)' },
    { label: 'From Address', value: 'no-reply@erp-platform.com' },
    { label: 'Daily Report Recipients', value: 'admin@erp-platform.com, ops@erp-platform.com' },
  ], []);

  const notificationToggles = useMemo(() => [
    { name: 'New Tenant Signup', enabled: true },
    { name: 'Subscription Changes', enabled: true },
    { name: 'Failed Payments', enabled: true },
    { name: 'System Alerts', enabled: true },
    { name: 'Weekly Digest', enabled: false },
    { name: 'Demo Code Usage', enabled: true },
  ], []);

  const storageStats = useMemo(() => [
    { label: 'Database', value: 'PostgreSQL 15.4' },
    { label: 'Database Size', value: '12.4 GB / 50 GB', percent: 24.8 },
    { label: 'Total Storage', value: '34.2 GB / 100 GB', percent: 34.2 },
    { label: 'Redis Cache', value: 'Connected (8 MB used)' },
    { label: 'Last Backup', value: '2024-02-09 02:00:00 UTC' },
    { label: 'Backup Retention', value: '30 days' },
    { label: 'Active Connections', value: '24 / 100' },
  ], []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">System Settings</h1>
        <p className="text-xs text-text-muted mt-0.5">Platform configuration and infrastructure settings.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email & Notifications</TabsTrigger>
          <TabsTrigger value="database">Database & Storage</TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: General ─── */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-text-muted" />
                <CardTitle>Platform Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {generalSettings.map((setting) => (
                <div key={setting.label} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs text-text-muted">{setting.label}</p>
                  <p className="text-sm font-medium text-text-primary mt-0.5">{setting.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Tab 2: Email & Notifications ─── */}
        <TabsContent value="email">
          <div className="space-y-4">
            {/* Email Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-text-muted" />
                  <CardTitle>Email Configuration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {emailConfig.map((item) => (
                  <div key={item.label} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-xs text-text-muted">{item.label}</p>
                    <p className="text-sm font-medium text-text-primary mt-0.5">{item.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notification Toggles */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-text-muted" />
                  <CardTitle>Notification Preferences</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {notificationToggles.map((toggle) => (
                  <div
                    key={toggle.name}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <p className="text-xs font-medium text-text-primary">{toggle.name}</p>
                    <Badge variant={toggle.enabled ? 'success' : 'default'}>
                      <div
                        className={cn(
                          'h-1.5 w-1.5 rounded-full mr-1',
                          toggle.enabled ? 'bg-emerald-500' : 'bg-gray-400',
                        )}
                      />
                      {toggle.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Tab 3: Database & Storage ─── */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-text-muted" />
                <CardTitle>Database & Storage</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {storageStats.map((stat) => (
                <div key={stat.label} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-text-muted">{stat.label}</p>
                    {stat.label === 'Redis Cache' && (
                      <Badge variant="success">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                        Online
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium text-text-primary mt-0.5">{stat.value}</p>

                  {/* Progress bar for items that have a percent */}
                  {stat.percent != null && (
                    <div className="w-full h-2 rounded-full bg-surface-2 mt-2">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${stat.percent}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
