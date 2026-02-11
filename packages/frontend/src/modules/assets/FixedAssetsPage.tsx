import { useState, useMemo } from 'react';
import { Plus, Upload, Pencil, Trash2 } from 'lucide-react';
import { DataTable, Card, CardContent, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, fixedAssetImportSchema, validateRow, coerceRow } from '@erp/shared';
import { useFixedAssets, useCreateFixedAsset, useUpdateFixedAsset, useDeleteFixedAsset, useImportFixedAssets } from '../../data-layer/hooks/useAssets';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const CATEGORY_OPTIONS = [
  'Machinery',
  'Equipment',
  'Vehicles',
  'Computer Equipment',
  'Office Furniture',
  'Buildings',
  'Tooling',
  'Molds & Dies',
];

const DEPRECIATION_METHOD_OPTIONS = [
  { value: 'straight_line', label: 'Straight Line' },
  { value: 'declining_balance', label: 'Declining Balance' },
  { value: 'double_declining', label: 'Double Declining' },
  { value: 'sum_of_years', label: 'Sum of Years' },
  { value: 'macrs', label: 'MACRS' },
];

const DEPRECIATION_LABELS: Record<string, string> = {
  straight_line: 'Straight Line',
  declining_balance: 'Declining Balance',
  double_declining: 'Double Declining',
  sum_of_years: 'Sum of Years',
  macrs: 'MACRS',
};

const STATUS_BADGES: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }> = {
  active: { label: 'Active', variant: 'success' },
  under_maintenance: { label: 'Under Maintenance', variant: 'warning' },
  disposed: { label: 'Disposed', variant: 'danger' },
};

type SlideOverMode = 'closed' | 'view' | 'create' | 'edit';

