import { useState, useMemo } from 'react';
import { Plus, Upload, Pencil, Trash2 } from 'lucide-react';
import { DataTable, Card, CardContent, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, itemImportSchema, validateRow, coerceRow } from '@erp/shared';
import { useItems, useCreateItem, useUpdateItem, useDeleteItem, useImportItems } from '../../data-layer/hooks/useInventory';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const ITEM_TYPE_OPTIONS = [
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'component', label: 'Component' },
  { value: 'finished_good', label: 'Finished Good' },
  { value: 'subassembly', label: 'Subassembly' },
  { value: 'supplies', label: 'Supplies' },
];

const UOM_OPTIONS = ['EA', 'KG', 'LB', 'FT', 'M', 'GAL', 'LTR', 'BOX', 'SET'];

const ITEM_TYPE_BADGES: Record<string, { label: string; variant: 'info' | 'default' | 'success' | 'warning' }> = {
  raw_material: { label: 'Raw Material', variant: 'info' },
  component: { label: 'Component', variant: 'default' },
  finished_good: { label: 'Finished Good', variant: 'success' },
  subassembly: { label: 'Subassembly', variant: 'warning' },
  supplies: { label: 'Supplies', variant: 'default' },
};

type SlideOverMode = 'closed' | 'view' | 'create' | 'edit';

