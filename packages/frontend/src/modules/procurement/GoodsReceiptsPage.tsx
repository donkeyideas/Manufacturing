import { useState, useMemo } from 'react';
import { Card, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { useGoodsReceipts } from '../../data-layer/hooks/useProcurement';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'info' | 'default'> = {
  pending: 'warning',
  accepted: 'success',
  partial: 'info',
};

function formatStatus(status: string) {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function GoodsReceiptsPage() {
  const { data: receipts = [] } = useGoodsReceipts();
  // TODO: wire create form to a mutation hook instead of local state

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [poNumber, setPoNumber] = useState('');
  const [vendor, setVendor] = useState('');
  const [receivedDate, setReceivedDate] = useState('2024-12-15');
  const [items, setItems] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('pending');

  const resetForm = () => {
    setPoNumber('');
    setVendor('');
    setReceivedDate('2024-12-15');
    setItems('');
    setQuantity('');
    setStatus('pending');
  };

  const handleSubmit = () => {
    const newReceipt = {
      id: `gr-${receipts.length + 101}`,
      receiptNumber: `GR-${String(receipts.length + 2001).padStart(4, '0')}`,
      poNumber,
      vendorName: vendor,
      receiptDate: receivedDate,
      notes: `${items} (Qty: ${quantity})`,
      status,
    };
    // TODO: call create mutation instead of setReceipts
    setShowForm(false);
    resetForm();
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'receiptNumber',
        header: 'Receipt #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.receiptNumber}
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
        accessorKey: 'receiptDate',
        header: 'Receipt Date',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {new Date(row.original.receiptDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary truncate max-w-xs block">
            {row.original.notes}
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
            Goods Receipts
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Track incoming goods and receiving status
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>New Receipt</Button>
      </div>

      {/* KPI Summary Cards */}
      {(() => {
        const total = receipts.length;
        const accepted = receipts.filter((r: any) => r.status === 'accepted').length;
        const pending = receipts.filter((r: any) => r.status === 'pending').length;
        const partial = receipts.filter((r: any) => r.status === 'partial').length;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Total Receipts</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{total.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Accepted</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">{accepted.toLocaleString()}</p>
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
                  <p className="text-xs text-text-muted">Partial</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{partial.toLocaleString()}</p>
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
            data={receipts}
            searchable
            searchPlaceholder="Search receipts..."
            pageSize={15}
            emptyMessage="No goods receipts found."
          />
        </CardContent>
      </Card>

      {/* New Goods Receipt SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Goods Receipt"
        description="Record a new goods receipt"
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
            <label className="block text-sm font-medium text-text-primary mb-1">PO #</label>
            <input className={INPUT_CLS} placeholder="e.g. PO-2001" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Vendor</label>
            <input className={INPUT_CLS} placeholder="Vendor name" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Received Date</label>
            <input className={INPUT_CLS} type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Items</label>
            <input className={INPUT_CLS} placeholder="Items received" value={items} onChange={(e) => setItems(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Quantity</label>
            <input className={INPUT_CLS} type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select className={INPUT_CLS} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
