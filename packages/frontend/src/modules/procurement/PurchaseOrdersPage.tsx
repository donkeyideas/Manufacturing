import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, DataTable, Button, Badge, SlideOver } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import { getPurchaseOrders } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>(() => getPurchaseOrders());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [vendor, setVendor] = useState('');
  const [poDate, setPoDate] = useState('2024-12-15');
  const [deliveryDate, setDeliveryDate] = useState('2024-12-30');
  const [itemsDescription, setItemsDescription] = useState('');
  const [total, setTotal] = useState('');
  const [status, setStatus] = useState('draft');

  const resetForm = () => {
    setVendor('');
    setPoDate('2024-12-15');
    setDeliveryDate('2024-12-30');
    setItemsDescription('');
    setTotal('');
    setStatus('draft');
  };

  const handleSubmit = () => {
    const newPO = {
      id: `po-${purchaseOrders.length + 101}`,
      poNumber: `PO-${String(purchaseOrders.length + 2001).padStart(4, '0')}`,
      vendorName: vendor,
      orderDate: poDate,
      deliveryDate,
      description: itemsDescription,
      totalAmount: parseFloat(total) || 0,
      orderType: 'standard',
      status,
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const getStatusVariant = (s: string) => {
    switch (s) {
      case 'draft':
        return 'default';
      case 'pending_approval':
        return 'warning';
      case 'approved':
        return 'info';
      case 'sent':
        return 'primary';
      case 'partially_received':
        return 'warning';
      case 'received':
        return 'success';
      case 'closed':
        return 'default';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const formatStatus = (s: string) => {
    return s
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'poNumber',
      header: 'PO #',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.poNumber}</span>
      ),
    },
    {
      accessorKey: 'orderDate',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-text-secondary">
          {new Date(row.original.orderDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'vendorName',
      header: 'Vendor',
      cell: ({ row }) => (
        <span className="text-text-primary">{row.original.vendorName}</span>
      ),
    },
    {
      accessorKey: 'orderType',
      header: 'Type',
      cell: ({ row }) => (
        <span className="text-text-secondary capitalize">
          {row.original.orderType}
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
      accessorKey: 'deliveryDate',
      header: 'Delivery Date',
      cell: ({ row }) => (
        <span className="text-text-secondary">
          {new Date(row.original.deliveryDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>
          {formatStatus(row.original.status)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            Purchase Orders
          </h1>
          <p className="text-xs text-text-muted">
            Manage purchase orders and track delivery status
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>New PO</Button>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={purchaseOrders} />
        </CardContent>
      </Card>

      {/* New Purchase Order SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Purchase Order"
        description="Create a new purchase order"
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
            <label className="block text-sm font-medium text-text-primary mb-1">PO Date</label>
            <input className={INPUT_CLS} type="date" value={poDate} onChange={(e) => setPoDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Expected Delivery</label>
            <input className={INPUT_CLS} type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Items Description</label>
            <textarea className={INPUT_CLS} rows={3} placeholder="Describe items being ordered..." value={itemsDescription} onChange={(e) => setItemsDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Total Amount ($)</label>
            <input className={INPUT_CLS} type="number" placeholder="0.00" value={total} onChange={(e) => setTotal(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select className={INPUT_CLS} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="sent">Sent</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