export default function ItemsPage() {
  const { data: items = [], isLoading } = useItems();
  const { mutate: createItem, isPending: isCreating } = useCreateItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItem();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteItem();
  const { mutateAsync: importItems } = useImportItems();
  const { isDemo } = useAppMode();

  // SlideOver state
  const [mode, setMode] = useState<SlideOverMode>('closed');
  const [showImport, setShowImport] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [itemNumber, setItemNumber] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('raw_material');
  const [unitOfMeasure, setUnitOfMeasure] = useState('EA');
  const [unitCost, setUnitCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [reorderPoint, setReorderPoint] = useState('');
  const [reorderQuantity, setReorderQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState('true');

  const resetForm = () => {
    setItemNumber('');
    setItemName('');
    setItemType('raw_material');
    setUnitOfMeasure('EA');
    setUnitCost('');
    setSellingPrice('');
    setReorderPoint('');
    setReorderQuantity('');
    setDescription('');
    setIsActive('true');
  };

  const populateForm = (item: any) => {
    setItemNumber(item.itemNumber || '');
    setItemName(item.itemName || '');
    setItemType(item.itemType || 'raw_material');
    setUnitOfMeasure(item.unitOfMeasure || 'EA');
    setUnitCost(item.unitCost != null ? String(item.unitCost) : '');
    setSellingPrice(item.sellingPrice != null ? String(item.sellingPrice) : '');
    setReorderPoint(item.reorderPoint != null ? String(item.reorderPoint) : '');
    setReorderQuantity(item.reorderQuantity != null ? String(item.reorderQuantity) : '');
    setDescription(item.description || '');
    setIsActive(item.isActive === false ? 'false' : 'true');
  };

  const openCreate = () => {
    resetForm();
    setSelectedItem(null);
    setMode('create');
  };

  const openView = (item: any) => {
    setSelectedItem(item);
    setMode('view');
  };

  const openEdit = () => {
    if (!selectedItem) return;
    populateForm(selectedItem);
    setMode('edit');
  };

  const closeSlideOver = () => {
    setMode('closed');
    setSelectedItem(null);
    setShowDeleteConfirm(false);
    resetForm();
  };

  const handleCreate = () => {
    createItem(
      {
        itemNumber: itemNumber || `ITM-${String(Date.now()).slice(-4)}`,
        itemName,
        itemType,
        unitOfMeasure,
        unitCost: parseFloat(unitCost) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        reorderPoint: parseInt(reorderPoint) || 0,
        reorderQuantity: parseInt(reorderQuantity) || 0,
        description: description || undefined,
        isActive: isActive === 'true',
      },
      { onSuccess: closeSlideOver },
    );
  };

  const handleUpdate = () => {
    if (!selectedItem) return;
    updateItem(
      {
        id: selectedItem.id,
        itemNumber,
        itemName,
        itemType,
        unitOfMeasure,
        unitCost: parseFloat(unitCost) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        reorderPoint: parseInt(reorderPoint) || 0,
        reorderQuantity: parseInt(reorderQuantity) || 0,
        description: description || undefined,
        isActive: isActive === 'true',
      },
      { onSuccess: closeSlideOver },
    );
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    deleteItem(selectedItem.id, { onSuccess: closeSlideOver });
  };

  // ── Table columns ──
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
            <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
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
        accessorKey: 'unitCost',
        header: 'Std Cost',
        cell: ({ row }) => (
          <span className="text-sm text-text-primary font-medium">
            {formatCurrency(Number(row.original.standardCost ?? row.original.unitCost ?? 0))}
          </span>
        ),
      },
      {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
        cell: ({ row }) => (
          <span className="text-sm text-text-primary">
            {formatCurrency(Number(row.original.sellingPrice ?? 0))}
          </span>
        ),
      },
      {
        accessorKey: 'reorderPoint',
        header: 'Reorder Pt',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.reorderPoint ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive !== false ? 'success' : 'default'}>
            {row.original.isActive !== false ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    [],
  );

  // ── Detail rows for the view SlideOver ──
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
        <label className="block text-sm font-medium text-text-primary mb-1">Item Number</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. ITM-2001 (auto-generated if blank)"
          value={itemNumber}
          onChange={(e) => setItemNumber(e.target.value)}
          disabled={mode === 'edit'}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Name *</label>
        <input
          className={INPUT_CLS}
          placeholder="Item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
        <select className={INPUT_CLS} value={itemType} onChange={(e) => setItemType(e.target.value)}>
          {ITEM_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Unit of Measure</label>
        <select className={INPUT_CLS} value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)}>
          {UOM_OPTIONS.map((uom) => (
            <option key={uom} value={uom}>{uom}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Unit Cost ($)</label>
          <input
            className={INPUT_CLS}
            type="number"
            step="0.01"
            placeholder="0.00"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Selling Price ($)</label>
          <input
            className={INPUT_CLS}
            type="number"
            step="0.01"
            placeholder="0.00"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Reorder Point</label>
          <input
            className={INPUT_CLS}
            type="number"
            placeholder="0"
            value={reorderPoint}
            onChange={(e) => setReorderPoint(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Reorder Quantity</label>
          <input
            className={INPUT_CLS}
            type="number"
            placeholder="0"
            value={reorderQuantity}
            onChange={(e) => setReorderQuantity(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
        <textarea
          className={INPUT_CLS}
          rows={3}
          placeholder="Optional description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
        <select className={INPUT_CLS} value={isActive} onChange={(e) => setIsActive(e.target.value)}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
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
          <Button variant="primary" size="sm" onClick={openCreate}>
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
            onRowClick={openView}
          />
        </CardContent>
      </Card>

      {/* ── View Item SlideOver ── */}
      <SlideOver
        open={mode === 'view'}
        onClose={closeSlideOver}
        title={selectedItem?.itemNumber ?? 'Item Details'}
        description={selectedItem?.itemName ?? ''}
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
        {selectedItem && (
          <div>
            {detailRow('Item Number', selectedItem.itemNumber)}
            {detailRow('Name', selectedItem.itemName)}
            {detailRow('Type', ITEM_TYPE_BADGES[selectedItem.itemType]?.label ?? selectedItem.itemType)}
            {detailRow('Unit of Measure', selectedItem.unitOfMeasure)}
            {detailRow('Unit Cost', formatCurrency(Number(selectedItem.unitCost ?? 0)))}
            {detailRow('Selling Price', formatCurrency(Number(selectedItem.sellingPrice ?? 0)))}
            {detailRow('Reorder Point', selectedItem.reorderPoint ?? '-')}
            {detailRow('Reorder Quantity', selectedItem.reorderQuantity ?? '-')}
            {detailRow('Description', selectedItem.description || '-')}
            {detailRow('ABC Classification', selectedItem.abcClassification || '-')}
            {detailRow('Lead Time (days)', selectedItem.leadTimeDays ?? '-')}
            {detailRow('Serialized', selectedItem.isSerialized ? 'Yes' : 'No')}
            {detailRow('Lot Tracked', selectedItem.isLotTracked ? 'Yes' : 'No')}
            {detailRow(
              'Status',
              <Badge variant={selectedItem.isActive !== false ? 'success' : 'default'}>
                {selectedItem.isActive !== false ? 'Active' : 'Inactive'}
              </Badge>,
            )}
          </div>
        )}
      </SlideOver>

      {/* ── Create Item SlideOver ── */}
      <SlideOver
        open={mode === 'create'}
        onClose={closeSlideOver}
        title="New Item"
        description="Add a new inventory item"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeSlideOver}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isCreating || !itemName.trim()}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        {renderForm()}
      </SlideOver>

      {/* ── Edit Item SlideOver ── */}
      <SlideOver
        open={mode === 'edit'}
        onClose={closeSlideOver}
        title="Edit Item"
        description={`Editing ${selectedItem?.itemNumber ?? ''}`}
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeSlideOver}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isUpdating || !itemName.trim()}>
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
