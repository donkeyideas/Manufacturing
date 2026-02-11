import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge } from '@erp/ui';
import { getDepreciationSchedule } from '@erp/demo-data';
import { formatCurrency } from '@erp/shared';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import { type ColumnDef } from '@tanstack/react-table';

export default function DepreciationPage() {
  const { isDemo } = useAppMode();
  const schedule = useMemo(() => isDemo ? getDepreciationSchedule() : [], [isDemo]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'assetNumber',
        header: 'Asset #',
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.assetNumber}</span>
        ),
      },
      {
        accessorKey: 'assetName',
        header: 'Asset Name',
        cell: ({ row }) => (
          <p className="font-medium text-text-primary">{row.original.assetName}</p>
        ),
      },
      {
        accessorKey: 'depreciationDate',
        header: 'Depreciation Date',
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.depreciationDate)}</span>
        ),
      },
      {
        accessorKey: 'depreciationAmount',
        header: 'Depreciation Amount',
        cell: ({ row }) => (
          <span className="font-medium text-red-600">
            {formatCurrency(row.original.depreciationAmount)}
          </span>
        ),
      },
      {
        accessorKey: 'accumulatedDepreciation',
        header: 'Accumulated Depreciation',
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.accumulatedDepreciation)}
          </span>
        ),
      },
      {
        accessorKey: 'bookValue',
        header: 'Book Value',
        cell: ({ row }) => (
          <span className="font-medium text-green-600">
            {formatCurrency(row.original.bookValue)}
          </span>
        ),
      },
      {
        accessorKey: 'isPosted',
        header: 'Posted',
        cell: ({ row }) => (
          <Badge variant={row.original.isPosted ? 'success' : 'default'}>
            {row.original.isPosted ? 'Yes' : 'No'}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Depreciation Schedule</h1>
        <p className="text-xs text-text-muted">
          View and manage asset depreciation entries - {schedule.length} entries
        </p>
      </div>

      {/* Depreciation Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Depreciation Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={schedule} />
        </CardContent>
      </Card>
    </div>
  );
}
