import { useState, useMemo } from 'react';
import { Card, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import { getCycleCounts } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const STATUS_VARIANT: Record<string, 'default' | 'info' | 'success'> = {
  scheduled: 'default',
  in_progress: 'info',
  completed: 'success',
};

function formatStatus(status: string) {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CycleCountsPage() {
  const [cycleCounts, setCycleCounts] = useState<any[]>(() => getCycleCounts());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [warehouse, setWarehouse] = useState('');
  const [zone, setZone] = useState('');
  const [plannedDate, setPlannedDate] = useState('2024-12-20');
  const [itemsToCount, setItemsToCount] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const resetForm = () => {
    setWarehouse('');
    setZone('');
    setPlannedDate('2024-12-20');
    setItemsToCount('');
    setAssignedTo('');
  };

  const handleSubmit = () => {
    const totalItems = parseInt(itemsToCount) || 0;
    const newCount = {
      id: `cc-${cycleCounts.length + 101}`,
      countNumber: `CC-${String(cycleCounts.length + 2001).padStart(4, '0')}`,
      warehouseName: warehouse,
      zone,
      scheduledDate: plannedDate,
      status: 'scheduled',
      totalItems,
      countedItems: 0,
      discrepancies: 0,
      adjustmentValue: 0,
      countedBy: assignedTo || null,
    };
    setCycleCounts((prev) => [newCount, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'countNumber',
        header: 'Count #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.countNumber}
          </span>
        ),
      },
      {
        accessorKey: 'warehouseName',
        header: 'Warehouse',
        cell: ({ row }) => (
          <span className="text-sm text-text-primary">
            {row.original.warehouseName}
          </span>
        ),
      },
      {
        accessorKey: 'zone',
        header: 'Zone',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.zone}
          </span>
        ),
      },
      {
        accessorKey: 'scheduledDate',
        header: 'Scheduled Date',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {new Date(row.original.scheduledDate).toLocaleDateString()}
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
      {
        accessorKey: 'totalItems',
        header: 'Total Items',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.totalItems}
          </span>
        ),
      },
      {
        accessorKey: 'countedItems',
        header: 'Counted',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.countedItems}
          </span>
        ),
      },
      {
        accessorKey: 'discrepancies',
        header: 'Discrepancies',
        cell: ({ row }) => {
          const val = row.original.discrepancies;
          return (
            <span className={`text-sm font-medium ${val > 0 ? 'text-amber-600' : 'text-text-secondary'}`}>
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: 'adjustmentValue',
        header: 'Adjustment Value',
        cell: ({ row }) => {
          const val = row.original.adjustmentValue;
          if (val === 0) return <span className="text-sm text-text-muted">-</span>;
          return (
            <span className={`text-sm font-medium ${val < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatCurrency(val)}
            </span>
          );
        },
      },
      {
        accessorKey: 'countedBy',
        header: 'Counted By',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.countedBy ?? '-'}
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
            Cycle Counts
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Schedule and track inventory cycle count activities
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>New Cycle Count</Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={cycleCounts}
            searchable
            searchPlaceholder="Search cycle counts..."
            pageSize={15}
            emptyMessage="No cycle counts found."
          />
        </CardContent>
      </Card>

      {/* New Cycle Count SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Cycle Count"
        description="Schedule a new inventory cycle count"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Warehouse</label>
            <input className={INPUT_CLS} placeholder="Warehouse name" value={warehouse} onChange={(e) => setWarehouse(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Zone</label>
            <input className={INPUT_CLS} placeholder="e.g. Zone A, Zone B" value={zone} onChange={(e) => setZone(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Planned Date</label>
            <input className={INPUT_CLS} type="date" value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Items to Count</label>
            <input className={INPUT_CLS} type="number" placeholder="Number of items" value={itemsToCount} onChange={(e) => setItemsToCount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Assigned To</label>
            <input className={INPUT_CLS} placeholder="Person responsible" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
