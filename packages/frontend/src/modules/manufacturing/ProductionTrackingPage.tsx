import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge } from '@erp/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { useProductionTracking } from '../../data-layer/hooks/useManufacturing';

const STATUS_VARIANTS = {
  scheduled: 'default',
  in_progress: 'info',
  completed: 'success',
  delayed: 'danger',
} as const;

export default function ProductionTrackingPage() {
  const { data: tracking = [] } = useProductionTracking();

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'workOrderNumber',
        header: 'Work Order',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.workOrderNumber}
          </span>
        ),
      },
      {
        accessorKey: 'productName',
        header: 'Product',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.productName}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              STATUS_VARIANTS[row.original.status as keyof typeof STATUS_VARIANTS]
            }
          >
            {row.original.status.replace('_', ' ')}
          </Badge>
        ),
      },
      {
        accessorKey: 'currentStep',
        header: 'Current Step',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.currentStep}
          </span>
        ),
      },
      {
        accessorKey: 'completionPercent',
        header: 'Progress',
        cell: ({ row }) => (
          <div className="min-w-[120px] space-y-1">
            <div className="text-xs text-text-primary">{row.original.completionPercent}%</div>
            <div className="w-full bg-surface-2 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${row.original.completionPercent}%` }}
              />
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'quantityPlanned',
        header: 'Qty Planned',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.quantityPlanned}
          </span>
        ),
      },
      {
        accessorKey: 'quantityCompleted',
        header: 'Qty Completed',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.quantityCompleted}
          </span>
        ),
      },
      {
        accessorKey: 'quantityScrap',
        header: 'Scrap',
        cell: ({ row }) => (
          <span className={`text-xs ${row.original.quantityScrap > 0 ? 'text-red-500' : 'text-text-secondary'}`}>
            {row.original.quantityScrap}
          </span>
        ),
      },
      {
        accessorKey: 'operator',
        header: 'Operator',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.operator ?? '—'}
          </span>
        ),
      },
      {
        accessorKey: 'workCenter',
        header: 'Work Center',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.workCenter}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Production Tracking</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Real-time production progress monitoring
        </p>
      </div>

      {/* Production Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Production Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={tracking} />
        </CardContent>
      </Card>
    </div>
  );
}
