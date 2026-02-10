import { useMemo } from 'react';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { KPICard, Card, CardContent, DataTable, Badge } from '@erp/ui';
import { useDocumentQueue } from '../../data-layer/hooks/useAI';
import { format } from 'date-fns';
import type { ColumnDef } from '@tanstack/react-table';

const STATUS_BADGE: Record<string, { variant: 'warning' | 'info' | 'success' | 'danger'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  processing: { variant: 'info', label: 'Processing' },
  completed: { variant: 'success', label: 'Completed' },
  failed: { variant: 'danger', label: 'Failed' },
};

const FILE_TYPE_LABELS: Record<string, string> = {
  invoice: 'Invoice',
  purchase_order: 'Purchase Order',
  receipt: 'Receipt',
  shipping_label: 'Shipping Label',
};

export default function DocumentIntelligencePage() {
  const { data, isLoading } = useDocumentQueue();
  const documents = useMemo(() => data ?? [], [data]);

  // Derive KPIs from document queue data
  const kpis = useMemo(() => {
    const total = documents.length;
    const completed = documents.filter((d: any) => d.status === 'completed').length;
    const pending = documents.filter((d: any) => d.status === 'pending' || d.status === 'processing').length;
    const failed = documents.filter((d: any) => d.status === 'failed').length;
    const completedDocs = documents.filter((d: any) => d.status === 'completed' && d.confidence > 0);
    const avgConfidence = completedDocs.length > 0
      ? Math.round(completedDocs.reduce((sum: number, d: any) => sum + d.confidence, 0) / completedDocs.length)
      : 0;

    return { total, completed, pending, failed, avgConfidence };
  }, [documents]);

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'fileName',
        header: 'File Name',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary text-sm">
            {row.original.fileName}
          </span>
        ),
      },
      {
        accessorKey: 'fileType',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant="default">
            {FILE_TYPE_LABELS[row.original.fileType] || row.original.fileType}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const info = STATUS_BADGE[row.original.status];
          return (
            <Badge variant={info?.variant || 'default'}>
              {info?.label || row.original.status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'extractedFields',
        header: 'Fields Extracted',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.extractedFields}
          </span>
        ),
      },
      {
        accessorKey: 'confidence',
        header: 'Confidence',
        cell: ({ row }) => {
          const confidence = row.original.confidence;
          const color =
            confidence >= 90
              ? 'text-emerald-600'
              : confidence >= 70
              ? 'text-amber-600'
              : confidence > 0
              ? 'text-red-600'
              : 'text-text-muted';
          const bgColor =
            confidence >= 90
              ? 'bg-emerald-500'
              : confidence >= 70
              ? 'bg-amber-500'
              : confidence > 0
              ? 'bg-red-500'
              : 'bg-gray-300';

          return (
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${bgColor}`} />
              <span className={`text-sm font-medium ${color}`}>
                {confidence > 0 ? `${confidence}%` : '-'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'uploadedBy',
        header: 'Uploaded By',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.uploadedBy}
          </span>
        ),
      },
      {
        accessorKey: 'uploadedAt',
        header: 'Uploaded At',
        cell: ({ row }) => (
          <span className="text-sm text-text-muted">
            {format(new Date(row.original.uploadedAt), 'MMM dd, h:mm a')}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Document Intelligence</h1>
        <p className="text-xs text-text-muted mt-0.5">
          AI-powered document processing and data extraction
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Documents Processed"
          value={String(kpis.completed)}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <KPICard
          label="Pending"
          value={String(kpis.pending)}
          icon={<Clock className="h-4 w-4" />}
        />
        <KPICard
          label="Avg Confidence"
          value={`${kpis.avgConfidence}%`}
          icon={<FileText className="h-4 w-4" />}
        />
        <KPICard
          label="Failed"
          value={String(kpis.failed)}
          icon={<XCircle className="h-4 w-4" />}
        />
      </div>

      {/* Document Queue Table */}
      <Card>
        <CardContent className="p-4">
          <DataTable
            columns={columns}
            data={documents}
            searchable
            searchPlaceholder="Search documents..."
            pageSize={10}
            emptyMessage="No documents in queue."
          />
        </CardContent>
      </Card>
    </div>
  );
}
