import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, journalEntryImportSchema, validateRow, coerceRow } from '@erp/shared';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, FileText, Upload } from 'lucide-react';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';
import { useJournalEntries, useCreateJournalEntry, useImportJournalEntries } from '../../data-layer/hooks/useFinancial';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function JournalEntriesPage() {
  const { data: journalEntries = [], isLoading } = useJournalEntries();
  const { mutate: createJournalEntry, isPending: isCreating } = useCreateJournalEntry();
  const { mutateAsync: importJournalEntries } = useImportJournalEntries();
  const { isDemo } = useAppMode();

  // ── SlideOver form state ──
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [formDate, setFormDate] = useState('2024-12-15');
  const [formDescription, setFormDescription] = useState('');
  const [formDebitAccount, setFormDebitAccount] = useState('');
  const [formCreditAccount, setFormCreditAccount] = useState('');
  const [formAmount, setFormAmount] = useState('');

  const resetForm = () => {
    setFormDate('2024-12-15');
    setFormDescription('');
    setFormDebitAccount('');
    setFormCreditAccount('');
    setFormAmount('');
  };

  const handleSubmit = () => {
    const amount = parseFloat(formAmount) || 0;
    createJournalEntry(
      {
        entryDate: `${formDate}T00:00:00Z`,
        description: formDescription,
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
      },
      {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      }
    );
  };

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
            <p className="text-xs text-text-muted mt-1">
              {row.original.lineItems.length} line item{row.original.lineItems.length !== 1 ? 's' : ''}
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
        cell: () => (
          <Button variant="ghost" size="sm">
            <FileText className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

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
          <DataTable columns={columns} data={journalEntries} />
        </CardContent>
      </Card>

      {/* Entry Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['standard', 'adjusting', 'correcting', 'closing'].map((type) => {
          const count = journalEntries.filter((je: any) => je.type === type).length;
          const percentage = ((count / journalEntries.length) * 100).toFixed(1);

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

      {/* New Journal Entry SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Journal Entry"
        description="Create a new journal entry"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Date</label>
            <input type="date" className={INPUT_CLS} value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea className={INPUT_CLS} rows={3} placeholder="Entry description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Debit Account</label>
            <input className={INPUT_CLS} placeholder="e.g. 1000 - Cash" value={formDebitAccount} onChange={(e) => setFormDebitAccount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Credit Account</label>
            <input className={INPUT_CLS} placeholder="e.g. 4000 - Revenue" value={formCreditAccount} onChange={(e) => setFormCreditAccount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Amount</label>
            <input type="number" className={INPUT_CLS} placeholder="0.00" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
          </div>
        </div>
      </SlideOver>

      {/* Import Wizard */}
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
          if (isDemo) {
            return { success: data.length, errors: [] };
          }
          const result = await importJournalEntries(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(journalEntryImportSchema)}
      />
    </div>
  );
}
