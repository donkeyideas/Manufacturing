import { useMemo, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { getRoutings } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';
import { routingImportSchema, validateRow, coerceRow } from '@erp/shared';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const STATUS_VARIANTS = {
  active: 'success',
  draft: 'default',
} as const;

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function RoutingsPage() {
  const [routings, setRoutings] = useState(() => getRoutings());
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Form fields
  const [productName, setProductName] = useState('');
  const [operationName, setOperationName] = useState('');
  const [workCenter, setWorkCenter] = useState('');
  const [setupTime, setSetupTime] = useState('');
  const [runTime, setRunTime] = useState('');
  const [sequence, setSequence] = useState('');

  const resetForm = () => {
    setProductName('');
    setOperationName('');
    setWorkCenter('');
    setSetupTime('');
    setRunTime('');
    setSequence('');
  };

  const handleSubmit = () => {
    const id = `RTG-${String(routings.length + 900).padStart(3, '0')}`;
    const totalMin = (Number(setupTime) || 0) + (Number(runTime) || 0);
    const newRouting = {
      id,
      routingNumber: id,
      routingName: operationName || 'New Routing',
      productName: productName || 'New Product',
      version: 1,
      status: 'active' as const,
      totalSteps: 1,
      totalTimeMinutes: totalMin,
      workCenter: workCenter || 'WC-001',
      setupTime: Number(setupTime) || 0,
      runTime: Number(runTime) || 0,
      sequence: Number(sequence) || 1,
    };
    setRoutings([newRouting as any, ...routings]);
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'routingNumber',
        header: 'Routing #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.routingNumber}
          </span>
        ),
      },
      {
        accessorKey: 'routingName',
        header: 'Routing Name',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.routingName}
          </span>
        ),
      },
      {
        accessorKey: 'productName',
        header: 'Product',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.productName}
          </span>
        ),
      },
      {
        accessorKey: 'version',
        header: 'Version',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">v{row.original.version}</span>
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
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'totalSteps',
        header: 'Steps',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">{row.original.totalSteps}</span>
        ),
      },
      {
        accessorKey: 'totalTimeMinutes',
        header: 'Total Time',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {formatTime(row.original.totalTimeMinutes)}
          </span>
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
          <h1 className="text-lg font-semibold text-text-primary">Routings</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Define step-by-step production processes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Routing
          </Button>
        </div>
      </div>

      {/* Routings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Routings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(routings, 'routings')}
              onExportExcel={() => exportToExcel(routings, 'routings')}
            />
          </div>
          <DataTable columns={columns} data={routings} />
        </CardContent>
      </Card>

      {/* New Routing SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Routing"
        description="Define a new production routing"
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Product</label>
            <input className={INPUT_CLS} placeholder="Product name" value={productName} onChange={e => setProductName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Operation Name</label>
            <input className={INPUT_CLS} placeholder="e.g. Assembly Line A" value={operationName} onChange={e => setOperationName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Work Center</label>
            <input className={INPUT_CLS} placeholder="e.g. WC-001" value={workCenter} onChange={e => setWorkCenter(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Setup Time (min)</label>
              <input className={INPUT_CLS} type="number" min="0" placeholder="15" value={setupTime} onChange={e => setSetupTime(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Run Time (min)</label>
              <input className={INPUT_CLS} type="number" min="0" placeholder="45" value={runTime} onChange={e => setRunTime(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Sequence</label>
            <input className={INPUT_CLS} type="number" min="1" placeholder="1" value={sequence} onChange={e => setSequence(e.target.value)} />
          </div>
        </div>
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={routingImportSchema}
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
          const newRoutings = data.map((row, i) => ({
            id: `import-${Date.now()}-${i}`,
            tenantId: 'tenant-demo',
            ...row,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'import',
          }));
          setRoutings((prev: any[]) => [...newRoutings, ...prev]);
          return { success: data.length, errors: [] };
        }}
        onDownloadTemplate={() => downloadTemplate(routingImportSchema)}
      />
    </div>
  );
}
