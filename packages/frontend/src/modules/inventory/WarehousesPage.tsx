import { useState, useMemo } from 'react';
import { Plus, Building2, Package, Upload, Eye, Pencil, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, warehouseImportSchema, validateRow, coerceRow } from '@erp/shared';
import { useWarehouses, useInventoryOnHand, useCreateWarehouse, useUpdateWarehouse, useDeleteWarehouse, useImportWarehouses } from '../../data-layer/hooks/useInventory';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

type SlideOverMode = 'view' | 'create' | 'edit';

interface WarehouseForm {
  warehouseCode: string;
  warehouseName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isActive: boolean;
}

const emptyForm: WarehouseForm = {
  warehouseCode: '',
  warehouseName: '',
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  isActive: true,
};

export default function WarehousesPage() {
  const { data: warehouses = [], isLoading } = useWarehouses();
  const { data: inventoryOnHand = [] } = useInventoryOnHand();
  const { mutate: createWarehouse, isPending: isCreating } = useCreateWarehouse();
  const { mutate: updateWarehouse, isPending: isUpdating } = useUpdateWarehouse();
  const { mutate: deleteWarehouse, isPending: isDeleting } = useDeleteWarehouse();
  const { mutateAsync: importWarehouses } = useImportWarehouses();
  const { isDemo } = useAppMode();

  const [slideOverMode, setSlideOverMode] = useState<SlideOverMode | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [showImport, setShowImport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState<WarehouseForm>(emptyForm);

  const updateField = <K extends keyof WarehouseForm>(key: K, value: WarehouseForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetAndClose = () => {
    setSlideOverMode(null);
    setSelectedWarehouse(null);
    setForm(emptyForm);
    setShowDeleteConfirm(false);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setSelectedWarehouse(null);
    setSlideOverMode('create');
  };

  const openView = (wh: any) => {
    setSelectedWarehouse(wh);
    setSlideOverMode('view');
  };

  const openEdit = (wh: any) => {
    setSelectedWarehouse(wh);
    setForm({
      warehouseCode: wh.warehouseCode || '',
      warehouseName: wh.warehouseName || '',
      address: wh.address || '',
      city: wh.city || '',
      state: wh.state || '',
      country: wh.country || '',
      zipCode: wh.zipCode || '',
      isActive: wh.isActive ?? true,
    });
    setSlideOverMode('edit');
  };

  const handleCreate = () => {
    if (!form.warehouseCode.trim() || !form.warehouseName.trim()) return;
    createWarehouse(
      {
        warehouseCode: form.warehouseCode.trim(),
        warehouseName: form.warehouseName.trim(),
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        country: form.country.trim() || undefined,
        zipCode: form.zipCode.trim() || undefined,
        isActive: form.isActive,
      },
      { onSuccess: resetAndClose },
    );
  };

  const handleUpdate = () => {
    if (!selectedWarehouse || !form.warehouseCode.trim() || !form.warehouseName.trim()) return;
    updateWarehouse(
      {
        id: selectedWarehouse.id,
        warehouseCode: form.warehouseCode.trim(),
        warehouseName: form.warehouseName.trim(),
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        country: form.country.trim() || undefined,
        zipCode: form.zipCode.trim() || undefined,
        isActive: form.isActive,
      },
      { onSuccess: resetAndClose },
    );
  };

  const handleDelete = () => {
    if (!selectedWarehouse) return;
    deleteWarehouse(selectedWarehouse.id, { onSuccess: resetAndClose });
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

  // -- Form fields JSX (shared between create and edit) --
  const renderFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Warehouse Code <span className="text-red-500">*</span>
        </label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. WH-001"
          value={form.warehouseCode}
          onChange={(e) => updateField('warehouseCode', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Warehouse Name <span className="text-red-500">*</span>
        </label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. Main Distribution Center"
          value={form.warehouseName}
          onChange={(e) => updateField('warehouseName', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Address</label>
        <input
          className={INPUT_CLS}
          placeholder="Street address"
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">City</label>
          <input
            className={INPUT_CLS}
            placeholder="City"
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">State</label>
          <input
            className={INPUT_CLS}
            placeholder="State"
            value={form.state}
            onChange={(e) => updateField('state', e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Country</label>
          <input
            className={INPUT_CLS}
            placeholder="Country"
            value={form.country}
            onChange={(e) => updateField('country', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Zip Code</label>
          <input
            className={INPUT_CLS}
            placeholder="Zip / Postal code"
            value={form.zipCode}
            onChange={(e) => updateField('zipCode', e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          role="switch"
          aria-checked={form.isActive}
          onClick={() => updateField('isActive', !form.isActive)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            form.isActive ? 'bg-brand-600' : 'bg-surface-3'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              form.isActive ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
        <label className="text-xs font-medium text-text-secondary">Active</label>
      </div>
    </div>
  );

  // -- View details content --
  const renderViewContent = () => {
    if (!selectedWarehouse) return null;
    const wh = warehouseMetrics.find((w: any) => w.id === selectedWarehouse.id) || selectedWarehouse;
    const locationParts = [wh.city, wh.state, wh.country].filter(Boolean).join(', ');

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
            <Building2 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{wh.warehouseCode}</p>
            <p className="text-xs text-text-muted">{wh.warehouseName}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {wh.isDefault && <Badge variant="success" className="text-2xs">Default</Badge>}
            <Badge variant={wh.isActive ? 'success' : 'default'} className="text-2xs">
              {wh.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-border p-3">
          <h3 className="text-xs font-semibold text-text-primary">Location</h3>
          {wh.address && (
            <div>
              <p className="text-2xs text-text-muted">Address</p>
              <p className="text-xs text-text-primary">{wh.address}</p>
            </div>
          )}
          {locationParts && (
            <div>
              <p className="text-2xs text-text-muted">City / State / Country</p>
              <p className="text-xs text-text-primary">{locationParts}</p>
            </div>
          )}
          {wh.zipCode && (
            <div>
              <p className="text-2xs text-text-muted">Zip Code</p>
              <p className="text-xs text-text-primary">{wh.zipCode}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border p-3">
            <p className="text-2xs text-text-muted mb-1">Items Stored</p>
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-text-muted" />
              <span className="text-sm font-semibold text-text-primary">{wh.itemCount ?? 0}</span>
            </div>
            <p className="text-2xs text-text-muted mt-0.5">{wh.totalQuantity ?? 0} units</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-2xs text-text-muted mb-1">Total Value</p>
            <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
              {formatCurrency(wh.totalValue ?? 0)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // -- Loading skeleton --
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

  // -- SlideOver title / description helpers --
  const slideOverTitle =
    slideOverMode === 'create' ? 'New Warehouse' :
    slideOverMode === 'edit' ? 'Edit Warehouse' :
    'Warehouse Details';

  const slideOverDescription =
    slideOverMode === 'create' ? 'Add a new warehouse location' :
    slideOverMode === 'edit' ? 'Update warehouse information' :
    selectedWarehouse?.warehouseCode ?? '';

  // -- SlideOver footer per mode --
  const renderFooter = () => {
    if (slideOverMode === 'create') {
      return (
        <>
          <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !form.warehouseCode.trim() || !form.warehouseName.trim()}
          >
            {isCreating ? 'Saving...' : 'Save'}
          </Button>
        </>
      );
    }
    if (slideOverMode === 'edit') {
      return (
        <>
          <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || !form.warehouseCode.trim() || !form.warehouseName.trim()}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      );
    }
    // View mode
    return (
      <>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-2 w-full">
            <p className="text-xs text-red-600 dark:text-red-400 mr-auto">Are you sure? This cannot be undone.</p>
            <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              No, Keep
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
            <div className="flex-1" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openEdit(selectedWarehouse)}
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </>
        )}
      </>
    );
  };

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
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Warehouse
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Warehouses</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{warehouses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Active Locations</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {warehouses.filter((w: any) => w.isActive).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Items</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{inventoryOnHand.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Inventory Value</p>
              <p className="text-lg font-bold text-brand-600 mt-2">
                {formatCurrency(inventoryOnHand.reduce((sum: number, ioh: any) => sum + (ioh.totalCost ?? 0), 0))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouseMetrics.map((wh: any) => (
          <Card
            key={wh.id}
            className="hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all cursor-pointer"
            onClick={() => openView(wh)}
          >
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
                <div className="flex items-center gap-1">
                  {wh.isDefault && <Badge variant="success" className="text-2xs">Default</Badge>}
                  <Badge variant={wh.isActive ? 'success' : 'default'} className="text-2xs">
                    {wh.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-2xs text-text-muted mb-0.5">Location</p>
                <p className="text-xs text-text-primary">
                  {[wh.city, wh.state, wh.country].filter(Boolean).join(', ') || 'Not specified'}
                </p>
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
                  <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {formatCurrency(wh.totalValue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export */}
      <div className="flex justify-end">
        <ExportButton
          onExportCSV={() => exportToCSV(warehouses, 'warehouses')}
          onExportExcel={() => exportToExcel(warehouses, 'warehouses')}
        />
      </div>

      {/* View / Create / Edit SlideOver */}
      <SlideOver
        open={slideOverMode !== null}
        onClose={resetAndClose}
        title={slideOverTitle}
        description={slideOverDescription}
        width="md"
        footer={renderFooter()}
      >
        {slideOverMode === 'view' && renderViewContent()}
        {slideOverMode === 'create' && renderFormFields()}
        {slideOverMode === 'edit' && renderFormFields()}
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={warehouseImportSchema}
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
          const result = await importWarehouses(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(warehouseImportSchema)}
      />
    </div>
  );
}
