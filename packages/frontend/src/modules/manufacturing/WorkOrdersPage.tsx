import { useMemo, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver, cn, ImportWizard, ExportButton } from '@erp/ui';
import { getWorkOrders } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';
import { workOrderImportSchema, validateRow, coerceRow } from '@erp/shared';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const STATUS_VARIANTS = {
  pending: 'default',
  released: 'info',
  in_progress: 'primary',
  completed: 'success',
  closed: 'default',
  cancelled: 'danger',
} as const;

const PRIORITY_COLORS = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
  5: 'bg-gray-500',
} as const;

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState(() => getWorkOrders());
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Form fields
  const [woNumber, setWoNumber] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('3');
  const [workCenter, setWorkCenter] = useState('');

  const resetForm = () => {
    setWoNumber('');
    setProduct('');
    setQuantity('');
    setStartDate('');
    setDueDate('');
    setPriority('3');
    setWorkCenter('');
  };

  const handleSubmit = () => {
    const id = `WO-${String(workOrders.length + 900).padStart(3, '0')}`;
    const newOrder = {
      id,
      workOrderNumber: woNumber || id,
      finishedItemName: product || 'New Product',
      finishedItemNumber: `PROD-${String(workOrders.length + 100).padStart(3, '0')}`,
      workOrderType: 'standard',
      quantityOrdered: Number(quantity) || 1,
      quantityCompleted: 0,
      startDate: startDate || '2024-12-15',
      dueDate: dueDate || '2024-12-30',
      priority: Number(priority) || 3,
      status: 'pending' as const,
      workCenter: workCenter || 'WC-001',
    };
    setWorkOrders([newOrder as any, ...workOrders]);
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = useMemo(
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
        accessorKey: 'finishedItemName',
        header: 'Product',
        cell: ({ row }) => (
          <div className="min-w-[200px]">
            <div className="text-xs font-medium text-text-primary">
              {row.original.finishedItemName}
            </div>
            <div className="text-2xs text-text-muted">
              {row.original.finishedItemNumber}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'workOrderType',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary capitalize">
            {row.original.workOrderType}
          </span>
        ),
      },
      {
        accessorKey: 'quantityOrdered',
        header: 'Qty Ordered',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.quantityOrdered}
          </span>
        ),
      },
      {
        accessorKey: 'quantityCompleted',
        header: 'Qty Completed',
        cell: ({ row }) => {
          const progress =
            (row.original.quantityCompleted / row.original.quantityOrdered) * 100;
          return (
            <div className="min-w-[120px] space-y-1">
              <div className="text-xs text-text-primary">
                {row.original.quantityCompleted} / {row.original.quantityOrdered}
              </div>
              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {new Date(row.original.startDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {new Date(row.original.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                PRIORITY_COLORS[row.original.priority as keyof typeof PRIORITY_COLORS]
              )}
            />
            <span className="text-xs text-text-secondary">{row.original.priority}</span>
          </div>
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
    ],
    []
  );

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
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Work Order
          </Button>
        </div>
      </div>

      {/* Work Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(workOrders, 'work-orders')}
              onExportExcel={() => exportToExcel(workOrders, 'work-orders')}
            />
          </div>
          <DataTable columns={columns} data={workOrders} />
        </CardContent>
      </Card>

      {/* New Work Order SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Work Order"
        description="Create a new manufacturing work order"
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
            <label className="block text-xs font-medium text-text-secondary mb-1">WO Number</label>
            <input className={INPUT_CLS} placeholder="e.g. WO-100" value={woNumber} onChange={e => setWoNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product</label>
            <input className={INPUT_CLS} placeholder="Product name" value={product} onChange={e => setProduct(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Quantity</label>
            <input className={INPUT_CLS} type="number" min="1" placeholder="100" value={quantity} onChange={e => setQuantity(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Start Date</label>
              <input className={INPUT_CLS} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Due Date</label>
              <input className={INPUT_CLS} type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Priority</label>
            <select className={INPUT_CLS} value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="1">1 - Critical</option>
              <option value="2">2 - High</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - Low</option>
              <option value="5">5 - Minimal</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Work Center</label>
            <input className={INPUT_CLS} placeholder="e.g. WC-001" value={workCenter} onChange={e => setWorkCenter(e.target.value)} />
          </div>
        </div>
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
            mappings.forEach(m => {
              if (m.targetField && m.sourceColumn) {
                mapped[m.targetField] = row[m.sourceColumn] || '';
              }
            });
            const coerced = coerceRow(mapped, schema);
            const rowErrors = validateRow(coerced, schema);
            if (rowErrors.length > 0) {
              errors.push(...rowErrors.map(e => ({ ...e, row: i + 2 })));
            } else {
              validData.push(coerced);
            }
          });
          return { validData, errors };
        }}
        onImport={async (data) => {
          const newWorkOrders = data.map((row, i) => ({
            id: `import-${Date.now()}-${i}`,
            tenantId: 'tenant-demo',
            ...row,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'import',
          }));
          setWorkOrders((prev: any[]) => [...newWorkOrders, ...prev]);
          return { success: data.length, errors: [] };
        }}
        onDownloadTemplate={() => downloadTemplate(workOrderImportSchema)}
      />
    </div>
  );
}