export default function FixedAssetsPage() {
  const { data: assets = [], isLoading } = useFixedAssets();
  const { mutate: createAsset, isPending: isCreating } = useCreateFixedAsset();
  const { mutate: updateAsset, isPending: isUpdating } = useUpdateFixedAsset();
  const { mutate: deleteAsset, isPending: isDeleting } = useDeleteFixedAsset();
  const { mutateAsync: importAssets } = useImportFixedAssets();
  const { isDemo } = useAppMode();

  // SlideOver state
  const [mode, setMode] = useState<SlideOverMode>('closed');
  const [showImport, setShowImport] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [assetNumber, setAssetNumber] = useState('');
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('Machinery');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [originalCost, setOriginalCost] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [depreciationMethod, setDepreciationMethod] = useState('straight_line');
  const [usefulLifeYears, setUsefulLifeYears] = useState('');
  const [salvageValue, setSalvageValue] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  const resetForm = () => {
    setAssetNumber('');
    setAssetName('');
    setAssetCategory('Machinery');
    setAcquisitionDate('');
    setOriginalCost('');
    setCurrentValue('');
    setDepreciationMethod('straight_line');
    setUsefulLifeYears('');
    setSalvageValue('');
    setLocation('');
    setDepartment('');
    setSerialNumber('');
  };

  const populateForm = (asset: any) => {
    setAssetNumber(asset.assetNumber || '');
    setAssetName(asset.assetName || '');
    setAssetCategory(asset.categoryName || asset.assetCategory || 'Machinery');
    setAcquisitionDate(asset.acquisitionDate || asset.purchaseDate ? (asset.acquisitionDate || asset.purchaseDate).slice(0, 10) : '');
    setOriginalCost(asset.originalCost != null ? String(asset.originalCost) : asset.purchaseCost != null ? String(asset.purchaseCost) : '');
    setCurrentValue(asset.currentValue != null ? String(asset.currentValue) : '');
    setDepreciationMethod(asset.depreciationMethod || 'straight_line');
    setUsefulLifeYears(asset.usefulLifeYears != null ? String(asset.usefulLifeYears) : '');
    setSalvageValue(asset.salvageValue != null ? String(asset.salvageValue) : '');
    setLocation(asset.location || '');
    setDepartment(asset.department || '');
    setSerialNumber(asset.serialNumber || '');
  };

  const openCreate = () => {
    resetForm();
    setSelectedAsset(null);
    setMode('create');
  };

  const openView = (asset: any) => {
    setSelectedAsset(asset);
    setMode('view');
  };

  const openEdit = () => {
    if (!selectedAsset) return;
    populateForm(selectedAsset);
    setMode('edit');
  };

  const closeSlideOver = () => {
    setMode('closed');
    setSelectedAsset(null);
    setShowDeleteConfirm(false);
    resetForm();
  };

  const buildPayload = () => ({
    assetNumber: assetNumber || `FA-${String(Date.now()).slice(-4)}`,
    assetName,
    categoryName: assetCategory,
    acquisitionDate: acquisitionDate || new Date().toISOString().slice(0, 10),
    originalCost: parseFloat(originalCost) || 0,
    currentValue: parseFloat(currentValue) || parseFloat(originalCost) || 0,
    depreciationMethod,
    usefulLifeYears: parseInt(usefulLifeYears) || 10,
    salvageValue: parseFloat(salvageValue) || 0,
    location: location || undefined,
    department: department || undefined,
    serialNumber: serialNumber || undefined,
  });

  const handleCreate = () => {
    createAsset(buildPayload(), { onSuccess: closeSlideOver });
  };

  const handleUpdate = () => {
    if (!selectedAsset) return;
    updateAsset(
      { id: selectedAsset.id, ...buildPayload() },
      { onSuccess: closeSlideOver },
    );
  };

  const handleDelete = () => {
    if (!selectedAsset) return;
    deleteAsset(selectedAsset.id, { onSuccess: closeSlideOver });
  };

  // ── Table columns ──
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'assetNumber',
        header: 'Asset #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.assetNumber}</span>
        ),
      },
      {
        accessorKey: 'assetName',
        header: 'Name',
        cell: ({ row }) => (
          <p className="text-sm text-text-primary">{row.original.assetName}</p>
        ),
      },
      {
        accessorKey: 'categoryName',
        header: 'Category',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.categoryName || row.original.assetCategory || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'acquisitionDate',
        header: 'Acquisition Date',
        cell: ({ row }) => {
          const raw = row.original.acquisitionDate || row.original.purchaseDate;
          if (!raw) return <span className="text-sm text-text-muted">-</span>;
          return (
            <span className="text-sm text-text-secondary">
              {new Date(raw).toLocaleDateString()}
            </span>
          );
        },
      },
      {
        accessorKey: 'originalCost',
        header: 'Original Cost',
        cell: ({ row }) => (
          <span className="text-sm text-text-primary font-medium">
            {formatCurrency(Number(row.original.originalCost ?? row.original.purchaseCost ?? 0))}
          </span>
        ),
      },
      {
        accessorKey: 'currentValue',
        header: 'Current Value',
        cell: ({ row }) => (
          <span className="text-sm text-text-primary font-medium">
            {formatCurrency(Number(row.original.currentValue ?? 0))}
          </span>
        ),
      },
      {
        accessorKey: 'depreciationMethod',
        header: 'Depreciation',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {DEPRECIATION_LABELS[row.original.depreciationMethod] || row.original.depreciationMethod || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const info = STATUS_BADGES[row.original.status];
          return info ? (
            <Badge variant={info.variant}>{info.label}</Badge>
          ) : (
            <Badge variant="default">{row.original.status || 'Active'}</Badge>
          );
        },
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
        <label className="block text-sm font-medium text-text-primary mb-1">Asset Number</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. FA-001 (auto-generated if blank)"
          value={assetNumber}
          onChange={(e) => setAssetNumber(e.target.value)}
          disabled={mode === 'edit'}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Asset Name *</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. CNC Milling Machine"
          value={assetName}
          onChange={(e) => setAssetName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
        <select className={INPUT_CLS} value={assetCategory} onChange={(e) => setAssetCategory(e.target.value)}>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Serial Number</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. SN-12345"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Acquisition Date</label>
        <input
          type="date"
          className={INPUT_CLS}
          value={acquisitionDate}
          onChange={(e) => setAcquisitionDate(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Original Cost ($)</label>
          <input
            className={INPUT_CLS}
            type="number"
            step="0.01"
            placeholder="0.00"
            value={originalCost}
            onChange={(e) => setOriginalCost(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Current Value ($)</label>
          <input
            className={INPUT_CLS}
            type="number"
            step="0.01"
            placeholder="0.00"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Depreciation Method</label>
        <select className={INPUT_CLS} value={depreciationMethod} onChange={(e) => setDepreciationMethod(e.target.value)}>
          {DEPRECIATION_METHOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Useful Life (years)</label>
          <input
            className={INPUT_CLS}
            type="number"
            placeholder="e.g. 10"
            value={usefulLifeYears}
            onChange={(e) => setUsefulLifeYears(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Salvage Value ($)</label>
          <input
            className={INPUT_CLS}
            type="number"
            step="0.01"
            placeholder="0.00"
            value={salvageValue}
            onChange={(e) => setSalvageValue(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Location</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. Building A - Production Floor"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Department</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. Manufacturing"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
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
          <h1 className="text-lg font-semibold text-text-primary">Fixed Assets</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage your organization's fixed assets and depreciation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Asset
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Assets</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{assets.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Active Assets</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {assets.filter((asset: any) => asset.status === 'active' || !asset.status).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Original Cost</p>
              <p className="text-lg font-bold text-brand-600 mt-2">
                {formatCurrency(assets.reduce((sum: number, asset: any) => sum + Number(asset.originalCost ?? asset.purchaseCost ?? 0), 0))}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Current Value</p>
              <p className="text-lg font-bold text-brand-600 mt-2">
                {formatCurrency(assets.reduce((sum: number, asset: any) => sum + Number(asset.currentValue ?? 0), 0))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(assets, 'fixed-assets')}
              onExportExcel={() => exportToExcel(assets, 'fixed-assets')}
            />
          </div>
          <DataTable
            columns={columns}
            data={assets}
            searchable
            searchPlaceholder="Search by asset number or name..."
            pageSize={15}
            emptyMessage="No fixed assets found."
            onRowClick={openView}
          />
        </CardContent>
      </Card>

      {/* ── View Asset SlideOver ── */}
      <SlideOver
        open={mode === 'view'}
        onClose={closeSlideOver}
        title={selectedAsset?.assetNumber ?? 'Asset Details'}
        description={selectedAsset?.assetName ?? ''}
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
        {selectedAsset && (
          <div>
            {detailRow('Asset Number', selectedAsset.assetNumber)}
            {detailRow('Asset Name', selectedAsset.assetName)}
            {detailRow('Category', selectedAsset.categoryName || selectedAsset.assetCategory || '-')}
            {detailRow('Serial Number', selectedAsset.serialNumber || '-')}
            {detailRow('Acquisition Date', selectedAsset.acquisitionDate || selectedAsset.purchaseDate
              ? new Date(selectedAsset.acquisitionDate || selectedAsset.purchaseDate).toLocaleDateString()
              : '-')}
            {detailRow('Original Cost', formatCurrency(Number(selectedAsset.originalCost ?? selectedAsset.purchaseCost ?? 0)))}
            {detailRow('Current Value', formatCurrency(Number(selectedAsset.currentValue ?? 0)))}
            {detailRow('Depreciation Method', DEPRECIATION_LABELS[selectedAsset.depreciationMethod] || selectedAsset.depreciationMethod || '-')}
            {detailRow('Useful Life', selectedAsset.usefulLifeYears != null ? `${selectedAsset.usefulLifeYears} years` : '-')}
            {detailRow('Salvage Value', selectedAsset.salvageValue != null ? formatCurrency(Number(selectedAsset.salvageValue)) : '-')}
            {detailRow('Accumulated Depreciation', selectedAsset.accumulatedDepreciation != null ? formatCurrency(Number(selectedAsset.accumulatedDepreciation)) : '-')}
            {detailRow('Location', selectedAsset.location || '-')}
            {detailRow('Department', selectedAsset.department || '-')}
            {detailRow(
              'Status',
              (() => {
                const info = STATUS_BADGES[selectedAsset.status];
                return info
                  ? <Badge variant={info.variant}>{info.label}</Badge>
                  : <Badge variant="default">{selectedAsset.status || 'Active'}</Badge>;
              })(),
            )}
          </div>
        )}
      </SlideOver>

      {/* ── Create Asset SlideOver ── */}
      <SlideOver
        open={mode === 'create'}
        onClose={closeSlideOver}
        title="New Asset"
        description="Register a new fixed asset"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeSlideOver}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isCreating || !assetName.trim()}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        {renderForm()}
      </SlideOver>

      {/* ── Edit Asset SlideOver ── */}
      <SlideOver
        open={mode === 'edit'}
        onClose={closeSlideOver}
        title="Edit Asset"
        description={`Editing ${selectedAsset?.assetNumber ?? ''}`}
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeSlideOver}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={isUpdating || !assetName.trim()}>
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
        schema={fixedAssetImportSchema}
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
          const result = await importAssets(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(fixedAssetImportSchema)}
      />
    </div>
  );
}
