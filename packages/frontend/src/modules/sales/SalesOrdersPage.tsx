import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, DataTable, Badge, SlideOver } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import { getSalesOrders } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState(() => getSalesOrders());

  // ── SlideOver form state ──
  const [showForm, setShowForm] = useState(false);
  const [formCustomer, setFormCustomer] = useState('');
  const [formOrderDate, setFormOrderDate] = useState('2024-12-15');
  const [formItems, setFormItems] = useState('');
  const [formTotalAmount, setFormTotalAmount] = useState('');
  const [formStatus, setFormStatus] = useState('draft');

  const resetForm = () => {
    setFormCustomer('');
    setFormOrderDate('2024-12-15');
    setFormItems('');
    setFormTotalAmount('');
    setFormStatus('draft');
  };

  const handleSubmit = () => {
    const orderNum = orders.length + 1001;
    const newOrder = {
      id: `so-${String(orders.length + 1001).padStart(4, '0')}`,
      tenantId: 'tenant-demo',
      soNumber: `SO-2024-${orderNum}`,
      soDate: formOrderDate,
      customerId: '',
      customerName: formCustomer,
      customerPONumber: '',
      status: formStatus,
      orderType: 'standard',
      currency: 'USD',
      subtotal: parseFloat(formTotalAmount) || 0,
      taxAmount: 0,
      shippingAmount: 0,
      discountAmount: 0,
      totalAmount: parseFloat(formTotalAmount) || 0,
      paymentTerms: 'Net 30',
      requestedShipDate: formOrderDate,
      lines: [],
      createdAt: '2024-12-15T09:00:00Z',
      updatedAt: '2024-12-15T09:00:00Z',
      createdBy: 'user-001',
      updatedBy: 'user-001',
    };
    setOrders((prev) => [newOrder, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'soNumber',
        header: 'SO #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.soNumber}</span>
        ),
      },
      {
        accessorKey: 'soDate',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {format(new Date(row.original.soDate), 'MMM dd, yyyy')}
          </span>
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
        accessorKey: 'orderType',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-text-secondary capitalize">
            {row.original.orderType.replace(/_/g, ' ')}
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
        accessorKey: 'requestedShipDate',
        header: 'Ship Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.requestedShipDate
              ? format(new Date(row.original.requestedShipDate), 'MMM dd, yyyy')
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
              : status === 'approved'
              ? 'info'
              : status === 'in_progress'
              ? 'primary'
              : status === 'shipped'
              ? 'warning'
              : status === 'delivered'
              ? 'success'
              : status === 'cancelled'
              ? 'danger'
              : 'default';

          return (
            <Badge variant={variant}>
              {status.replace(/_/g, ' ')}
            </Badge>
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
          <h1 className="text-lg font-semibold text-text-primary">Sales Orders</h1>
          <p className="text-xs text-text-muted mt-0.5">
            View and manage all sales orders
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Order
        </Button>
      </div>

      {/* Sales Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sales Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={orders} />
        </CardContent>
      </Card>

      {/* New Order SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Sales Order"
        description="Create a new sales order"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Order Date</label>
            <input type="date" className={INPUT_CLS} value={formOrderDate} onChange={(e) => setFormOrderDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Items</label>
            <textarea className={INPUT_CLS} rows={3} placeholder="List order items..." value={formItems} onChange={(e) => setFormItems(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Total Amount</label>
            <input type="number" className={INPUT_CLS} placeholder="0.00" value={formTotalAmount} onChange={(e) => setFormTotalAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select className={INPUT_CLS} value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
