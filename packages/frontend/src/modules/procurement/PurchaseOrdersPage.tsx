import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, DataTable, Button, Badge, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, purchaseOrderImportSchema, validateRow, coerceRow } from '@erp/shared';
import { usePurchaseOrders, useCreatePurchaseOrder, useDeletePurchaseOrder, useImportPurchaseOrders } from '../../data-layer/hooks/useProcurement';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import { Upload, Plus } from 'lucide-react';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'sent', label: 'Sent' },
  { value: 'received', label: 'Received' },
  { value: 'closed', label: 'Closed' },
];

interface POFormState {
  vendor: string;
  poDate: string;
  deliveryDate: string;
  status: string;
  notes: string;
  totalAmount: string;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM: POFormState = {
  vendor: '',
  poDate: todayISO(),
  deliveryDate: '',
  status: 'draft',
  notes: '',
  totalAmount: '',
};

export default function PurchaseOrdersPage() {
  const { isDemo } = useAppMode();
  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders();
  const { mutate: createPurchaseOrder, isPending: isCreating } = useCreatePurchaseOrder();
  const { mutate: deletePurchaseOrder, isPending: isDeleting } = useDeletePurchaseOrder();
  const { mutate: importPurchaseOrders } = useImportPurchaseOrders();

  // SlideOver state
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  // Form state
  const [form, setForm] = useState<POFormState>(EMPTY_FORM);

  const resetForm = () => setForm({ ...EMPTY_FORM, poDate: todayISO() });

  const setField = <K extends keyof POFormState>(key: K, value: POFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // -- Handlers --

  const handleCreate = () => {
    createPurchaseOrder(
      {
        vendorName: form.vendor,
        orderDate: form.poDate,
        deliveryDate: form.deliveryDate,
        totalAmount: parseFloat(form.totalAmount) || 0,
        status: form.status,
        notes: form.notes,
        orderType: 'standard',
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          resetForm();
        },
      },
    );
  };

  const handleDelete = () => {
    if (!selectedPO) return;
    if (!window.confirm(`Delete purchase order "${selectedPO.poNumber}"? This action cannot be undone.`)) return;
    deletePurchaseOrder(selectedPO.id, {
      onSuccess: () => {
        setShowView(false);
        setSelectedPO(null);
      },
    });
  };

  const openView = (po: any) => {
    setSelectedPO(po);
    setShowView(true);
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  // -- Status helpers --

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

  // -- Columns --

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'poNumber',
        header: 'PO #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.poNumber}</span>
        ),
      },
      {
        accessorKey: 'orderDate',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.orderDate ? new Date(row.original.orderDate).toLocaleDateString() : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'vendorName',
        header: 'Vendor',
        cell: ({ row }) => (
          <span className="text-text-primary">{row.original.vendorName || '-'}</span>
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total Amount',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.totalAmount != null
              ? formatCurrency(Number(row.original.totalAmount))
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'deliveryDate',
        header: 'Delivery Date',
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {row.original.deliveryDate ? new Date(row.original.deliveryDate).toLocaleDateString() : '-'}
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
    ],
    [],
  );

  // -- Shared form fields renderer --

