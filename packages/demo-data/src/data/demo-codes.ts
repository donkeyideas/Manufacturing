import type { DemoCodeListItem } from '@erp/shared';

export function getDemoCodeList(): DemoCodeListItem[] {
  return [
    {
      id: '1', code: 'DEMO-A7X9', label: 'Acme Corp Sales Demo',
      template: 'manufacturing', status: 'active',
      createdAt: '2025-01-28T10:00:00Z', expiresAt: '2025-02-28T10:00:00Z',
      usageCount: 14, maxUses: 50, lastUsed: '2025-02-09T08:30:00Z',
      modulesEnabled: ['financial', 'manufacturing', 'sales', 'inventory'],
    },
    {
      id: '2', code: 'DEMO-K3P2', label: 'Pacific Steel Evaluation',
      template: 'full', status: 'active',
      createdAt: '2025-02-01T14:00:00Z', expiresAt: '2025-03-01T14:00:00Z',
      usageCount: 8, maxUses: 25, lastUsed: '2025-02-08T16:45:00Z',
      modulesEnabled: ['financial', 'manufacturing', 'sales', 'inventory', 'procurement', 'hr', 'assets', 'projects'],
    },
    {
      id: '3', code: 'DEMO-W5M8', label: 'Trade Show Feb 2025',
      template: 'manufacturing', status: 'active',
      createdAt: '2025-02-05T09:00:00Z', expiresAt: '2025-02-19T09:00:00Z',
      usageCount: 32, maxUses: 100, lastUsed: '2025-02-09T11:20:00Z',
      modulesEnabled: ['financial', 'manufacturing', 'sales', 'inventory', 'procurement'],
    },
    {
      id: '4', code: 'DEMO-R9T4', label: 'Investor Pitch Deck',
      template: 'full', status: 'active',
      createdAt: '2025-02-07T08:00:00Z', expiresAt: '2025-02-21T08:00:00Z',
      usageCount: 3, maxUses: 10, lastUsed: '2025-02-08T14:00:00Z',
      modulesEnabled: ['financial', 'manufacturing', 'sales', 'inventory', 'procurement', 'hr', 'assets', 'projects'],
    },
    {
      id: '5', code: 'DEMO-H2L6', label: 'Coastal Fab Free Trial',
      template: 'distribution', status: 'expired',
      createdAt: '2025-01-10T10:00:00Z', expiresAt: '2025-01-24T10:00:00Z',
      usageCount: 19, maxUses: 50, lastUsed: '2025-01-23T09:15:00Z',
      modulesEnabled: ['financial', 'sales', 'inventory', 'procurement'],
    },
    {
      id: '6', code: 'DEMO-N4V1', label: 'Mountain Parts Eval',
      template: 'manufacturing', status: 'revoked',
      createdAt: '2025-01-15T12:00:00Z', expiresAt: '2025-02-15T12:00:00Z',
      usageCount: 7, maxUses: 25, lastUsed: '2025-01-20T17:30:00Z',
      modulesEnabled: ['financial', 'manufacturing', 'inventory'],
    },
    {
      id: '7', code: 'DEMO-B8J3', label: 'Sales Team Internal',
      template: 'full', status: 'active',
      createdAt: '2025-02-01T08:00:00Z', expiresAt: '2025-04-01T08:00:00Z',
      usageCount: 45, maxUses: 200, lastUsed: '2025-02-09T10:00:00Z',
      modulesEnabled: ['financial', 'manufacturing', 'sales', 'inventory', 'procurement', 'hr', 'assets', 'projects'],
    },
    {
      id: '8', code: 'DEMO-G6Q5', label: 'Tech Assemblies Demo',
      template: 'manufacturing', status: 'active',
      createdAt: '2025-02-03T15:00:00Z', expiresAt: '2025-03-03T15:00:00Z',
      usageCount: 5, maxUses: 30, lastUsed: '2025-02-07T11:00:00Z',
      modulesEnabled: ['financial', 'manufacturing', 'sales', 'inventory', 'procurement'],
    },
    {
      id: '9', code: 'DEMO-F1Y7', label: 'January Webinar Follow-up',
      template: 'distribution', status: 'expired',
      createdAt: '2025-01-20T10:00:00Z', expiresAt: '2025-02-03T10:00:00Z',
      usageCount: 67, maxUses: 100, lastUsed: '2025-02-02T22:15:00Z',
      modulesEnabled: ['financial', 'sales', 'inventory', 'procurement'],
    },
    {
      id: '10', code: 'DEMO-C3Z2', label: 'Partner Program Demo',
      template: 'full', status: 'active',
      createdAt: '2025-02-06T10:00:00Z', expiresAt: '2025-05-06T10:00:00Z',
      usageCount: 2, maxUses: 500, lastUsed: '2025-02-08T09:30:00Z',
      modulesEnabled: ['financial', 'manufacturing', 'sales', 'inventory', 'procurement', 'hr', 'assets', 'projects'],
    },
  ];
}
