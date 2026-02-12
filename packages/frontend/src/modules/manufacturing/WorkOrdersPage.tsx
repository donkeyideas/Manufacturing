import { useMemo, useState } from 'react';
import { Plus, Upload, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, DataTable, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import {
  useWorkOrders,
  useCreateWorkOrder,
  useUpdateWorkOrder,
  useDeleteWorkOrder,
  useImportWorkOrders,
} from '../../data-layer/hooks/useManufacturing';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import { workOrderImportSchema, validateRow, coerceRow } from '@erp/shared';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';
import GLAccountStrip from '../../components/GLAccountStrip';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const PRIORITY_BADGES: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'danger' }> = {
  low: { label: 'Low', variant: 'default' },
  normal: { label: 'Normal', variant: 'info' },
  high: { label: 'High', variant: 'warning' },
  urgent: { label: 'Urgent', variant: 'danger' },
};

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'released', label: 'Released' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
];

const STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'info' | 'primary' | 'success' | 'warning' }> = {
  planned: { label: 'Planned', variant: 'default' },
  released: { label: 'Released', variant: 'info' },
  in_progress: { label: 'In Progress', variant: 'primary' },
  completed: { label: 'Completed', variant: 'success' },
  closed: { label: 'Closed', variant: 'default' },
};

type SlideOverMode = 'closed' | 'view' | 'create' | 'edit';

