import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, journalEntryImportSchema, validateRow, coerceRow } from '@erp/shared';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Upload, Eye, Trash2 } from 'lucide-react';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';
import { useJournalEntries, useCreateJournalEntry, usePostJournalEntry, useDeleteJournalEntry, useImportJournalEntries } from '../../data-layer/hooks/useFinancial';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const todayString = () => new Date().toISOString().split('T')[0];

export default function JournalEntriesPage() {
  const { data: journalEntries = [], isLoading } = useJournalEntries();
  const { mutate: createJournalEntry, isPending: isCreating } = useCreateJournalEntry();
  const { mutate: postJournalEntry, isPending: isPosting } = usePostJournalEntry();
  const { mutate: deleteJournalEntry, isPending: isDeleting } = useDeleteJournalEntry();
  const { mutateAsync: importJournalEntries } = useImportJournalEntries();
  const { isDemo } = useAppMode();

  // ── SlideOver state ──
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [viewEntry, setViewEntry] = useState<any | null>(null);

  // ── Create form state ──
  const [formDate, setFormDate] = useState(todayString);
  const [formDescription, setFormDescription] = useState('');
  const [formReference, setFormReference] = useState('');
  const [formEntryType, setFormEntryType] = useState('standard');
  const [formDebitAccount, setFormDebitAccount] = useState('');
  const [formCreditAccount, setFormCreditAccount] = useState('');
  const [formAmount, setFormAmount] = useState('');

  const resetForm = () => {
    setFormDate(todayString());
    setFormDescription('');
    setFormReference('');
    setFormEntryType('standard');
    setFormDebitAccount('');
    setFormCreditAccount('');
    setFormAmount('');
  };

  const handleSubmit = () => {
    const amount = parseFloat(formAmount) || 0;
    if (!formDate || !formDebitAccount || !formCreditAccount || amount <= 0) return;

    createJournalEntry(
      {
        entryDate: `${formDate}T00:00:00Z`,
        description: formDescription,
        referenceNumber: formReference || undefined,
        entryType: formEntryType,
        lines: [
          {
            accountNumber: formDebitAccount,
            accountName: formDebitAccount,
            debit: amount,
            credit: 0,
            description: formDescription,
          },
          {
            accountNumber: formCreditAccount,
            accountName: formCreditAccount,
            debit: 0,
            credit: amount,
            description: formDescription,
          },
        ],
      } as any,
      {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      }
    );
  };

  const handlePost = (id: string) => {
    postJournalEntry(id, {
      onSuccess: () => {
        setViewEntry((prev: any) => (prev ? { ...prev, status: 'posted' } : null));
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteJournalEntry(id, {
      onSuccess: () => {
        setViewEntry(null);
      },
    });
  };

  // ── Badge helpers ──
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      posted: 'success',
      draft: 'default',
      voided: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
      standard: 'default',
      adjusting: 'warning',
      correcting: 'info',
      closing: 'success',
    };
    return <Badge variant={variants[type] || 'default'}>{type}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ── Table columns ──
  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'entryNumber',
        header: 'Entry #',
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.entryNumber}</span>
        ),
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.date)}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => getTypeBadge(row.original.type),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="text-sm text-text-primary truncate">{row.original.description}</p>
            {row.original.referenceNumber && (
              <p className="text-xs text-text-muted mt-0.5">Ref: {row.original.referenceNumber}</p>
            )}
            <p className="text-xs text-text-muted mt-0.5">
              {row.original.lineItems?.length ?? 0} line item{(row.original.lineItems?.length ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'totalDebit',
        header: 'Debit',
        cell: ({ row }) => (
          <span className="font-medium text-green-600">
            {formatCurrency(row.original.totalDebit)}
          </span>
        ),
      },
      {
        accessorKey: 'totalCredit',
        header: 'Credit',
        cell: ({ row }) => (
          <span className="font-medium text-red-600">
            {formatCurrency(row.original.totalCredit)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setViewEntry(row.original);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {row.original.status === 'draft' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleDelete(row.original.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  // ── Summary stats ──
  const summary = useMemo(() => {
    const posted = journalEntries.filter((je: any) => je.status === 'posted').length;
    const draft = journalEntries.filter((je: any) => je.status === 'draft').length;
    const voided = journalEntries.filter((je: any) => je.status === 'voided').length;
    const totalDebit = journalEntries
      .filter((je: any) => je.status === 'posted')
      .reduce((sum: number, je: any) => sum + je.totalDebit, 0);
    const totalCredit = journalEntries
      .filter((je: any) => je.status === 'posted')
      .reduce((sum: number, je: any) => sum + je.totalCredit, 0);

    return { posted, draft, voided, totalDebit, totalCredit };
  }, [journalEntries]);

  // ── Loading skeleton ──
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
          <h1 className="text-lg font-semibold text-text-primary">Journal Entries</h1>
          <p className="text-xs text-text-muted">
            View and manage all journal entries - {journalEntries.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button className="flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Posted</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{summary.posted}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Draft</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{summary.draft}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Voided</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{summary.voided}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Debits</p>
              <p className="text-lg font-bold text-green-600 mt-2">
                {formatCurrency(summary.totalDebit)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Credits</p>
              <p className="text-lg font-bold text-red-600 mt-2">
                {formatCurrency(summary.totalCredit)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Journal Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(journalEntries, 'journal-entries')}
              onExportExcel={() => exportToExcel(journalEntries, 'journal-entries')}
            />
          </div>
          <DataTable
            columns={columns}
            data={journalEntries}
            onRowClick={(row: any) => setViewEntry(row)}
          />
        </CardContent>
      </Card>

      {/* Entry Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['standard', 'adjusting', 'correcting', 'closing'].map((type) => {
          const count = journalEntries.filter((je: any) => je.type === type).length;
          const percentage = journalEntries.length > 0
            ? ((count / journalEntries.length) * 100).toFixed(1)
            : '0.0';

          return (
            <Card key={type}>
              <CardContent className="pt-6">
                <div className="text-center">
                  {getTypeBadge(type)}
                  <p className="text-2xl font-bold text-text-primary mt-3">{count}</p>
                  <p className="text-xs text-text-muted mt-1">{percentage}% of entries</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── View Entry SlideOver ── */}
      <SlideOver
        open={viewEntry !== null}
        onClose={() => setViewEntry(null)}
        title={viewEntry ? `Journal Entry ${viewEntry.entryNumber}` : 'Journal Entry'}
        description="Entry details and line items"
        width="lg"
        footer={
          viewEntry ? (
            <div className="flex items-center gap-2 w-full">
              {viewEntry.status === 'draft' && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(viewEntry.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                  <div className="flex-1" />
                  <Button
                    onClick={() => handlePost(viewEntry.id)}
                    disabled={isPosting}
                  >
                    {isPosting ? 'Posting...' : 'Post Entry'}
                  </Button>
                </>
              )}
              {viewEntry.status !== 'draft' && (
                <>
                  <div className="flex-1" />
                  <Button variant="secondary" onClick={() => setViewEntry(null)}>
                    Close
                  </Button>
                </>
              )}
            </div>
          ) : null
        }
      >
        {viewEntry && (
          <div className="space-y-6">
            {/* Entry header info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted">Entry Number</p>
                <p className="text-sm font-medium text-text-primary mt-1">{viewEntry.entryNumber}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Date</p>
                <p className="text-sm font-medium text-text-primary mt-1">{formatDate(viewEntry.date)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Type</p>
                <div className="mt-1">{getTypeBadge(viewEntry.type)}</div>
              </div>
              <div>
                <p className="text-xs text-text-muted">Status</p>
                <div className="mt-1">{getStatusBadge(viewEntry.status)}</div>
              </div>
              {viewEntry.referenceNumber && (
                <div className="col-span-2">
                  <p className="text-xs text-text-muted">Reference Number</p>
                  <p className="text-sm font-medium text-text-primary mt-1">{viewEntry.referenceNumber}</p>
                </div>
              )}
              {viewEntry.description && (
                <div className="col-span-2">
                  <p className="text-xs text-text-muted">Description</p>
                  <p className="text-sm text-text-primary mt-1">{viewEntry.description}</p>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-surface-1 border border-border">
              <div className="text-center">
                <p className="text-xs text-text-muted">Total Debits</p>
                <p className="text-lg font-bold text-green-600 mt-1">
                  {formatCurrency(viewEntry.totalDebit)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-text-muted">Total Credits</p>
                <p className="text-lg font-bold text-red-600 mt-1">
                  {formatCurrency(viewEntry.totalCredit)}
                </p>
              </div>
            </div>

            {/* Line items table */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Line Items</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-1">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium text-text-muted">Account</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-text-muted">Description</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-text-muted">Debit</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-text-muted">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewEntry.lineItems ?? []).map((line: any, idx: number) => (
                      <tr key={idx} className="border-t border-border">
                        <td className="px-3 py-2">
                          <span className="font-medium">{line.accountNumber}</span>
                          {line.accountName && line.accountName !== line.accountNumber && (
                            <span className="text-text-muted ml-1">- {line.accountName}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-text-muted">{line.description || '-'}</td>
                        <td className="px-3 py-2 text-right font-medium text-green-600">
                          {line.debit > 0 ? formatCurrency(line.debit) : '-'}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-red-600">
                          {line.credit > 0 ? formatCurrency(line.credit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Metadata */}
            {(viewEntry.createdAt || viewEntry.postedAt) && (
              <div className="text-xs text-text-muted space-y-1 pt-2 border-t border-border">
                {viewEntry.createdAt && (
                  <p>Created: {formatDate(viewEntry.createdAt)}</p>
                )}
                {viewEntry.postedAt && (
                  <p>Posted: {formatDate(viewEntry.postedAt)}</p>
                )}
                {viewEntry.createdBy && (
                  <p>Created by: {viewEntry.createdBy}</p>
                )}
              </div>
            )}
          </div>
        )}
      </SlideOver>

      {/* ── New Journal Entry SlideOver ── */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Journal Entry"
        description="Create a new journal entry with debit and credit lines"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Save Entry'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Date *</label>
            <input
              type="date"
              className={INPUT_CLS}
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea
              className={INPUT_CLS}
              rows={3}
              placeholder="Entry description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Reference Number</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. INV-2024-001"
              value={formReference}
              onChange={(e) => setFormReference(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Entry Type</label>
            <select
              className={INPUT_CLS}
              value={formEntryType}
              onChange={(e) => setFormEntryType(e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="adjusting">Adjusting</option>
              <option value="correcting">Correcting</option>
              <option value="closing">Closing</option>
            </select>
          </div>

          <hr className="border-border" />

          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Line Items</p>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Debit Account *</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. 1000 - Cash"
              value={formDebitAccount}
              onChange={(e) => setFormDebitAccount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Credit Account *</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. 4000 - Revenue"
              value={formCreditAccount}
              onChange={(e) => setFormCreditAccount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Amount *</label>
            <input
              type="number"
              className={INPUT_CLS}
              placeholder="0.00"
              min="0"
              step="0.01"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
            />
          </div>
        </div>
      </SlideOver>

      {/* ── Import Wizard ── */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={journalEntryImportSchema}
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
          const result = await importJournalEntries(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(journalEntryImportSchema)}
      />
    </div>
  );
}
