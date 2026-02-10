import { Shield, Key, ScrollText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@erp/ui';

const apiKeys = [
  {
    name: 'Production Key',
    key: 'sk-prod-****7a3f',
    status: 'Active' as const,
    created: 'Jan 15, 2025',
  },
  {
    name: 'Development Key',
    key: 'sk-dev-****2b1e',
    status: 'Active' as const,
    created: 'Feb 3, 2025',
  },
  {
    name: 'Staging Key',
    key: 'sk-stg-****9c4d',
    status: 'Revoked' as const,
    created: 'Dec 10, 2024',
  },
];

const auditEntries = [
  { action: 'Admin user updated password policy', time: '2 hours ago' },
  { action: 'API key regenerated for production', time: '1 day ago' },
  { action: 'Two-factor authentication enabled', time: '3 days ago' },
  { action: "New user 'jane.doe@company.com' invited", time: '5 days ago' },
  { action: 'Session timeout updated to 30 minutes', time: '1 week ago' },
];

export default function SecurityPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
          <Shield className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Security</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage authentication and security settings
          </p>
        </div>
      </div>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-text-muted" />
            <CardTitle>Authentication</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-text-primary">Two-Factor Authentication</span>
              <Badge variant="success">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-text-primary">Session Timeout</span>
              <span className="text-sm text-text-secondary">30 minutes</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-text-primary">Password Policy</span>
              <span className="text-xs text-text-secondary">
                Minimum 12 characters, uppercase, number, special char
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text-primary">Login Attempts Before Lock</span>
              <span className="text-sm text-text-secondary">5 attempts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-text-muted" />
            <CardTitle>API Keys</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Key
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((apiKey) => (
                  <tr
                    key={apiKey.name}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-2.5 text-sm text-text-primary font-medium">
                      {apiKey.name}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-text-secondary font-mono">
                      {apiKey.key}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant={apiKey.status === 'Active' ? 'success' : 'danger'}
                      >
                        {apiKey.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-text-secondary">
                      {apiKey.created}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-text-muted" />
            <CardTitle>Audit Log</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {auditEntries.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
              >
                <span className="text-sm text-text-primary">{entry.action}</span>
                <span className="text-xs text-text-muted whitespace-nowrap ml-4">
                  {entry.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
