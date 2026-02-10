import { Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Input } from '@erp/ui';

const notificationSettings = [
  { label: 'Email Notifications', enabled: true },
  { label: 'Low Stock Alerts', enabled: true },
  { label: 'Order Status Updates', enabled: true },
  { label: 'Weekly Reports', enabled: false },
];

export default function GeneralSettingsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
          <Settings className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">General Settings</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Configure your organization's basic settings
          </p>
        </div>
      </div>

      {/* Organization Details */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value="Precision Manufacturing Co."
              disabled
              readOnly
            />
            <Input
              label="Industry"
              value="Manufacturing"
              disabled
              readOnly
            />
            <Input
              label="Default Currency"
              value="USD"
              disabled
              readOnly
            />
            <Input
              label="Timezone"
              value="America/New_York (EST)"
              disabled
              readOnly
            />
            <Input
              label="Date Format"
              value="MM/DD/YYYY"
              disabled
              readOnly
            />
            <Input
              label="Fiscal Year Start"
              value="January"
              disabled
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificationSettings.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-text-primary">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      item.enabled ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      item.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-muted'
                    }`}
                  >
                    {item.enabled ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Language"
              value="English (US)"
              disabled
              readOnly
            />
            <Input
              label="Number Format"
              value="1,000.00"
              disabled
              readOnly
            />
            <Input
              label="Weight Unit"
              value="kg"
              disabled
              readOnly
            />
            <Input
              label="Dimension Unit"
              value="cm"
              disabled
              readOnly
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
