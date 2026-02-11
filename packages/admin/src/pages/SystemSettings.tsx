import {
  Settings, Mail, Database, Bell, Loader2,
} from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, Badge,
  Tabs, TabsList, TabsTrigger, TabsContent, cn,
} from '@erp/ui';
import { useAdminSettings, useStorageStats } from '../data-layer/useAdminData';

/* ─── Label Mappings ─── */

const GENERAL_LABELS: Record<string, string> = {
  platform_name: 'Platform Name',
  support_email: 'Support Email',
  default_timezone: 'Default Timezone',
  default_currency: 'Default Currency',
  maintenance_window: 'Maintenance Window',
  api_version: 'API Version',
};

const EMAIL_LABELS: Record<string, string> = {
  smtp_server: 'SMTP Server',
  smtp_port: 'Port',
  from_address: 'From Address',
  report_recipients: 'Daily Report Recipients',
};

const NOTIFICATION_LABELS: Record<string, string> = {
  notify_new_tenant: 'New Tenant Signup',
  notify_subscription_changes: 'Subscription Changes',
  notify_failed_payments: 'Failed Payments',
  notify_system_alerts: 'System Alerts',
  notify_weekly_digest: 'Weekly Digest',
  notify_demo_code_usage: 'Demo Code Usage',
};

export function SystemSettings() {
  const { data: settingsData, isLoading: settingsLoading } = useAdminSettings();
  const { data: storageData, isLoading: storageLoading } = useStorageStats();

  const grouped = settingsData?.grouped;

  /* ─── Derive display arrays from API data ─── */

  const generalSettings = grouped?.general
    ? Object.entries(GENERAL_LABELS)
        .filter(([key]) => key in grouped.general)
        .map(([key, label]) => ({ label, value: grouped.general[key] }))
    : [];

  const emailConfig = grouped?.email
    ? Object.entries(EMAIL_LABELS)
        .filter(([key]) => key in grouped.email)
        .map(([key, label]) => ({ label, value: grouped.email[key] }))
    : [];

  const notificationToggles = grouped?.notifications
    ? Object.entries(NOTIFICATION_LABELS)
        .filter(([key]) => key in grouped.notifications)
        .map(([key, label]) => ({ name: label, enabled: grouped.notifications[key] === 'true' }))
    : [];

  const storageStats = storageData
    ? [
        { label: 'Database', value: storageData.database },
        { label: 'Database Size', value: storageData.databaseSize },
        { label: 'Active Connections', value: `${storageData.activeConnections} / ${storageData.poolMax}` },
      ]
    : [];

  const isLoading = settingsLoading || storageLoading;

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

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
                  </div>
                  <p className="text-sm font-medium text-text-primary mt-0.5">{stat.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
