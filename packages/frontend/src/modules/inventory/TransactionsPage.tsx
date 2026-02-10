import { useState, useMemo } from 'react';
import { Card, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import { getRecentInventoryTransactions } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const TYPE_VARIANT: Record<string, 'success' | 'danger' | 'info' | 'warning' | 'default'> = {
  receipt: 'success',
  issue: 'danger',
  transfer: 'info',
  adjustment: 'warning',
  return: 'default',
};

function formatType(type: string) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>(() => getRecentInventoryTransactions());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [txnType, setTxnType] = useState('receipt');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [reference, setReference] = useState('');
  const [txnDate, setTxnDate] = useState('2024-12-15');

  const resetForm = () => {
    setTxnType('receipt');
    setItemName('');
    setQuantity('');
    setWarehouse('');
    setReference('');
    setTxnDate('2024-12-15');
  };

  const handleSubmit = () => {
    const qty = parseInt(quantity) || 0;
    const signedQty = txnType === 'issue' ? -Math.abs(qty) : Math.abs(qty);
    const newTxn = {
      id: `txn-${transactions.length + 101}`,
      transactionNumber: `TXN-${String(transactions.length + 2001).padStart(4, '0')}`,
      transactionType: txnType,
      itemName,
      itemNumber: `ITM-${String(transactions.length + 5001).padStart(4, '0')}`,
      quantity: signedQty,
      totalCost: Math.abs(signedQty) * 10,
      transactionDate: txnDate,
      referenceNumber: reference,
      warehouseName: warehouse,
      notes: '',
    };
    setTransactions((prev) => [newTxn, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'transactionNumber',
        header: 'Transaction #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.transactionNumber}
          </span>
        ),
      },
      {
        accessorKey: 'transactionType',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.original.transactionType as string;
          return (
            <Badge variant={TYPE_VARIANT[type] ?? 'default'}>
              {formatType(type)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'itemName',
        header: 'Item',
        cell: ({ row }) => (
          <div>
            <p className="text-sm text-text-primary">{row.original.itemName}</p>
            <p className="text-2xs text-text-muted">{row.original.itemNumber}</p>
          </div>
        ),
      },
      {
        accessorKey: 'quantity',
        header: 'Qty',
        cell: ({ row }) => {
          const qty = row.original.quantity;
          return (
            <span className={`text-sm font-medium ${qty < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {qty > 0 ? `+${qty}` : qty}
            </span>
          );
        },
      },
      {
        accessorKey: 'totalCost',
        header: 'Total Cost',
        cell: ({ row }) => (
          <span className="text-sm font-medium text-text-primary">
            {formatCurrency(Math.abs(row.original.totalCost))}
          </span>
        ),
      },
      {
        accessorKey: 'transactionDate',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {new Date(row.original.transactionDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: 'referenceNumber',
        header: 'Reference',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.referenceNumber ?? row.original.reasonCode ?? '-'}
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
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            Inventory Transactions
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            View recent inventory movements and adjustments
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>New Transaction</Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={transactions}
            searchable
            searchPlaceholder="Search transactions..."
            pageSize={15}
            emptyMessage="No transactions found."
          />
        </CardContent>
      </Card>

      {/* New Transaction SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Transaction"
        description="Record a new inventory transaction"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
            <select className={INPUT_CLS} value={txnType} onChange={(e) => setTxnType(e.target.value)}>
              <option value="receipt">Receive</option>
              <option value="issue">Issue</option>
              <option value="transfer">Transfer</option>
              <option value="adjustment">Adjust</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Item</label>
            <input className={INPUT_CLS} placeholder="Item name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Quantity</label>
            <input className={INPUT_CLS} type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Warehouse</label>
            <input className={INPUT_CLS} placeholder="Warehouse name" value={warehouse} onChange={(e) => setWarehouse(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Reference</label>
            <input className={INPUT_CLS} placeholder="e.g. PO-2001, WO-1001" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Date</label>
            <input className={INPUT_CLS} type="date" value={txnDate} onChange={(e) => setTxnDate(e.target.value)} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
