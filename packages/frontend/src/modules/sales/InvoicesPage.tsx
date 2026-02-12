import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, DataTable, Badge, SlideOver } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useInvoices } from '../../data-layer/hooks/useSales';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function InvoicesPage() {
  const { data: invoices = [] } = useInvoices();
  // TODO: wire create form to a mutation hook instead of local state

  // ── SlideOver form state ──
  const [showForm, setShowForm] = useState(false);
  const [formCustomer, setFormCustomer] = useState('');
  const [formInvoiceDate, setFormInvoiceDate] = useState('2024-12-15');
  const [formDueDate, setFormDueDate] = useState('2025-01-14');
  const [formAmount, setFormAmount] = useState('');
  const [formStatus, setFormStatus] = useState('draft');

  const resetForm = () => {
    setFormCustomer('');
    setFormInvoiceDate('2024-12-15');
    setFormDueDate('2025-01-14');
    setFormAmount('');
    setFormStatus('draft');
  };

  const handleSubmit = () => {
    const invNum = invoices.length + 5001;
    const amount = parseFloat(formAmount) || 0;
    const newInvoice = {
      id: `inv-${String(invoices.length + 1001).padStart(4, '0')}`,
      tenantId: 'tenant-demo',
      invoiceNumber: `INV-2024-${invNum}`,
      customerId: '',
      customerName: formCustomer,
      invoiceDate: formInvoiceDate,
      dueDate: formDueDate,
      invoiceAmount: amount,
      taxAmount: 0,
      totalAmount: amount,
      paidAmount: 0,
      currency: 'USD',
      status: formStatus,
      description: '',
      createdAt: '2024-12-15T10:00:00Z',
      updatedAt: '2024-12-15T10:00:00Z',
      createdBy: 'user-001',
      updatedBy: 'user-001',
    };
    // TODO: call create mutation instead of setInvoices
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.invoiceNumber}</span>
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
        accessorKey: 'invoiceDate',
        header: 'Invoice Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {format(new Date(row.original.invoiceDate), 'MMM dd, yyyy')}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.dueDate
              ? format(new Date(row.original.dueDate), 'MMM dd, yyyy')
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
              : status === 'paid'
              ? 'success'
              : status === 'overdue'
              ? 'danger'
              : status === 'partial'
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
      {
        accessorKey: 'paidAmount',
        header: 'Amount Paid',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {formatCurrency(row.original.paidAmount ?? 0)}
          </span>
        ),
      },
      {
        id: 'balanceDue',
        header: 'Balance Due',
        cell: ({ row }) => {
          const balance = row.original.totalAmount - (row.original.paidAmount ?? 0);
          return (
            <span className="font-medium text-text-primary">
              {formatCurrency(balance)}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Customer Invoices</h1>
          <p className="text-xs text-text-muted mt-0.5">
            View and manage all customer invoices
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Invoice
        </Button>
      </div>

      {/* KPI Summary Cards */}
      {(() => {
        const totalInvoices = invoices.length;
        const paidInvoices = invoices.filter((i: any) => i.status === 'paid').length;
        const overdueInvoices = invoices.filter((i: any) => i.status === 'overdue').length;
        const totalOutstanding = invoices.reduce((sum: number, i: any) => {
          const total = Number(i.totalAmount ?? 0);
          const paid = Number(i.paidAmount ?? 0);
          return sum + Math.max(0, total - paid);
        }, 0);
        return (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Total Invoices</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{totalInvoices.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Paid</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">{paidInvoices.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Overdue</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{overdueInvoices.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Outstanding</p>
                  <p className="text-lg font-bold text-brand-600 mt-2">{formatCurrency(totalOutstanding)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={invoices} />
        </CardContent>
      </Card>

      {/* New Invoice SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Invoice"
        description="Create a new customer invoice"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Invoice Date</label>
            <input type="date" className={INPUT_CLS} value={formInvoiceDate} onChange={(e) => setFormInvoiceDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Due Date</label>
            <input type="date" className={INPUT_CLS} value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Amount</label>
            <input type="number" className={INPUT_CLS} placeholder="0.00" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select className={INPUT_CLS} value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
