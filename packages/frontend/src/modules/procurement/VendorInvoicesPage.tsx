import { useState, useMemo } from 'react';
import { Card, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { useVendorInvoices } from '../../data-layer/hooks/useProcurement';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const STATUS_VARIANT: Record<string, 'default' | 'warning' | 'success' | 'info' | 'danger'> = {
  draft: 'default',
  pending_approval: 'warning',
  approved: 'info',
  paid: 'success',
};

function formatStatus(status: string) {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function VendorInvoicesPage() {
  const { data: invoices = [] } = useVendorInvoices();
  // TODO: wire create form to a mutation hook instead of local state

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [vendor, setVendor] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('2024-12-15');
  const [dueDate, setDueDate] = useState('2024-12-30');
  const [amount, setAmount] = useState('');
  const [poReference, setPoReference] = useState('');

  const resetForm = () => {
    setVendor('');
    setInvoiceNumber('');
    setInvoiceDate('2024-12-15');
    setDueDate('2024-12-30');
    setAmount('');
    setPoReference('');
  };

  const handleSubmit = () => {
    const newInvoice = {
      id: `vinv-${invoices.length + 101}`,
      invoiceNumber: invoiceNumber || `VINV-${String(invoices.length + 2001).padStart(4, '0')}`,
      vendorName: vendor,
      poNumber: poReference,
      invoiceDate,
      dueDate,
      totalAmount: parseFloat(amount) || 0,
      status: 'draft',
    };
    // TODO: call create mutation instead of setInvoices
    setShowForm(false);
    resetForm();
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: 'Invoice #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.invoiceNumber}
          </span>
        ),
      },
      {
        accessorKey: 'vendorName',
        header: 'Vendor',
        cell: ({ row }) => (
          <span className="text-sm text-text-primary">
            {row.original.vendorName}
          </span>
        ),
      },
      {
        accessorKey: 'poNumber',
        header: 'PO #',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.poNumber}
          </span>
        ),
      },
      {
        accessorKey: 'invoiceDate',
        header: 'Invoice Date',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {new Date(row.original.invoiceDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {new Date(row.original.dueDate).toLocaleDateString()}
          </span>
        ),
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const s = row.original.status as string;
          return (
            <Badge variant={STATUS_VARIANT[s] ?? 'default'}>
              {formatStatus(s)}
            </Badge>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            Vendor Invoices
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Track and manage vendor invoices and payment status
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>New Invoice</Button>
      </div>

      {/* KPI Summary Cards */}
      {(() => {
        const total = invoices.length;
        const paid = invoices.filter((i: any) => i.status === 'paid').length;
        const pending = invoices.filter((i: any) => i.status === 'pending_approval' || i.status === 'approved').length;
        const totalAmount = invoices.reduce((sum: number, i: any) => sum + Number(i.totalAmount ?? 0), 0);
        return (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Total Invoices</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{total.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Paid</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">{paid.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Pending</p>
                  <p className="text-2xl font-bold text-amber-600 mt-2">{pending.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Total Amount</p>
                  <p className="text-lg font-bold text-brand-600 mt-2">{formatCurrency(totalAmount)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Table */}
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={invoices}
            searchable
            searchPlaceholder="Search invoices..."
            pageSize={15}
            emptyMessage="No invoices found."
          />
        </CardContent>
      </Card>

      {/* New Vendor Invoice SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Vendor Invoice"
        description="Record a new vendor invoice"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Vendor</label>
            <input className={INPUT_CLS} placeholder="Vendor name" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Invoice #</label>
            <input className={INPUT_CLS} placeholder="e.g. INV-2024-001" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Invoice Date</label>
            <input className={INPUT_CLS} type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Due Date</label>
            <input className={INPUT_CLS} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Amount ($)</label>
            <input className={INPUT_CLS} type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">PO Reference</label>
            <input className={INPUT_CLS} placeholder="e.g. PO-2001" value={poReference} onChange={(e) => setPoReference(e.target.value)} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
