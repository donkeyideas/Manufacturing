import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, SlideOver, Button, ImportWizard, ExportButton } from '@erp/ui';
import { getFixedAssets } from '@erp/demo-data';
import { formatCurrency, fixedAssetImportSchema, validateRow, coerceRow } from '@erp/shared';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus, Upload } from 'lucide-react';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function FixedAssetsPage() {
  const { isDemo } = useAppMode();
  const [assets, setAssets] = useState<any[]>(() => isDemo ? getFixedAssets() : []);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Form fields
  const [assetTag, setAssetTag] = useState('');
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState('Machinery');
  const [location, setLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('2024-12-15');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [usefulLife, setUsefulLife] = useState('');
  const [status, setStatus] = useState('active');

  const resetForm = () => {
    setAssetTag('');
    setAssetName('');
    setCategory('Machinery');
    setLocation('');
    setPurchaseDate('2024-12-15');
    setPurchaseCost('');
    setUsefulLife('');
    setStatus('active');
  };

  const handleSubmit = () => {
    if (!assetName.trim()) return;
    const cost = parseFloat(purchaseCost) || 0;
    const life = parseInt(usefulLife) || 10;
    const newAsset = {
      id: `asset-${Date.now()}`,
      assetNumber: assetTag.trim() || `FA-${String(assets.length + 500).padStart(3, '0')}`,
      assetName: assetName.trim(),
      categoryName: category,
      description: '',
      serialNumber: '',
      manufacturer: '',
      model: '',
      purchaseDate: new Date(purchaseDate).toISOString(),
      purchaseCost: cost,
      currentValue: cost,
      accumulatedDepreciation: 0,
      salvageValue: Math.round(cost * 0.1),
      usefulLifeYears: life,
      depreciationMethod: 'straight_line' as const,
      location: location.trim(),
      department: '',
      status,
      isDepreciable: true,
      lastDepreciationDate: new Date(purchaseDate).toISOString(),
      nextDepreciationDate: new Date(purchaseDate).toISOString(),
      warrantyExpiryDate: new Date(purchaseDate).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
    };
    setAssets((prev) => [newAsset, ...prev]);
    resetForm();
    setShowForm(false);
  };

  const getStatusBadge = (s: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      active: 'success',
      under_maintenance: 'warning',
      disposed: 'danger',
    };
    const labels: Record<string, string> = {
      active: 'Active',
      under_maintenance: 'Under Maintenance',
      disposed: 'Disposed',
    };
    return <Badge variant={variants[s] || 'default'}>{labels[s] || s}</Badge>;
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'assetNumber',
        header: 'Asset #',
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.assetNumber}</span>
        ),
      },
      {
        accessorKey: 'assetName',
        header: 'Asset Name',
        cell: ({ row }) => (
          <p className="font-medium text-text-primary">{row.original.assetName}</p>
        ),
      },
      {
        accessorKey: 'categoryName',
        header: 'Category',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.categoryName}</span>
        ),
      },
      {
        accessorKey: 'purchaseCost',
        header: 'Purchase Cost',
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.purchaseCost)}
          </span>
        ),
      },
      {
        accessorKey: 'currentValue',
        header: 'Current Value',
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.currentValue)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'depreciationMethod',
        header: 'Depreciation Method',
        cell: ({ row }) => {
          const labels: Record<string, string> = {
            straight_line: 'Straight Line',
            declining_balance: 'Declining Balance',
            macrs: 'MACRS',
          };
          return <span className="text-sm">{labels[row.original.depreciationMethod] || row.original.depreciationMethod}</span>;
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">{row.original.location}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Fixed Assets</h1>
          <p className="text-xs text-text-muted">
            Manage your organization's fixed assets - {assets.length} assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Asset
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Fixed Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(assets, 'fixed-assets')}
              onExportExcel={() => exportToExcel(assets, 'fixed-assets')}
            />
          </div>
          <DataTable columns={columns} data={assets} />
        </CardContent>
      </Card>

      {/* New Asset SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Asset"
        description="Register a new fixed asset"
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Asset Tag</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. FA-011 (auto-generated if blank)"
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Name *</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. CNC Milling Machine"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Category</label>
            <select
              className={INPUT_CLS}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Machinery">Machinery</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Office Equipment">Office Equipment</option>
              <option value="IT Equipment">IT Equipment</option>
              <option value="Building">Building</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Location</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Building A - Production Floor"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Purchase Date</label>
            <input
              type="date"
              className={INPUT_CLS}
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Purchase Cost ($)</label>
            <input
              type="number"
              className={INPUT_CLS}
              placeholder="e.g. 85000"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Useful Life (years)</label>
            <input
              type="number"
              className={INPUT_CLS}
              placeholder="e.g. 10"
              value={usefulLife}
              onChange={(e) => setUsefulLife(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
            <select
              className={INPUT_CLS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="under_maintenance">Under Maintenance</option>
              <option value="disposed">Disposed</option>
            </select>
          </div>
        </div>
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
          const newAssets = data.map((row, i) => ({
            id: `import-${Date.now()}-${i}`,
            tenantId: 'tenant-demo',
            ...row,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'import',
          }));
          setAssets((prev: any[]) => [...newAssets, ...prev]);
          return { success: data.length, errors: [] };
        }}
        onDownloadTemplate={() => downloadTemplate(fixedAssetImportSchema)}
      />
    </div>
  );
}
