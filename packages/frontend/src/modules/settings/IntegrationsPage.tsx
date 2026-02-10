import { Plug } from 'lucide-react';
import { Card, CardContent, Badge, Button } from '@erp/ui';

const integrations = [
  {
    name: 'QuickBooks Online',
    description: 'Sync financial data and invoices',
    connected: true,
  },
  {
    name: 'Stripe',
    description: 'Process payments and manage subscriptions',
    connected: true,
  },
  {
    name: 'Slack',
    description: 'Get notifications and alerts in Slack channels',
    connected: true,
  },
  {
    name: 'Salesforce',
    description: 'Sync customer and opportunity data',
    connected: false,
  },
  {
    name: 'ShipStation',
    description: 'Automate shipping and fulfillment',
    connected: false,
  },
  {
    name: 'Zapier',
    description: 'Connect with 5,000+ apps via automation',
    connected: false,
  },
  {
    name: 'AWS S3',
    description: 'Store documents and file attachments',
    connected: true,
  },
  {
    name: 'SendGrid',
    description: 'Transactional email delivery',
    connected: false,
  },
  {
    name: 'Twilio',
    description: 'SMS notifications and alerts',
    connected: false,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900">
          <Plug className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Integrations</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Connect your ERP with third-party services
          </p>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {integration.name}
                  </h3>
                  <Badge variant={integration.connected ? 'success' : 'default'}>
                    {integration.connected ? 'Connected' : 'Available'}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">{integration.description}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled
                  className="w-full mt-1"
                >
                  {integration.connected ? 'Configure' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
