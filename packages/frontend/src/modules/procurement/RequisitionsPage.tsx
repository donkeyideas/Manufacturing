import { useState, useMemo } from 'react';
import { Card, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import { getRequisitions } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'danger' | 'info' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  converted: 'info',
};

const PRIORITY_VARIANT: Record<string, 'default' | 'warning' | 'danger'> = {
  low: 'default',
  medium: 'warning',
  high: 'danger',
};

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<any[]>(() => getRequisitions());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [requester, setRequester] = useState('');
  const [department, setDepartment] = useState('');
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [priority, setPriority] = useState('medium');

  const resetForm = () => {
    setRequester('');
    setDepartment('');
    setItem('');
    setQuantity('');
    setEstimatedCost('');
    setPriority('medium');
  };

  const handleSubmit = () => {
    const newReq = {
      id: `req-${requisitions.length + 101}`,
      requisitionNumber: `REQ-${String(requisitions.length + 2001).padStart(4, '0')}`,
      requestedBy: requester,
      department,
      description: item,
      items: parseInt(quantity) || 1,
      estimatedTotal: parseFloat(estimatedCost) || 0,
      status: 'pending',
      priority,
      requestDate: '2024-12-15',
    };
    setRequisitions((prev) => [newReq, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'requisitionNumber',
        header: 'Requisition #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.requisitionNumber}
          </span>
        ),
      },
      {
        accessorKey: 'requestedBy',
        header: 'Requested By',
        cell: ({ row }) => (
          <span className="text-sm text-text-primary">
            {row.original.requestedBy}
          </span>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.department}
          </span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary truncate max-w-xs block">
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: 'items',
        header: 'Items',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.items}
          </span>
        ),
      },
      {
        accessorKey: 'estimatedTotal',
        header: 'Est. Total',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {formatCurrency(row.original.estimatedTotal)}
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
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
          const p = row.original.priority as string;
          return (
            <Badge variant={PRIORITY_VARIANT[p] ?? 'default'}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
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
            Purchase Requisitions
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Review and manage purchase requisition requests
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>New Requisition</Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={requisitions}
            searchable
            searchPlaceholder="Search requisitions..."
            pageSize={15}
            emptyMessage="No requisitions found."
          />
        </CardContent>
      </Card>

      {/* New Requisition SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Requisition"
        description="Submit a new purchase requisition"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Requester</label>
            <input className={INPUT_CLS} placeholder="Your name" value={requester} onChange={(e) => setRequester(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Department</label>
            <input className={INPUT_CLS} placeholder="e.g. Manufacturing, Engineering" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Item Description</label>
            <input className={INPUT_CLS} placeholder="What do you need?" value={item} onChange={(e) => setItem(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Quantity</label>
            <input className={INPUT_CLS} type="number" placeholder="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Estimated Cost ($)</label>
            <input className={INPUT_CLS} type="number" placeholder="0.00" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Priority</label>
            <select className={INPUT_CLS} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