  const renderFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Vendor</label>
        <input
          className={INPUT_CLS}
          placeholder="Vendor name"
          value={form.vendor}
          onChange={(e) => setField('vendor', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">PO Date</label>
        <input
          className={INPUT_CLS}
          type="date"
          value={form.poDate}
          onChange={(e) => setField('poDate', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Delivery Date</label>
        <input
          className={INPUT_CLS}
          type="date"
          value={form.deliveryDate}
          onChange={(e) => setField('deliveryDate', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
        <select
          className={INPUT_CLS}
          value={form.status}
          onChange={(e) => setField('status', e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Total Amount ($)</label>
        <input
          className={INPUT_CLS}
          type="number"
          placeholder="0.00"
          value={form.totalAmount}
          onChange={(e) => setField('totalAmount', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
        <textarea
          className={INPUT_CLS}
          rows={3}
          placeholder="Additional notes..."
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
        />
      </div>
    </div>
  );

  // -- View detail fields renderer --

  const renderViewFields = () => {
    if (!selectedPO) return null;
    const po = selectedPO;
    const fields = [
      { label: 'PO Number', value: po.poNumber },
      { label: 'Vendor', value: po.vendorName },
      {
        label: 'PO Date',
        value: po.orderDate ? new Date(po.orderDate).toLocaleDateString() : '-',
      },
      {
        label: 'Delivery Date',
        value: po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString() : '-',
      },
      { label: 'Status', value: formatStatus(po.status || '') },
      {
        label: 'Total Amount',
        value: po.totalAmount != null ? formatCurrency(Number(po.totalAmount)) : '-',
      },
      { label: 'Notes', value: po.notes || po.description },
    ];

    return (
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.label}>
            <dt className="text-xs font-medium text-text-muted">{f.label}</dt>
            <dd className="mt-0.5 text-sm text-text-primary">{f.value || '-'}</dd>
          </div>
        ))}
      </div>
    );
  };

  // -- Loading skeleton --

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-40 bg-surface-100 animate-pulse rounded"></div>
            <div className="h-4 w-72 bg-surface-100 animate-pulse rounded mt-2"></div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-surface-100 animate-pulse rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-surface-100 animate-pulse rounded"></div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            Purchase Orders
          </h1>
          <p className="text-xs text-text-muted">
            Manage purchase orders and track delivery status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New PO
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total POs</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{purchaseOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Open POs</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {purchaseOrders.filter((po: any) => !['closed', 'cancelled', 'received'].includes(po.status)).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Spend</p>
              <p className="text-lg font-bold text-brand-600 mt-2">
                {formatCurrency(purchaseOrders.reduce((sum: number, po: any) => sum + Number(po.totalAmount ?? 0), 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Avg PO Value</p>
              <p className="text-lg font-bold text-brand-600 mt-2">
                {purchaseOrders.length > 0
                  ? formatCurrency(purchaseOrders.reduce((sum: number, po: any) => sum + Number(po.totalAmount ?? 0), 0) / purchaseOrders.length)
                  : formatCurrency(0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(purchaseOrders, 'purchase-orders')}
              onExportExcel={() => exportToExcel(purchaseOrders, 'purchase-orders')}
            />
          </div>
          <DataTable
            columns={columns}
            data={purchaseOrders}
            searchable
            searchPlaceholder="Search purchase orders..."
            pageSize={15}
            emptyMessage="No purchase orders found."
            onRowClick={openView}
          />
        </CardContent>
      </Card>

      {/* View PO SlideOver */}
      <SlideOver
        open={showView}
        onClose={() => { setShowView(false); setSelectedPO(null); }}
        title={selectedPO?.poNumber ?? 'Purchase Order Details'}
        description={selectedPO?.vendorName ?? ''}
        width="md"
        footer={
          <>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" onClick={() => { setShowView(false); setSelectedPO(null); }}>
              Close
            </Button>
          </>
        }
      >
        {renderViewFields()}
      </SlideOver>

      {/* Create PO SlideOver */}
      <SlideOver
        open={showCreate}
        onClose={() => { setShowCreate(false); resetForm(); }}
        title="New Purchase Order"
        description="Create a new purchase order"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowCreate(false); resetForm(); }} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        {renderFormFields()}
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={purchaseOrderImportSchema}
        onParseFile={parseFile}
        onAutoMap={autoMapColumns}
        onValidateRows={(rows, mappings, schema) => {
          const validData: Record<string, unknown>[] = [];
          const errors: any[] = [];
          rows.forEach((row, i) => {
            const mapped: Record<string, string> = {};
            mappings.forEach((m) => {
              if (m.targetField && m.sourceColumn) {
                mapped[m.targetField] = row[m.sourceColumn] || '';
              }
            });
            const coerced = coerceRow(mapped, schema);
            const rowErrors = validateRow(coerced, schema);
            if (rowErrors.length > 0) {
              errors.push(...rowErrors.map((e) => ({ ...e, row: i + 2 })));
            } else {
              validData.push(coerced);
            }
          });
          return { validData, errors };
        }}
        onImport={async (data) => {
          if (isDemo) {
            return { success: data.length, errors: [] };
          }
          return new Promise((resolve) => {
            importPurchaseOrders(data, {
              onSuccess: (result: any) => {
                resolve({ success: result?.successCount ?? data.length, errors: result?.errors ?? [] });
              },
              onError: () => {
                resolve({ success: 0, errors: [{ row: 0, field: '', value: '', code: 'INVALID_TYPE' as const, message: 'Import failed' }] });
              },
            });
          });
        }}
        onDownloadTemplate={() => downloadTemplate(purchaseOrderImportSchema)}
      />
    </div>
  );
}