export default function WorkOrdersPage() {
  const { data: workOrders = [], isLoading } = useWorkOrders();
  const { mutate: createWorkOrder, isPending: isCreating } = useCreateWorkOrder();
  const { mutate: updateWorkOrder, isPending: isUpdating } = useUpdateWorkOrder();
  const { mutate: deleteWorkOrder, isPending: isDeleting } = useDeleteWorkOrder();
  const { mutateAsync: importWorkOrders } = useImportWorkOrders();
  const { isDemo } = useAppMode();

  // SlideOver state
  const [mode, setMode] = useState<SlideOverMode>('closed');
  const [showImport, setShowImport] = useState(false);
  const [selectedWO, setSelectedWO] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [itemId, setItemId] = useState('');
  const [quantityOrdered, setQuantityOrdered] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [priority, setPriority] = useState('normal');
  const [status, setStatus] = useState('planned');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setItemId('');
    setQuantityOrdered('');
    setPlannedStartDate('');
    setPlannedEndDate('');
    setPriority('normal');
    setStatus('planned');
    setNotes('');
  };

  const populateForm = (wo: any) => {
    setItemId(wo.finishedItemNumber || wo.itemId || '');
    setQuantityOrdered(wo.quantityOrdered != null ? String(wo.quantityOrdered) : '');
    setPlannedStartDate(wo.startDate ? wo.startDate.split('T')[0] : '');
    setPlannedEndDate(wo.dueDate ? wo.dueDate.split('T')[0] : '');
    setPriority(wo.priority || 'normal');
    setStatus(wo.status || 'planned');
    setNotes(wo.notes || '');
  };

  const openCreate = () => {
    resetForm();
    setSelectedWO(null);
    setMode('create');
  };

  const openView = (wo: any) => {
    setSelectedWO(wo);
    setMode('view');
  };

  const openEdit = () => {
    if (!selectedWO) return;
    populateForm(selectedWO);
    setMode('edit');
  };

  const closeSlideOver = () => {
    setMode('closed');
    setSelectedWO(null);
    setShowDeleteConfirm(false);
    resetForm();
  };

  const handleCreate = () => {
    createWorkOrder(
      {
        itemId: itemId.trim(),
        quantityOrdered: Number(quantityOrdered) || 1,
        startDate: plannedStartDate || new Date().toISOString().split('T')[0],
        dueDate: plannedEndDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority,
        status,
        notes: notes || undefined,
      },
      { onSuccess: closeSlideOver },
    );
  };

  const handleUpdate = () => {
    if (!selectedWO) return;
    updateWorkOrder(
      {
        id: selectedWO.id,
        itemId: itemId.trim(),
        quantityOrdered: Number(quantityOrdered) || 1,
        startDate: plannedStartDate || undefined,
        dueDate: plannedEndDate || undefined,
        priority,
        status,
        notes: notes || undefined,
      },
      { onSuccess: closeSlideOver },
    );
  };

  const handleDelete = () => {
    if (!selectedWO) return;
    deleteWorkOrder(selectedWO.id, { onSuccess: closeSlideOver });
  };

  // ── Table columns ──
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'workOrderNumber',
        header: 'WO #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.workOrderNumber}
          </span>
        ),
      },
      {
        accessorKey: 'finishedItemNumber',
        header: 'Item',
        cell: ({ row }) => (
          <div className="min-w-[180px]">
            <p className="text-sm text-text-primary">
              {row.original.finishedItemName || row.original.finishedItemNumber || '-'}
            </p>
            {row.original.finishedItemName && row.original.finishedItemNumber && (
              <p className="text-2xs text-text-muted">{row.original.finishedItemNumber}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'quantityOrdered',
        header: 'Qty Ordered',
        cell: ({ row }) => (
          <span className="text-sm text-text-primary">
            {Number(row.original.quantityOrdered || 0).toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.startDate
              ? new Date(row.original.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.dueDate
              ? new Date(row.original.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => {
          const info = PRIORITY_BADGES[row.original.priority];
          return info ? (
            <Badge variant={info.variant}>{info.label}</Badge>
          ) : (
            <span className="text-sm text-text-muted">{row.original.priority}</span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const info = STATUS_BADGES[row.original.status];
          return info ? (
            <Badge variant={info.variant}>{info.label}</Badge>
          ) : (
            <span className="text-sm text-text-muted">{row.original.status}</span>
          );
        },
      },
    ],
    [],
  );

  // ── Detail row helper ──
  const detailRow = (label: string, value: React.ReactNode) => (
    <div key={label} className="flex items-start justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm text-text-primary text-right max-w-[60%]">{value ?? '-'}</span>
    </div>
  );

  // ── Form fields (shared between create & edit) ──
  const renderForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Item Number *</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. FG-1001"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Quantity Ordered *</label>
        <input
          className={INPUT_CLS}
          type="number"
          min="1"
          placeholder="100"
          value={quantityOrdered}
          onChange={(e) => setQuantityOrdered(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Planned Start Date</label>
          <input
            className={INPUT_CLS}
            type="date"
            value={plannedStartDate}
            onChange={(e) => setPlannedStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Planned End Date</label>
          <input
            className={INPUT_CLS}
            type="date"
            value={plannedEndDate}
            onChange={(e) => setPlannedEndDate(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Priority</label>
        <select className={INPUT_CLS} value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
        <select className={INPUT_CLS} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
        <textarea
          className={INPUT_CLS}
          rows={3}
          placeholder="Optional notes or instructions"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-surface-2 animate-skeleton" />
        <div className="h-3 w-72 rounded bg-surface-2 animate-skeleton" />
        <div className="h-64 rounded-lg border border-border bg-surface-1 animate-skeleton mt-4" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Work Orders</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage production work orders and track progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Work Order
          </Button>
        </div>
      </div>

      {/* GL Account Links */}
      <GLAccountStrip module="work-orders" />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Work Orders</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{workOrders.length.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Active</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {workOrders.filter((wo: any) => ['released', 'in_progress'].includes(wo.status)).length.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Completed</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {workOrders.filter((wo: any) => ['completed', 'closed'].includes(wo.status)).length.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Planned</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {workOrders.filter((wo: any) => wo.status === 'planned').length.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders Table */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(workOrders, 'work-orders')}
              onExportExcel={() => exportToExcel(workOrders, 'work-orders')}
            />
          </div>
          <DataTable
            columns={columns}
            data={workOrders}
            searchable
            searchPlaceholder="Search by WO number or item..."
            pageSize={15}
            emptyMessage="No work orders found."
            onRowClick={openView}
          />
        </CardContent>
      </Card>

      {/* ── View Work Order SlideOver ── */}
      <SlideOver
        open={mode === 'view'}
        onClose={closeSlideOver}
        title={selectedWO?.workOrderNumber ?? 'Work Order Details'}
        description={selectedWO?.finishedItemName || selectedWO?.finishedItemNumber || ''}
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeSlideOver}>Close</Button>
            <Button variant="primary" onClick={openEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {!showDeleteConfirm ? (
              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            ) : (
              <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            )}
          </>
        }
      >
        {selectedWO && (
          <div>
            {detailRow('Work Order #', selectedWO.workOrderNumber)}
            {detailRow('Item Number', selectedWO.finishedItemNumber || '-')}
            {detailRow('Item Name', selectedWO.finishedItemName || '-')}
            {detailRow('BOM Number', selectedWO.bomNumber || '-')}
            {detailRow('Quantity Ordered', selectedWO.quantityOrdered)}
            {detailRow('Quantity Completed', selectedWO.quantityCompleted ?? '-')}
            {detailRow(
              'Start Date',
              selectedWO.startDate
                ? new Date(selectedWO.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-',
            )}
            {detailRow(
              'Due Date',
              selectedWO.dueDate
                ? new Date(selectedWO.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-',
            )}
            {detailRow(
              'Priority',
              (() => {
                const info = PRIORITY_BADGES[selectedWO.priority];
                return info ? <Badge variant={info.variant}>{info.label}</Badge> : (selectedWO.priority || '-');
              })(),
            )}
            {detailRow(
              'Status',
              (() => {
                const info = STATUS_BADGES[selectedWO.status];
                return info ? <Badge variant={info.variant}>{info.label}</Badge> : (selectedWO.status || '-');
              })(),
            )}
            {detailRow('Notes', selectedWO.notes || '-')}
          </div>
        )}
      </SlideOver>

      {/* ── Create Work Order SlideOver ── */}
      <SlideOver
        open={mode === 'create'}
        onClose={closeSlideOver}
        title="New Work Order"
        description="Create a new manufacturing work order"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeSlideOver}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isCreating || !itemId.trim()}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        {renderForm()}
      </SlideOver>

      {/* ── Edit Work Order SlideOver ── */}
      <SlideOver
        open={mode === 'edit'}
        onClose={closeSlideOver}
        title="Edit Work Order"
        description={`Editing ${selectedWO?.workOrderNumber ?? ''}`}
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeSlideOver}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isUpdating || !itemId.trim()}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        {renderForm()}
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={workOrderImportSchema}
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
          const result = await importWorkOrders(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(workOrderImportSchema)}
      />
    </div>
  );
}
