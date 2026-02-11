import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, accountImportSchema, validateRow, coerceRow } from '@erp/shared';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Search, Upload } from 'lucide-react';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';
import { useChartOfAccounts, useCreateAccount, useImportAccounts } from '../../data-layer/hooks/useFinancial';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function ChartOfAccountsPage() {
  const { data: accounts = [], isLoading } = useChartOfAccounts();
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();
  const { mutateAsync: importAccounts } = useImportAccounts();
  const { isDemo } = useAppMode();

  const [searchQuery, setSearchQuery] = useState('');

  // ── SlideOver form state ──
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
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
    createAccount(
      {
        accountNumber: formAccountNumber,
        name: formName,
        type: formType,
        description: formDescription,
        parentAccountId: formParentAccount || undefined,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      }
    );
  };

  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return accounts;
    const query = searchQuery.toLowerCase();
    return accounts.filter(
      (account: any) =>
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

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-surface-2 animate-skeleton" />
        <div className="h-3 w-72 rounded bg-surface-2 animate-skeleton" />
        <div className="h-64 rounded-lg border border-border bg-surface-1 animate-skeleton mt-4" />
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button className="flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
        </div>
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
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(accounts, 'chart-of-accounts')}
              onExportExcel={() => exportToExcel(accounts, 'chart-of-accounts')}
            />
          </div>
          <DataTable columns={columns} data={filteredAccounts} />
        </CardContent>
      </Card>

      {/* Account Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['asset', 'liability', 'equity', 'revenue', 'expense'].map((type) => {
          const count = accounts.filter((acc: any) => acc.type === type).length;
          const total = accounts
            .filter((acc: any) => acc.type === type)
            .reduce((sum: number, acc: any) => sum + Math.abs(acc.balance || 0), 0);

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
            <Button onClick={handleSubmit} disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
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

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={accountImportSchema}
        onParseFile={parseFile}
        onAutoMap={autoMapColumns}
        onValidateRows={(rows, mappings, schema) => {
          const validData: Record<string, unknown>[] = [];
          const errors: any[] = [];
          rows.forEach((row, i) => {
            const mapped: Record<string, string> = {};
            mappings.forEach(m => {
              if (m.targetField && m.sourceColumn) {
                mapped[m.targetField] = row[m.sourceColumn] || '';
              }
            });
            const coerced = coerceRow(mapped, schema);
            const rowErrors = validateRow(coerced, schema);
            if (rowErrors.length > 0) {
              errors.push(...rowErrors.map(e => ({ ...e, row: i + 2 })));
            } else {
              validData.push(coerced);
            }
          });
          return { validData, errors };
        }}
        onImport={async (data) => {
          if (isDemo) {
            return { success: data.length, errors: [] };
          }
          const result = await importAccounts(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(accountImportSchema)}
      />
    </div>
  );
}
