export const MODULE_IDS = {
  DASHBOARD: 'dashboard',
  FINANCIAL: 'financial',
  SALES: 'sales',
  PROCUREMENT: 'procurement',
  INVENTORY: 'inventory',
  MANUFACTURING: 'manufacturing',
  HR_PAYROLL: 'hr-payroll',
  ASSETS: 'assets',
  PROJECTS: 'projects',
  AI: 'ai',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const;

export type ModuleId = (typeof MODULE_IDS)[keyof typeof MODULE_IDS];

export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  icon: string;
  basePath: string;
  children: { label: string; path: string; icon?: string }[];
}

export const MODULES: ModuleDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    basePath: '/dashboard',
    children: [],
  },
  {
    id: 'financial',
    label: 'Financial',
    icon: 'DollarSign',
    basePath: '/financial',
    children: [
      { label: 'Chart of Accounts', path: '/financial/chart-of-accounts' },
      { label: 'Journal Entries', path: '/financial/journal-entries' },
      { label: 'General Ledger', path: '/financial/general-ledger' },
      { label: 'Financial Statements', path: '/financial/statements' },
      { label: 'Fiscal Periods', path: '/financial/fiscal-periods' },
      { label: 'Currencies', path: '/financial/currencies' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: 'ShoppingCart',
    basePath: '/sales',
    children: [
      { label: 'Customers', path: '/sales/customers' },
      { label: 'Quotes', path: '/sales/quotes' },
      { label: 'Orders', path: '/sales/orders' },
      { label: 'Invoices', path: '/sales/invoices' },
      { label: 'Shipments', path: '/sales/shipments' },
      { label: 'Opportunities', path: '/sales/opportunities' },
    ],
  },
  {
    id: 'procurement',
    label: 'Procurement',
    icon: 'Truck',
    basePath: '/procurement',
    children: [
      { label: 'Vendors', path: '/procurement/vendors' },
      { label: 'Requisitions', path: '/procurement/requisitions' },
      { label: 'Purchase Orders', path: '/procurement/orders' },
      { label: 'Vendor Invoices', path: '/procurement/invoices' },
      { label: 'Goods Receipts', path: '/procurement/receipts' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: 'Package',
    basePath: '/inventory',
    children: [
      { label: 'Items', path: '/inventory/items' },
      { label: 'Warehouses', path: '/inventory/warehouses' },
      { label: 'Transactions', path: '/inventory/transactions' },
      { label: 'Cycle Counts', path: '/inventory/cycle-counts' },
      { label: 'Demand Planning', path: '/inventory/demand-planning' },
    ],
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    icon: 'Factory',
    basePath: '/manufacturing',
    children: [
      { label: 'Work Orders', path: '/manufacturing/work-orders' },
      { label: 'Bills of Materials', path: '/manufacturing/boms' },
      { label: 'Routings', path: '/manufacturing/routings' },
      { label: 'Work Centers', path: '/manufacturing/work-centers' },
      { label: 'Production Tracking', path: '/manufacturing/tracking' },
      { label: 'Quality Control', path: '/manufacturing/quality' },
    ],
  },
  {
    id: 'hr-payroll',
    label: 'HR & Payroll',
    icon: 'Users',
    basePath: '/hr',
    children: [
      { label: 'Employees', path: '/hr/employees' },
      { label: 'Time Clock', path: '/hr/time-clock' },
      { label: 'Payroll Periods', path: '/hr/payroll-periods' },
      { label: 'Payroll Runs', path: '/hr/payroll-runs' },
      { label: 'Leave Requests', path: '/hr/leave' },
    ],
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: 'Building2',
    basePath: '/assets',
    children: [
      { label: 'Fixed Assets', path: '/assets/list' },
      { label: 'Depreciation', path: '/assets/depreciation' },
      { label: 'Maintenance', path: '/assets/maintenance' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: 'FolderKanban',
    basePath: '/projects',
    children: [
      { label: 'Projects', path: '/projects/list' },
      { label: 'Task Boards', path: '/projects/boards' },
      { label: 'Sprints', path: '/projects/sprints' },
    ],
  },
  {
    id: 'ai',
    label: 'AI Assistant',
    icon: 'Bot',
    basePath: '/ai',
    children: [
      { label: 'Chat', path: '/ai/chat' },
      { label: 'Document Intelligence', path: '/ai/documents' },
      { label: 'Insights', path: '/ai/insights' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'BarChart3',
    basePath: '/reports',
    children: [
      { label: 'Report Builder', path: '/reports/builder' },
      { label: 'Analytics', path: '/reports/analytics' },
      { label: 'Scheduled Reports', path: '/reports/scheduled' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    basePath: '/settings',
    children: [
      { label: 'General', path: '/settings/general' },
      { label: 'Integrations', path: '/settings/integrations' },
      { label: 'Security', path: '/settings/security' },
      { label: 'Users & Roles', path: '/settings/users' },
    ],
  },
];
