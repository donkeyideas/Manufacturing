import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, DataTable, Button, Badge, SlideOver, Tabs, TabsList, TabsTrigger, TabsContent } from '@erp/ui';
import {
  useEDITransactions,
  useAcknowledgeEDI,
  useReprocessEDI,
} from '../../data-layer/hooks/useEDI';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Check } from 'lucide-react';
import { format } from 'date-fns';

const INPUT_CLS =
  'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const DOC_TYPE_LABELS: Record<string, string> = {
  '850': 'Purchase Order (850)',
  '855': 'PO Acknowledgment (855)',
  '810': 'Invoice (810)',
  '856': 'ASN (856)',
  '997': 'Func. Ack (997)',
};

const STATUS_BADGE: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
  completed: 'success',
  acknowledged: 'info',
  processing: 'warning',
  pending: 'default',
  failed: 'danger',
};

export default function TransactionsPage() {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDocType, setFilterDocType] = useState('');
  const [filterDirection, setFilterDirection] = useState('');

  const filters = useMemo(() => {
    const f: Record<string, string> = {};
    if (filterStatus) f.status = filterStatus;
    if (filterDocType) f.documentType = filterDocType;
    if (filterDirection) f.direction = filterDirection;
    return Object.keys(f).length > 0 ? f : undefined;
  }, [filterStatus, filterDocType, filterDirection]);

  const { data: transactions = [], isLoading } = useEDITransactions(filters);
  const { mutate: acknowledge, isPending: isAcking } = useAcknowledgeEDI();
  const { mutate: reprocess, isPending: isReprocessing } = useReprocessEDI();

  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const openDetail = (txn: any) => {
    setSelected(txn);
    setShowDetail(true);
  };

  const handleAcknowledge = () => {
    if (!selected) return;
    acknowledge(selected.id, {
      onSuccess: () => setShowDetail(false),
    });
  };

  const handleReprocess = () => {
    if (!selected) return;
    reprocess(selected.id, {
      onSuccess: () => setShowDetail(false),
    });
  };

  // Client-side filtering for demo mode (demo hook doesn't pass filters to API)
  const filteredData = useMemo(() => {
    let data = transactions as any[];
    if (filterStatus) data = data.filter((t) => t.status === filterStatus);
    if (filterDocType) data = data.filter((t) => t.documentType === filterDocType);
    if (filterDirection) data = data.filter((t) => t.direction === filterDirection);
    return data;
  }, [transactions, filterStatus, filterDocType, filterDirection]);

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'transactionNumber',
        header: 'Transaction #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.transactionNumber}</span>
        ),
      },
      {
        accessorKey: 'partnerName',
        header: 'Partner',
        cell: ({ row }) => (
          <span className="text-text-primary">{row.original.partnerName || '-'}</span>
        ),
      },
      {
        accessorKey: 'documentType',
        header: 'Doc Type',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {DOC_TYPE_LABELS[row.original.documentType] || row.original.documentType}
          </span>
        ),
      },
      {
        accessorKey: 'direction',
        header: 'Direction',
        cell: ({ row }) =>
          row.original.direction === 'inbound' ? (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <ArrowDownLeft className="h-3 w-3" /> Inbound
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> Outbound
            </span>
          ),
      },
      {
        accessorKey: 'format',
        header: 'Format',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary uppercase">{row.original.format}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE[row.original.status] || 'default'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'documentDate',
        header: 'Date',
        cell: ({ row }) => {
          const d = row.original.documentDate || row.original.createdAt;
          return (
            <span className="text-xs text-text-muted">
              {d ? format(new Date(d), 'MMM dd, yyyy') : '-'}
            </span>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <div className="h-6 w-40 bg-surface-2 animate-skeleton rounded" />
          <div className="h-3 w-64 bg-surface-2 animate-skeleton rounded mt-2" />
        </div>
        <Card>
          <CardContent>
            <div className="space-y-3 pt-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-surface-2 animate-skeleton rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">EDI Transactions</h1>
        <p className="text-xs text-text-muted">View and manage all inbound and outbound EDI transactions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className={INPUT_CLS + ' w-auto min-w-[140px]'} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="failed">Failed</option>
        </select>
        <select className={INPUT_CLS + ' w-auto min-w-[160px]'} value={filterDocType} onChange={(e) => setFilterDocType(e.target.value)}>
          <option value="">All Doc Types</option>
          <option value="850">850 - Purchase Order</option>
          <option value="855">855 - PO Ack</option>
          <option value="810">810 - Invoice</option>
          <option value="856">856 - ASN</option>
          <option value="997">997 - Func. Ack</option>
        </select>
        <select className={INPUT_CLS + ' w-auto min-w-[130px]'} value={filterDirection} onChange={(e) => setFilterDirection(e.target.value)}>
          <option value="">All Directions</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>
        {(filterStatus || filterDocType || filterDirection) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setFilterStatus('');
              setFilterDocType('');
              setFilterDirection('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredData}
            searchable
            searchPlaceholder="Search transactions..."
            pageSize={15}
            emptyMessage="No transactions found."
            onRowClick={openDetail}
          />
        </CardContent>
      </Card>

      {/* Detail SlideOver */}
      <SlideOver
        open={showDetail}
        onClose={() => { setShowDetail(false); setSelected(null); }}
        title={selected?.transactionNumber ?? 'Transaction Details'}
        description={selected?.partnerName ?? ''}
        width="lg"
        footer={
          <>
            {selected?.status === 'failed' && (
              <Button variant="secondary" onClick={handleReprocess} disabled={isReprocessing}>
                <RefreshCw className="h-4 w-4 mr-1" />
                {isReprocessing ? 'Reprocessing...' : 'Reprocess'}
              </Button>
            )}
            {selected?.status === 'completed' && selected?.direction === 'inbound' && (
              <Button variant="secondary" onClick={handleAcknowledge} disabled={isAcking}>
                <Check className="h-4 w-4 mr-1" />
                {isAcking ? 'Sending...' : 'Send 997 Ack'}
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="secondary" onClick={() => { setShowDetail(false); setSelected(null); }}>
              Close
            </Button>
          </>
        }
      >
        {selected && (
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="raw">Raw Content</TabsTrigger>
              {selected.errorMessage && <TabsTrigger value="errors">Errors</TabsTrigger>}
            </TabsList>

            <TabsContent value="details">
              <div className="space-y-4 pt-4">
                {[
                  { label: 'Transaction #', value: selected.transactionNumber },
                  { label: 'Partner', value: selected.partnerName },
                  {
                    label: 'Document Type',
                    value: DOC_TYPE_LABELS[selected.documentType] || selected.documentType,
                  },
                  { label: 'Direction', value: selected.direction },
                  { label: 'Format', value: selected.format?.toUpperCase() },
                  { label: 'Status', value: selected.status },
                  { label: 'Control Number', value: selected.controlNumber },
                  { label: 'AS2 Message ID', value: selected.as2MessageId },
                  {
                    label: 'Document Date',
                    value: selected.documentDate
                      ? format(new Date(selected.documentDate), 'MMM dd, yyyy')
                      : null,
                  },
                  {
                    label: 'Processed At',
                    value: selected.processedAt
                      ? format(new Date(selected.processedAt), 'MMM dd, yyyy HH:mm')
                      : null,
                  },
                  { label: 'Linked Sales Order', value: selected.salesOrderId },
                  { label: 'Linked Purchase Order', value: selected.purchaseOrderId },
                ].map((f) => (
                  <div key={f.label}>
                    <dt className="text-xs font-medium text-text-muted">{f.label}</dt>
                    <dd className="mt-0.5 text-sm text-text-primary">{f.value || '-'}</dd>
                  </div>
                ))}

                {selected.parsedContent && (
                  <div>
                    <dt className="text-xs font-medium text-text-muted mb-1">Parsed Content</dt>
                    <pre className="bg-surface-2 rounded-md p-3 text-xs font-mono text-text-primary overflow-auto max-h-64">
                      {typeof selected.parsedContent === 'string'
                        ? selected.parsedContent
                        : JSON.stringify(selected.parsedContent, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="raw">
              <div className="pt-4">
                {selected.rawContent ? (
                  <pre className="bg-surface-2 rounded-md p-3 text-xs font-mono text-text-primary overflow-auto max-h-96 whitespace-pre-wrap">
                    {selected.rawContent}
                  </pre>
                ) : (
                  <p className="text-xs text-text-muted py-4 text-center">No raw content available</p>
                )}
              </div>
            </TabsContent>

            {selected.errorMessage && (
              <TabsContent value="errors">
                <div className="space-y-3 pt-4">
                  <div className="rounded-md border border-danger/30 bg-danger/5 p-3">
                    <p className="text-sm font-medium text-danger">Error</p>
                    <p className="text-xs text-text-primary mt-1">{selected.errorMessage}</p>
                  </div>
                  {selected.errorDetails && (
                    <pre className="bg-surface-2 rounded-md p-3 text-xs font-mono text-text-primary overflow-auto max-h-48">
                      {typeof selected.errorDetails === 'string'
                        ? selected.errorDetails
                        : JSON.stringify(selected.errorDetails, null, 2)}
                    </pre>
                  )}
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </SlideOver>
    </div>
  );
}
