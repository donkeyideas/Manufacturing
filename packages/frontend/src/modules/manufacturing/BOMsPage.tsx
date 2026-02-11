import { useMemo, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { useBOMs, useCreateBOM, useImportBOMs } from '../../data-layer/hooks/useManufacturing';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import { bomImportSchema, validateRow, coerceRow } from '@erp/shared';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const BOM_TYPE_VARIANTS = {
  standard: 'default',
  phantom: 'warning',
  engineering: 'info',
  manufacturing: 'primary',
} as const;

export default function BOMsPage() {
  const { data: boms = [], isLoading } = useBOMs();
  const { mutate: createBOM, isPending: isCreating } = useCreateBOM();
  const { mutateAsync: importBOMs } = useImportBOMs();
  const { isDemo } = useAppMode();

  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Form fields
  const [productName, setProductName] = useState('');
  const [bomName, setBomName] = useState('');
  const [version, setVersion] = useState('1');
  const [components, setComponents] = useState('');
  const [status, setStatus] = useState('standard');

  const resetForm = () => {
    setProductName('');
    setBomName('');
    setVersion('1');
    setComponents('');
    setStatus('standard');
  };

  const handleSubmit = () => {
    const componentList = components
      ? components.split('\n').filter(Boolean).map((c, i) => ({
          id: `LINE-${i + 1}`,
          itemName: c.trim(),
          quantity: 1,
        }))
      : [{ id: 'LINE-1', itemName: 'Default Component', quantity: 1 }];

    createBOM(
      {
        bomNumber: `BOM-${String(Date.now()).slice(-4)}`,
        finishedItemName: productName || 'New Product',
        finishedItemNumber: `PROD-${String(Date.now()).slice(-4)}`,
        bomType: status as 'standard' | 'phantom' | 'engineering' | 'manufacturing',
        version: Number(version) || 1,
        lines: componentList,
        isActive: true,
        bomName: bomName || 'New BOM',
      },
      {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      }
    );
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'bomNumber',
        header: 'BOM #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.bomNumber}
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
        accessorKey: 'bomType',
        header: 'Type',
        cell: ({ row }) => (
          <Badge
            variant={
              BOM_TYPE_VARIANTS[row.original.bomType as keyof typeof BOM_TYPE_VARIANTS]
            }
          >
            {row.original.bomType}
          </Badge>
        ),
      },
      {
        accessorKey: 'version',
        header: 'Version',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">{row.original.version}</span>
        ),
      },
      {
        accessorKey: 'lines',
        header: 'Components',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.lines.length} items
          </span>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                row.original.isActive ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            />
            <span className="text-xs text-text-secondary">
              {row.original.isActive ? 'Yes' : 'No'}
            </span>
          </div>
        ),
      },
    ],
    []
  );

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
          <h1 className="text-lg font-semibold text-text-primary">Bills of Materials</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Define product structures and component requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New BOM
          </Button>
        </div>
      </div>

      {/* BOMs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All BOMs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(boms, 'boms')}
              onExportExcel={() => exportToExcel(boms, 'boms')}
            />
          </div>
          <DataTable columns={columns} data={boms} />
        </CardContent>
      </Card>

      {/* New BOM SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New BOM"
        description="Create a new bill of materials"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Product</label>
            <input className={INPUT_CLS} placeholder="Product name" value={productName} onChange={e => setProductName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">BOM Name</label>
            <input className={INPUT_CLS} placeholder="BOM name" value={bomName} onChange={e => setBomName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Version</label>
            <input className={INPUT_CLS} type="number" min="1" placeholder="1" value={version} onChange={e => setVersion(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Components (one per line)</label>
            <textarea className={INPUT_CLS + ' min-h-[80px]'} placeholder="Steel Plate&#10;Bolts M10&#10;Gasket Ring" rows={4} value={components} onChange={e => setComponents(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Type</label>
            <select className={INPUT_CLS} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="standard">Standard</option>
              <option value="phantom">Phantom</option>
              <option value="engineering">Engineering</option>
              <option value="manufacturing">Manufacturing</option>
            </select>
          </div>
        </div>
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={bomImportSchema}
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
          if (isDemo) {
            return { success: data.length, errors: [] };
          }
          const result = await importBOMs(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(bomImportSchema)}
      />
    </div>
  );
}
