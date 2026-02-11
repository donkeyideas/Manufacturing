import { Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Input } from '@erp/ui';
import { INDUSTRY_LIST } from '@erp/shared';
import { useIndustry, useAppMode } from '../../data-layer/providers/AppModeProvider';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const demoNotificationSettings = [
  { label: 'Email Notifications', enabled: true },
  { label: 'Low Stock Alerts', enabled: true },
  { label: 'Order Status Updates', enabled: true },
  { label: 'Weekly Reports', enabled: false },
];

export default function GeneralSettingsPage() {
  const { isDemo } = useAppMode();
  const { industryType, setIndustryType, industryProfile } = useIndustry();

  const notificationSettings = isDemo ? demoNotificationSettings : [];

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
              value={isDemo ? 'Precision Manufacturing Co.' : ''}
              placeholder={!isDemo ? 'Not configured' : undefined}
              disabled
              readOnly
            />
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Industry Type
              </label>
              <select
                className={INPUT_CLS}
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value as any)}
              >
                {INDUSTRY_LIST.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <p className="text-2xs text-text-muted mt-1">
                {industryProfile.description}
              </p>
            </div>
            <Input
              label="Default Currency"
              value={isDemo ? 'USD' : ''}
              placeholder={!isDemo ? 'Not configured' : undefined}
              disabled
              readOnly
            />
            <Input
              label="Timezone"
              value={isDemo ? 'America/New_York (EST)' : ''}
              placeholder={!isDemo ? 'Not configured' : undefined}
              disabled
              readOnly
            />
            <Input
              label="Date Format"
              value={isDemo ? 'MM/DD/YYYY' : ''}
              placeholder={!isDemo ? 'Not configured' : undefined}
              disabled
              readOnly
            />
            <Input
              label="Fiscal Year Start"
              value={isDemo ? 'January' : ''}
              placeholder={!isDemo ? 'Not configured' : undefined}
              disabled
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      {/* Industry Terminology */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Terminology</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-text-muted mb-4">
            These labels are used throughout the system based on your industry type.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Batch / Lot Label"
              value={industryProfile.terminology.batchLabel}
              disabled
              readOnly
            />
            <Input
              label="Unit Label"
              value={industryProfile.terminology.unitLabel}
              disabled
              readOnly
            />
            <Input
              label="Quality Check Label"
              value={industryProfile.terminology.qualityCheckLabel}
              disabled
              readOnly
            />
            <Input
              label="Work Order Label"
              value={industryProfile.terminology.workOrderLabel}
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
          {notificationSettings.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">No notification settings configured.</p>
          ) : (
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
          )}
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
              value={isDemo ? 'English (US)' : ''}
              placeholder={!isDemo ? 'Not configured' : undefined}
              disabled
              readOnly
            />
            <Input
              label="Number Format"
              value={isDemo ? '1,000.00' : ''}
              placeholder={!isDemo ? 'Not configured' : undefined}
              disabled
              readOnly
            />
            <Input
              label="Weight Unit"
              value={isDemo ? 'kg' : ''}
              placeholder={!isDemo ? 'Not configured' : undefined}
              disabled
              readOnly
            />
            <Input
              label="Dimension Unit"
              value={isDemo ? 'cm' : ''}
              placeholder={!isDemo ? 'Not configured' : undefined}
              disabled
              readOnly
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
