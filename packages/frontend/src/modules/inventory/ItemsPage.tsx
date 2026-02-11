import { useState, useMemo } from 'react';
import { Plus, Upload } from 'lucide-react';
import { DataTable, Card, CardContent, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, itemImportSchema, validateRow, coerceRow } from '@erp/shared';
import { useItems, useCreateItem, useImportItems } from '../../data-layer/hooks/useInventory';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const ITEM_TYPE_BADGES: Record<string, { label: string; variant: 'info' | 'default' | 'success' | 'warning' }> = {
  raw_material: { label: 'Raw Material', variant: 'info' },
  component: { label: 'Component', variant: 'default' },
  finished_good: { label: 'Finished Good', variant: 'success' },
  subassembly: { label: 'Subassembly', variant: 'warning' },
  supplies: { label: 'Supplies', variant: 'default' },
};

export default function ItemsPage() {
  const { data: items = [], isLoading } = useItems();
  const { mutate: createItem, isPending: isCreating } = useCreateItem();
  const { mutateAsync: importItems } = useImportItems();
  const { isDemo } = useAppMode();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [sku, setSku] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('raw_material');
  const [unitCost, setUnitCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [reorderPoint, setReorderPoint] = useState('');

  const resetForm = () => {
    setSku('');
    setItemName('');
    setCategory('raw_material');
    setUnitCost('');
    setSellingPrice('');
    setReorderPoint('');
  };

  const handleSubmit = () => {
    createItem(
      {
        itemNumber: sku || `ITM-${String(Date.now()).slice(-4)}`,
        itemName,
        itemType: category,
        unitOfMeasure: 'EA',
        unitCost: parseFloat(unitCost) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        reorderPoint: parseInt(reorderPoint) || 0,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      },
    );
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'itemNumber',
        header: 'Item #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.itemNumber}
          </span>
        ),
      },
      {
        accessorKey: 'itemName',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <p className="text-sm text-text-primary">{row.original.itemName}</p>
            {row.original.description && (
              <p className="text-2xs text-text-muted truncate max-w-xs">
                {row.original.description}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'itemType',
        header: 'Type',
        cell: ({ row }) => {
          const typeInfo = ITEM_TYPE_BADGES[row.original.itemType];
          return typeInfo ? (
            <Badge variant={typeInfo.variant}>
              {typeInfo.label}
            </Badge>
          ) : (
            <span className="text-sm text-text-muted">{row.original.itemType}</span>
          );
        },
      },
      {
        accessorKey: 'unitOfMeasure',
        header: 'UOM',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.unitOfMeasure}
          </span>
        ),
      },
      {
        accessorKey: 'standardCost',
        header: 'Std Cost',
        cell: ({ row }) => (
          <span className="text-sm text-text-primary font-medium">
            {formatCurrency(Number(row.original.standardCost ?? row.original.unitCost ?? 0))}
          </span>
        ),
      },
      {
        accessorKey: 'reorderPoint',
        header: 'Reorder Pt',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.reorderPoint || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'abcClassification',
        header: 'ABC Class',
        cell: ({ row }) => {
          const abc = row.original.abcClassification;
          if (!abc) return <span className="text-sm text-text-muted">-</span>;

          const variant = abc === 'A' ? 'danger' : abc === 'B' ? 'warning' : 'info';
          return (
            <Badge variant={variant}>
              {abc}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'default'}>
            {row.original.isActive ? 'Yes' : 'No'}
          </Badge>
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
          <h1 className="text-lg font-semibold text-text-primary">Items</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage inventory items and their properties
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(items, 'items')}
              onExportExcel={() => exportToExcel(items, 'items')}
            />
          </div>
          <DataTable
            columns={columns}
            data={items}
            searchable
            searchPlaceholder="Search by item number or name..."
            pageSize={15}
            emptyMessage="No items found."
          />
        </CardContent>
      </Card>

      {/* New Item SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Item"
        description="Add a new inventory item"
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
            <label className="block text-sm font-medium text-text-primary mb-1">SKU / Item #</label>
            <input className={INPUT_CLS} placeholder="e.g. ITM-2001" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
            <input className={INPUT_CLS} placeholder="Item name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
            <select className={INPUT_CLS} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="raw_material">Raw Material</option>
              <option value="component">Component</option>
              <option value="finished_good">Finished Good</option>
              <option value="subassembly">Subassembly</option>
              <option value="supplies">Supplies</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Unit Cost ($)</label>
            <input className={INPUT_CLS} type="number" placeholder="0.00" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Selling Price ($)</label>
            <input className={INPUT_CLS} type="number" placeholder="0.00" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Reorder Point</label>
            <input className={INPUT_CLS} type="number" placeholder="0" value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} />
          </div>
        </div>
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={itemImportSchema}
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
          const result = await importItems(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(itemImportSchema)}
      />
    </div>
  );
}
