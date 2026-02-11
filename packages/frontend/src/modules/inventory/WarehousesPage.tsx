import { useState, useMemo } from 'react';
import { Plus, Building2, Package, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, warehouseImportSchema, validateRow, coerceRow } from '@erp/shared';
import { useWarehouses, useInventoryOnHand, useCreateWarehouse, useImportWarehouses } from '../../data-layer/hooks/useInventory';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function WarehousesPage() {
  const { data: warehouses = [], isLoading } = useWarehouses();
  const { data: inventoryOnHand = [] } = useInventoryOnHand();
  const { mutate: createWarehouse, isPending: isCreating } = useCreateWarehouse();
  const { mutateAsync: importWarehouses } = useImportWarehouses();
  const { isDemo } = useAppMode();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [whName, setWhName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [manager, setManager] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const resetForm = () => {
    setWhName('');
    setLocation('');
    setCapacity('');
    setManager('');
    setStatus('active');
  };

  const handleSubmit = () => {
    createWarehouse(
      {
        warehouseCode: `WH-${String(Date.now()).slice(-3)}`,
        warehouseName: whName,
        city: location.split(',')[0]?.trim() || location,
        state: location.split(',')[1]?.trim() || '',
        country: 'US',
      },
      {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      },
    );
  };

  // Calculate metrics for each warehouse
  const warehouseMetrics = useMemo(() => {
    return warehouses.map((wh: any) => {
      const whInventory = inventoryOnHand.filter((ioh: any) => ioh.warehouseId === wh.id);
      const totalValue = whInventory.reduce((sum: number, ioh: any) => sum + (ioh.totalCost ?? 0), 0);
      const itemCount = whInventory.length;
      const totalQuantity = whInventory.reduce((sum: number, ioh: any) => sum + (ioh.quantity ?? ioh.quantityOnHand ?? 0), 0);

      return { ...wh, itemCount, totalValue, totalQuantity };
    });
  }, [warehouses, inventoryOnHand]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-surface-2 animate-skeleton" />
        <div className="h-3 w-72 rounded bg-surface-2 animate-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 rounded-lg border border-border bg-surface-1 animate-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Warehouses</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage warehouse locations and inventory distribution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouseMetrics.map((wh: any) => (
          <Card key={wh.id} className="hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 dark:bg-brand-950">
                    <Building2 className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{wh.warehouseCode}</CardTitle>
                    <p className="text-2xs text-text-muted">{wh.warehouseName}</p>
                  </div>
                </div>
                {wh.isDefault && <Badge variant="success" className="text-2xs">Default</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xs text-text-muted mb-0.5">Location</p>
                <p className="text-xs text-text-primary">{wh.city}, {wh.state} {wh.country}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div>
                  <p className="text-2xs text-text-muted mb-1">Items</p>
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-text-muted" />
                    <span className="text-sm font-semibold text-text-primary">{wh.itemCount}</span>
                  </div>
                  <p className="text-2xs text-text-muted mt-0.5">{wh.totalQuantity} units</p>
                </div>
                <div>
                  <p className="text-2xs text-text-muted mb-1">Total Value</p>
                  <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{formatCurrency(wh.totalValue)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-text-muted">Status</span>
                  <Badge variant={wh.isActive ? 'success' : 'default'} className="text-2xs">{wh.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Warehouse Summary</CardTitle>
            <ExportButton
              onExportCSV={() => exportToCSV(warehouses, 'warehouses')}
              onExportExcel={() => exportToExcel(warehouses, 'warehouses')}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-md border border-border p-3">
              <p className="text-2xs text-text-muted mb-1">Total Warehouses</p>
              <p className="text-xl font-semibold text-text-primary">{warehouses.length}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-2xs text-text-muted mb-1">Active Locations</p>
              <p className="text-xl font-semibold text-text-primary">{warehouses.filter((w: any) => w.isActive).length}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-2xs text-text-muted mb-1">Total Items</p>
              <p className="text-xl font-semibold text-text-primary">{inventoryOnHand.length}</p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-2xs text-text-muted mb-1">Total Inventory Value</p>
              <p className="text-xl font-semibold text-brand-600 dark:text-brand-400">
                {formatCurrency(inventoryOnHand.reduce((sum: number, ioh: any) => sum + (ioh.totalCost ?? 0), 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Warehouse SlideOver */}
      <SlideOver open={showForm} onClose={() => setShowForm(false)} title="New Warehouse" description="Add a new warehouse location" width="md"
        footer={<><Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={isCreating}>{isCreating ? 'Saving...' : 'Save'}</Button></>}
      >
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-text-primary mb-1">Name</label><input className={INPUT_CLS} placeholder="Warehouse name" value={whName} onChange={(e) => setWhName(e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Location</label><input className={INPUT_CLS} placeholder="City, State" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Capacity (units)</label><input className={INPUT_CLS} type="number" placeholder="0" value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Manager</label><input className={INPUT_CLS} placeholder="Manager name" value={manager} onChange={(e) => setManager(e.target.value)} /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1">Status</label><select className={INPUT_CLS} value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
        </div>
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard open={showImport} onClose={() => setShowImport(false)} schema={warehouseImportSchema} onParseFile={parseFile} onAutoMap={autoMapColumns}
        onValidateRows={(rows, mappings, schema) => {
          const validData: Record<string, unknown>[] = [];
          const errors: any[] = [];
          rows.forEach((row, i) => {
            const mapped: Record<string, string> = {};
            mappings.forEach(m => { if (m.targetField && m.sourceColumn) { mapped[m.targetField] = row[m.sourceColumn] || ''; } });
            const coerced = coerceRow(mapped, schema);
            const rowErrors = validateRow(coerced, schema);
            if (rowErrors.length > 0) { errors.push(...rowErrors.map(e => ({ ...e, row: i + 2 }))); } else { validData.push(coerced); }
          });
          return { validData, errors };
        }}
        onImport={async (data) => {
          if (isDemo) { return { success: data.length, errors: [] }; }
          const result = await importWarehouses(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(warehouseImportSchema)}
      />
    </div>
  );
}
