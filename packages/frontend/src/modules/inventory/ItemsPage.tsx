import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { DataTable, Card, CardContent, Badge, Button, SlideOver } from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import { getItems } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const ITEM_TYPE_BADGES: Record<string, { label: string; variant: 'info' | 'default' | 'success' | 'warning' }> = {
  raw_material: { label: 'Raw Material', variant: 'info' },
  component: { label: 'Component', variant: 'default' },
  finished_good: { label: 'Finished Good', variant: 'success' },
  subassembly: { label: 'Subassembly', variant: 'warning' },
  supplies: { label: 'Supplies', variant: 'default' },
};

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>(() => getItems());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [sku, setSku] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('raw_material');
  const [unitCost, setUnitCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [reorderPoint, setReorderPoint] = useState('');

  const resetForm = () => {
    setSku('');
    setItemName('');
    setCategory('raw_material');
    setUnitCost('');
    setSellingPrice('');
    setStockQty('');
    setReorderPoint('');
  };

  const handleSubmit = () => {
    const newItem = {
      id: `item-${items.length + 101}`,
      itemNumber: sku || `ITM-${String(items.length + 2001).padStart(4, '0')}`,
      itemName,
      description: '',
      itemType: category,
      unitOfMeasure: 'EA',
      standardCost: parseFloat(unitCost) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      stockQuantity: parseInt(stockQty) || 0,
      reorderPoint: parseInt(reorderPoint) || 0,
      abcClassification: 'B',
      isActive: true,
    };
    setItems((prev) => [newItem, ...prev]);
    setShowForm(false);
    resetForm();
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
          return (
            <Badge variant={typeInfo.variant}>
              {typeInfo.label}
            </Badge>
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
            {formatCurrency(row.original.standardCost)}
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
        <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Items Table */}
      <Card>
        <CardContent className="p-4">
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
            <Button onClick={handleSubmit}>Save</Button>
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
            <label className="block text-sm font-medium text-text-primary mb-1">Stock Quantity</label>
            <input className={INPUT_CLS} type="number" placeholder="0" value={stockQty} onChange={(e) => setStockQty(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Reorder Point</label>
            <input className={INPUT_CLS} type="number" placeholder="0" value={reorderPoint} onChange={(e) => setReorderPoint(e.target.value)} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
