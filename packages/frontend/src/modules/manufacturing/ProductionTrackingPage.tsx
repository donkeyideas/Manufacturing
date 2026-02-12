import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge } from '@erp/ui';
import type { ColumnDef } from '@tanstack/react-table';
import { useProductionTracking } from '../../data-layer/hooks/useManufacturing';

const STATUS_VARIANTS: Record<string, 'default' | 'info' | 'success' | 'danger' | 'warning' | 'primary'> = {
  planned: 'default',
  scheduled: 'default',
  released: 'warning',
  in_progress: 'primary',
  completed: 'success',
  closed: 'success',
  delayed: 'danger',
  cancelled: 'danger',
};

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
            variant={STATUS_VARIANTS[row.original.status] || 'default'}
          >
            {(row.original.status || '').replace('_', ' ')}
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
            {Number(row.original.quantityPlanned || 0).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'quantityCompleted',
        header: 'Qty Completed',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {Number(row.original.quantityCompleted || 0).toLocaleString()}
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

  const totalOrders = tracking.length;
  const inProgress = tracking.filter((t: any) => t.status === 'in_progress' || t.status === 'released').length;
  const completed = tracking.filter((t: any) => t.status === 'completed' || t.status === 'closed').length;
  const avgCompletion = totalOrders > 0
    ? Math.round(tracking.reduce((sum: number, t: any) => sum + (t.completionPercent || 0), 0) / totalOrders)
    : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Production Tracking</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Real-time production progress monitoring
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Orders</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{totalOrders.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">In Progress</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{inProgress.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Completed</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{completed.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Avg Completion</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{avgCompletion}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Production Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={tracking} searchable searchPlaceholder="Search..." pageSize={15} />
        </CardContent>
      </Card>
    </div>
  );
}
