import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, accountImportSchema, validateRow, coerceRow } from '@erp/shared';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Search, Upload, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';
import { useChartOfAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount, useImportAccounts, useSyncFinancials } from '../../data-layer/hooks/useFinancial';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'expense', label: 'Expense' },
];

const ACCOUNT_TYPE_BADGES: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
  asset: 'success',
  liability: 'warning',
  equity: 'info',
  revenue: 'success',
  expense: 'danger',
};

const NORMAL_BALANCE_OPTIONS = [
  { value: 'debit', label: 'Debit' },
  { value: 'credit', label: 'Credit' },
];

export default function ChartOfAccountsPage() {
  const { data: accounts = [], isLoading } = useChartOfAccounts();
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();
  const { mutate: updateAccount, isPending: isUpdating } = useUpdateAccount();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();
  const { mutateAsync: importAccounts } = useImportAccounts();
  const { mutate: syncFinancials, isPending: isSyncing } = useSyncFinancials();
  const { isDemo } = useAppMode();
  const [syncResult, setSyncResult] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState('');

  // -- SlideOver state --
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // -- Form fields --
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('asset');
  const [formNormalBalance, setFormNormalBalance] = useState('debit');
  const [formParentAccount, setFormParentAccount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const resetForm = () => {
    setFormAccountNumber('');
    setFormName('');
    setFormType('asset');
    setFormNormalBalance('debit');
    setFormParentAccount('');
    setFormDescription('');
    setFormIsActive(true);
  };

  const populateForm = (account: any) => {
    setFormAccountNumber(account.accountNumber || '');
    setFormName(account.name || '');
    setFormType(account.type || 'asset');
    setFormNormalBalance(account.normalBalance || 'debit');
    setFormParentAccount(account.parentAccountId || '');
    setFormDescription(account.description || '');
    setFormIsActive(account.isActive !== false);
  };

  // -- Actions --
  const handleCreate = () => {
    createAccount(
      {
        accountNumber: formAccountNumber,
        name: formName,
        type: formType,
        normalBalance: formNormalBalance,
        description: formDescription || undefined,
        parentAccountId: formParentAccount || undefined,
        isActive: formIsActive,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!selectedAccount) return;
    updateAccount(
      {
        id: selectedAccount.id,
        accountNumber: formAccountNumber,
        name: formName,
        type: formType,
        normalBalance: formNormalBalance,
        description: formDescription || undefined,
        parentAccountId: formParentAccount || undefined,
        isActive: formIsActive,
      },
      {
        onSuccess: () => {
          setShowView(false);
          setIsEditing(false);
          setSelectedAccount(null);
          resetForm();
        },
      },
    );
  };

  const handleDelete = () => {
    if (!selectedAccount) return;
    deleteAccount(selectedAccount.id, {
      onSuccess: () => {
        setShowView(false);
        setIsEditing(false);
        setShowDeleteConfirm(false);
        setSelectedAccount(null);
        resetForm();
      },
    });
  };

  const handleRowClick = (account: any) => {
    setSelectedAccount(account);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setShowView(true);
  };

  const handleStartEdit = () => {
    if (selectedAccount) populateForm(selectedAccount);
    setShowDeleteConfirm(false);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (selectedAccount) populateForm(selectedAccount);
    setIsEditing(false);
  };

  const handleCloseView = () => {
    setShowView(false);
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setSelectedAccount(null);
    resetForm();
  };

  // -- Filtered accounts --
  const filteredAccounts = useMemo(() => {
    if (!searchQuery) return accounts;
    const query = searchQuery.toLowerCase();
    return accounts.filter(
      (account: any) =>
        account.accountNumber?.toLowerCase().includes(query) ||
        account.name?.toLowerCase().includes(query) ||
        account.type?.toLowerCase().includes(query),
    );
  }, [accounts, searchQuery]);

  // -- Table columns --
  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'accountNumber',
        header: 'Account #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.accountNumber}</span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Account Name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-text-primary">{row.original.name}</p>
            {row.original.description && (
              <p className="text-xs text-text-muted mt-1 truncate max-w-xs">{row.original.description}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant={ACCOUNT_TYPE_BADGES[row.original.type] || 'default'}>
            {row.original.type?.toUpperCase()}
          </Badge>
        ),
      },
      {
        accessorKey: 'normalBalance',
        header: 'Normal Balance',
        cell: ({ row }) => (
          <span className="capitalize text-sm text-text-secondary">{row.original.normalBalance || '-'}</span>
        ),
      },
      {
        accessorKey: 'balance',
        header: 'Balance',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {formatCurrency(Math.abs(row.original.balance || 0))}
          </span>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive !== false ? 'success' : 'default'}>
            {row.original.isActive !== false ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    [],
  );

  // -- Shared form fields (create & edit) --
  const renderFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Account Number *</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. 1400"
          value={formAccountNumber}
          onChange={(e) => setFormAccountNumber(e.target.value)}
          disabled={isEditing}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Account Name *</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. Prepaid Expenses"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Type *</label>
        <select className={INPUT_CLS} value={formType} onChange={(e) => setFormType(e.target.value)}>
          {ACCOUNT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Normal Balance *</label>
        <select className={INPUT_CLS} value={formNormalBalance} onChange={(e) => setFormNormalBalance(e.target.value)}>
          {NORMAL_BALANCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Parent Account</label>
        <input
          className={INPUT_CLS}
          placeholder="Optional parent account ID"
          value={formParentAccount}
          onChange={(e) => setFormParentAccount(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
        <textarea
          className={INPUT_CLS}
          rows={3}
          placeholder="Account description"
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={formIsActive}
            onChange={(e) => setFormIsActive(e.target.checked)}
          />
          <div className="w-9 h-5 bg-surface-3 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500" />
        </label>
        <span className="text-sm font-medium text-text-primary">Active</span>
      </div>
    </div>
  );

  // -- View detail (read-only) --
  const renderViewDetails = () => {
    if (!selectedAccount) return null;
    const detailRow = (label: string, value: React.ReactNode) => (
      <div key={label} className="flex items-start justify-between py-2 border-b border-border last:border-b-0">
        <span className="text-sm text-text-muted">{label}</span>
        <span className="text-sm text-text-primary text-right max-w-[60%]">{value ?? '-'}</span>
      </div>
    );
    return (
      <div>
        {detailRow('Account Number', selectedAccount.accountNumber)}
        {detailRow('Account Name', selectedAccount.name)}
        {detailRow(
          'Type',
          <Badge variant={ACCOUNT_TYPE_BADGES[selectedAccount.type] || 'default'}>
            {selectedAccount.type?.toUpperCase()}
          </Badge>,
        )}
        {detailRow('Normal Balance', <span className="capitalize">{selectedAccount.normalBalance || '-'}</span>)}
        {detailRow('Parent Account', selectedAccount.parentAccountId || '-')}
        {detailRow('Description', selectedAccount.description || '-')}
        {detailRow('Balance', formatCurrency(Math.abs(selectedAccount.balance || 0)))}
        {detailRow(
          'Status',
          <Badge variant={selectedAccount.isActive !== false ? 'success' : 'default'}>
            {selectedAccount.isActive !== false ? 'Active' : 'Inactive'}
          </Badge>,
        )}
      </div>
    );
  };

  // -- Loading skeleton --
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
          {!isDemo && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => syncFinancials(undefined, {
                onSuccess: (data: any) => setSyncResult(data),
              })}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync All Modules'}
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Sync Result Banner */}
      {syncResult && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between">
          <p className="text-sm text-emerald-400">
            Sync complete: {syncResult.entriesGenerated} journal entries generated
            ({formatCurrency(syncResult.totalAmount)} total).
            {syncResult.accountsMissing?.length > 0 && (
              <span className="text-amber-400 ml-2">
                Missing accounts: {syncResult.accountsMissing.join(', ')}
              </span>
            )}
          </p>
          <button className="text-xs text-text-muted hover:text-text-primary" onClick={() => setSyncResult(null)}>Dismiss</button>
        </div>
      )}

      {/* Account Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {ACCOUNT_TYPE_OPTIONS.map(({ value: type, label }) => {
          const count = accounts.filter((acc: any) => acc.type === type).length;
          const total = accounts
            .filter((acc: any) => acc.type === type)
            .reduce((sum: number, acc: any) => sum + Math.abs(acc.balance || 0), 0);

          return (
            <Card key={type}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Badge variant={ACCOUNT_TYPE_BADGES[type] || 'default'}>{label.toUpperCase()}</Badge>
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
          <DataTable
            columns={columns}
            data={filteredAccounts}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      {/* New Account SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Account"
        description="Add a new account to the chart of accounts"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !formAccountNumber.trim() || !formName.trim()}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        {renderFormFields()}
      </SlideOver>

      {/* View / Edit Account SlideOver */}
      <SlideOver
        open={showView}
        onClose={handleCloseView}
        title={isEditing ? 'Edit Account' : 'Account Details'}
        description={
          isEditing
            ? `Editing ${selectedAccount?.accountNumber ?? ''}`
            : selectedAccount?.accountNumber ?? ''
        }
        width="md"
        footer={
          isEditing ? (
            <>
              <Button variant="secondary" onClick={handleCancelEdit} disabled={isUpdating}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating || !formAccountNumber.trim() || !formName.trim()}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              {!showDeleteConfirm ? (
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              ) : (
                <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </Button>
              )}
              <Button onClick={handleStartEdit}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </>
          )
        }
      >
        {isEditing ? renderFormFields() : renderViewDetails()}
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
          const result = await importAccounts(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(accountImportSchema)}
      />
    </div>
  );
}
