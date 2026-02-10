import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { getChartOfAccounts } from '@erp/demo-data';
import { formatCurrency } from '@erp/shared';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function ChartOfAccountsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [accounts, setAccounts] = useState(() => getChartOfAccounts());

  // ── SlideOver form state ──
  const [showForm, setShowForm] = useState(false);
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('asset');
  const [formParentAccount, setFormParentAccount] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const resetForm = () => {
    setFormAccountNumber('');
    setFormName('');
    setFormType('asset');
    setFormParentAccount('');
    setFormDescription('');
  };

  const handleSubmit = () => {
    const newAccount = {
      id: `acc-${String(accounts.length + 1001).padStart(4, '0')}`,
      accountNumber: formAccountNumber,
      name: formName,
      type: formType,
      normalBalance: ['asset', 'expense'].includes(formType) ? 'debit' : 'credit',
      description: formDescription,
      isActive: true,
      balance: 0,
      parentAccountId: formParentAccount || null,
      createdAt: '2024-12-15T08:00:00Z',
      updatedAt: '2024-12-15T08:00:00Z',
    };
    setAccounts((prev) => [newAccount, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return accounts;
    const query = searchQuery.toLowerCase();
    return accounts.filter(
      (account) =>
        account.accountNumber.toLowerCase().includes(query) ||
        account.name.toLowerCase().includes(query) ||
        account.type.toLowerCase().includes(query)
    );
  }, [accounts, searchQuery]);

  const getAccountTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
      asset: 'success',
      liability: 'warning',
      equity: 'info',
      revenue: 'success',
      expense: 'danger',
    };
    return <Badge variant={variants[type] || 'default'}>{type.toUpperCase()}</Badge>;
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'accountNumber',
        header: 'Account #',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.accountNumber}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Account Name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-text-primary">{row.original.name}</p>
            {row.original.description && (
              <p className="text-xs text-text-muted mt-1">{row.original.description}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => getAccountTypeBadge(row.original.type),
      },
      {
        accessorKey: 'normalBalance',
        header: 'Normal Balance',
        cell: ({ row }) => (
          <span className="capitalize text-sm">{row.original.normalBalance}</span>
        ),
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(Math.abs(row.original.balance || 0))}
          </span>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'default'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Chart of Accounts</h1>
          <p className="text-xs text-text-muted">
            Manage your accounting structure - {filteredAccounts.length} accounts
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by account number, name, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface-0 text-text-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredAccounts} />
        </CardContent>
      </Card>

      {/* Account Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['asset', 'liability', 'equity', 'revenue', 'expense'].map((type) => {
          const count = accounts.filter((acc) => acc.type === type).length;
          const total = accounts
            .filter((acc) => acc.type === type)
            .reduce((sum, acc) => sum + Math.abs(acc.balance || 0), 0);

          return (
            <Card key={type}>
              <CardContent className="pt-6">
                <div className="text-center">
                  {getAccountTypeBadge(type)}
                  <p className="text-2xl font-bold text-text-primary mt-3">{count}</p>
                  <p className="text-xs text-text-muted mt-1">Accounts</p>
                  <p className="text-sm font-medium text-text-secondary mt-2">
                    {formatCurrency(total)}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* New Account SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Account"
        description="Add a new account to the chart of accounts"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Account Number</label>
            <input className={INPUT_CLS} placeholder="e.g. 1400" value={formAccountNumber} onChange={(e) => setFormAccountNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Account Name</label>
            <input className={INPUT_CLS} placeholder="e.g. Prepaid Expenses" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
            <select className={INPUT_CLS} value={formType} onChange={(e) => setFormType(e.target.value)}>
              <option value="asset">Asset</option>
              <option value="liability">Liability</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Parent Account</label>
            <input className={INPUT_CLS} placeholder="Optional parent account ID" value={formParentAccount} onChange={(e) => setFormParentAccount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea className={INPUT_CLS} rows={3} placeholder="Account description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
