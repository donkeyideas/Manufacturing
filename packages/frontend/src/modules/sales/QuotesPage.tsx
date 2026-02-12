import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, DataTable, Badge, SlideOver } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useQuotes } from '../../data-layer/hooks/useSales';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function QuotesPage() {
  const { data: quotes = [] } = useQuotes();
  // TODO: wire create form to a mutation hook instead of local state

  // ── SlideOver form state ──
  const [showForm, setShowForm] = useState(false);
  const [formCustomer, setFormCustomer] = useState('');
  const [formDate, setFormDate] = useState('2024-12-15');
  const [formExpiryDate, setFormExpiryDate] = useState('2025-01-14');
  const [formItems, setFormItems] = useState('');
  const [formAmount, setFormAmount] = useState('');

  const resetForm = () => {
    setFormCustomer('');
    setFormDate('2024-12-15');
    setFormExpiryDate('2025-01-14');
    setFormItems('');
    setFormAmount('');
  };

  const handleSubmit = () => {
    const quoteNum = quotes.length + 2001;
    const amount = parseFloat(formAmount) || 0;
    const newQuote = {
      id: `quote-${String(quotes.length + 1001).padStart(4, '0')}`,
      tenantId: 'tenant-demo',
      quoteNumber: `QT-2024-${quoteNum}`,
      quoteDate: formDate,
      expirationDate: formExpiryDate,
      customerId: '',
      customerName: formCustomer,
      status: 'draft',
      currency: 'USD',
      subtotal: amount,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: amount,
      paymentTerms: 'Net 30',
      convertedToSO: false,
      lines: [],
      createdAt: '2024-12-15T10:00:00Z',
      updatedAt: '2024-12-15T10:00:00Z',
      createdBy: 'user-001',
      updatedBy: 'user-001',
    };
    // TODO: call create mutation instead of setQuotes
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'quoteNumber',
        header: 'Quote #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.quoteNumber}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => (
          <span className="text-text-primary">{row.original.customerName}</span>
        ),
      },
      {
        accessorKey: 'quoteDate',
        header: 'Quote Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {format(new Date(row.original.quoteDate), 'MMM dd, yyyy')}
          </span>
        ),
      },
      {
        accessorKey: 'expirationDate',
        header: 'Expiry Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.expirationDate
              ? format(new Date(row.original.expirationDate), 'MMM dd, yyyy')
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const variant =
            status === 'draft'
              ? 'default'
              : status === 'sent'
              ? 'info'
              : status === 'accepted'
              ? 'success'
              : status === 'rejected'
              ? 'danger'
              : status === 'expired'
              ? 'warning'
              : 'default';

          return (
            <Badge variant={variant}>
              {status.replace(/_/g, ' ')}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total Amount',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {formatCurrency(row.original.totalAmount)}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Quotes</h1>
          <p className="text-xs text-text-muted mt-0.5">
            View and manage all sales quotes
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Quote
        </Button>
      </div>

      {/* KPI Summary Cards */}
      {(() => {
        const totalQuotes = quotes.length;
        const draftQuotes = quotes.filter((q: any) => q.status === 'draft').length;
        const sentQuotes = quotes.filter((q: any) => q.status === 'sent' || q.status === 'pending').length;
        const totalValue = quotes.reduce((sum: number, q: any) => sum + Number(q.totalAmount ?? 0), 0);
        return (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Total Quotes</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{totalQuotes.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Draft</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{draftQuotes.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Sent / Pending</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{sentQuotes.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Total Value</p>
                  <p className="text-lg font-bold text-brand-600 mt-2">{formatCurrency(totalValue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={quotes} />
        </CardContent>
      </Card>

      {/* New Quote SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Quote"
        description="Create a new sales quote"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Customer</label>
            <input className={INPUT_CLS} placeholder="e.g. Acme Manufacturing" value={formCustomer} onChange={(e) => setFormCustomer(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Quote Date</label>
            <input type="date" className={INPUT_CLS} value={formDate} onChange={(e) => setFormDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Expiry Date</label>
            <input type="date" className={INPUT_CLS} value={formExpiryDate} onChange={(e) => setFormExpiryDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Items</label>
            <textarea className={INPUT_CLS} rows={3} placeholder="List quote items..." value={formItems} onChange={(e) => setFormItems(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Amount</label>
            <input type="number" className={INPUT_CLS} placeholder="0.00" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
