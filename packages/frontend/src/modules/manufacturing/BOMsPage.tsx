import { useMemo, useState } from 'react';
import { Plus, Upload, Eye } from 'lucide-react';
import { Card, CardContent, DataTable, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { useBOMs, useCreateBOM, useImportBOMs } from '../../data-layer/hooks/useManufacturing';
import { useItems } from '../../data-layer/hooks/useInventory';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import { bomImportSchema, validateRow, coerceRow } from '@erp/shared';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const BOM_TYPE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'phantom', label: 'Phantom' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'manufacturing', label: 'Manufacturing' },
];

const BOM_TYPE_BADGES: Record<string, { label: string; variant: 'default' | 'warning' | 'info' | 'primary' }> = {
  standard: { label: 'Standard', variant: 'default' },
  phantom: { label: 'Phantom', variant: 'warning' },
  engineering: { label: 'Engineering', variant: 'info' },
  manufacturing: { label: 'Manufacturing', variant: 'primary' },
};

type SlideOverMode = 'closed' | 'view' | 'create';

export default function BOMsPage() {
  const { data: boms = [], isLoading } = useBOMs();
  const { data: items = [] } = useItems();
  const { mutate: createBOM, isPending: isCreating } = useCreateBOM();
  const { mutateAsync: importBOMs } = useImportBOMs();
  const { isDemo } = useAppMode();

  // SlideOver state
  const [mode, setMode] = useState<SlideOverMode>('closed');
  const [showImport, setShowImport] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<any>(null);

  // Form state
  const [bomName, setBomName] = useState('');
  const [finishedItemId, setFinishedItemId] = useState('');
  const [bomType, setBomType] = useState('standard');
  const [version, setVersion] = useState('1');
  const [components, setComponents] = useState('');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setBomName('');
    setFinishedItemId('');
    setBomType('standard');
    setVersion('1');
    setComponents('');
    setIsActive(true);
  };

  const openCreate = () => {
    resetForm();
    setSelectedBOM(null);
    setMode('create');
  };

  const openView = (bom: any) => {
    setSelectedBOM(bom);
    setMode('view');
  };

  const closeSlideOver = () => {
    setMode('closed');
    setSelectedBOM(null);
    resetForm();
  };

  const handleCreate = () => {
    if (!bomName.trim() || !finishedItemId) return;

    const componentLines = components
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const parts = line.split(',');
        const itemName = (parts[0] || '').trim();
        const qty = Number((parts[1] || '1').trim()) || 1;
        return {
          lineNumber: (i + 1) * 10,
          componentItemName: itemName,
          quantityRequired: qty,
          unitOfMeasure: 'EA',
        };
      });

    createBOM(
      {
        bomName: bomName.trim(),
        finishedItemId,
        bomType: bomType as 'standard' | 'phantom' | 'engineering' | 'manufacturing',
        version: String(Number(version) || 1),
        isActive,
        lines: componentLines.length > 0 ? componentLines : undefined,
      },
      { onSuccess: closeSlideOver },
    );
  };

  // ── Table columns ──
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'bomNumber',
        header: 'BOM #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.bomNumber || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'bomName',
        header: 'BOM Name',
        cell: ({ row }) => (
          <div className="min-w-[180px]">
            <p className="text-sm text-text-primary">
              {row.original.bomName || '-'}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'finishedItemName',
        header: 'Finished Item',
        cell: ({ row }) => (
          <div className="min-w-[180px]">
            <p className="text-sm text-text-primary">
              {row.original.finishedItemName || '-'}
            </p>
            {row.original.finishedItemNumber && (
              <p className="text-2xs text-text-muted">{row.original.finishedItemNumber}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'bomType',
        header: 'Type',
        cell: ({ row }) => {
          const info = BOM_TYPE_BADGES[row.original.bomType];
          return info ? (
            <Badge variant={info.variant}>{info.label}</Badge>
          ) : (
            <span className="text-sm text-text-muted">{row.original.bomType || '-'}</span>
          );
        },
      },
      {
        accessorKey: 'version',
        header: 'Version',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">{row.original.version ?? '-'}</span>
        ),
      },
      {
        accessorKey: 'lines',
        header: 'Components',
        cell: ({ row }) => {
          const lines = row.original.lines;
          const count = Array.isArray(lines) ? lines.length : 0;
          return (
            <span className="text-sm text-text-primary">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          );
        },
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
            <span className="text-sm text-text-secondary">
              {row.original.isActive ? 'Yes' : 'No'}
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  // ── Detail row helper ──
  const detailRow = (label: string, value: React.ReactNode) => (
    <div key={label} className="flex items-start justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm text-text-primary text-right max-w-[60%]">{value ?? '-'}</span>
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
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New BOM
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      {(() => {
        const totalBOMs = boms.length;
        const activeBOMs = boms.filter((b: any) => b.isActive).length;
        const inactiveBOMs = boms.filter((b: any) => !b.isActive).length;
        const avgComponents =
          totalBOMs > 0
            ? boms.reduce((sum: number, b: any) => sum + (Array.isArray(b.lines) ? b.lines.length : 0), 0) / totalBOMs
            : 0;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Total BOMs</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{totalBOMs}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Active BOMs</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{activeBOMs}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Inactive BOMs</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{inactiveBOMs}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Avg Components</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{avgComponents.toFixed(1)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* BOMs Table */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(boms, 'boms')}
              onExportExcel={() => exportToExcel(boms, 'boms')}
            />
          </div>
          <DataTable
            columns={columns}
            data={boms}
            searchable
            searchPlaceholder="Search by BOM number or name..."
            pageSize={15}
            emptyMessage="No bills of materials found."
            onRowClick={openView}
          />
        </CardContent>
      </Card>

      {/* ── View BOM SlideOver ── */}
      <SlideOver
        open={mode === 'view'}
        onClose={closeSlideOver}
        title={selectedBOM?.bomNumber ?? 'BOM Details'}
        description={selectedBOM?.bomName || ''}
        width="md"
        footer={
          <Button variant="secondary" onClick={closeSlideOver}>Close</Button>
        }
      >
        {selectedBOM && (
          <div className="space-y-6">
            {/* General details */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">General</h3>
              {detailRow('BOM Number', selectedBOM.bomNumber)}
              {detailRow('BOM Name', selectedBOM.bomName)}
              {detailRow('Finished Item', selectedBOM.finishedItemName || '-')}
              {detailRow('Item Number', selectedBOM.finishedItemNumber || '-')}
              {detailRow(
                'Type',
                (() => {
                  const info = BOM_TYPE_BADGES[selectedBOM.bomType];
                  return info ? <Badge variant={info.variant}>{info.label}</Badge> : (selectedBOM.bomType || '-');
                })(),
              )}
              {detailRow('Version', selectedBOM.version ?? '-')}
              {detailRow(
                'Active',
                <div className="flex items-center gap-1.5">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      selectedBOM.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                  {selectedBOM.isActive ? 'Yes' : 'No'}
                </div>,
              )}
              {selectedBOM.effectiveDate && detailRow(
                'Effective Date',
                new Date(selectedBOM.effectiveDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
              )}
              {selectedBOM.description && detailRow('Description', selectedBOM.description)}
            </div>

            {/* Component lines */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">
                Components ({Array.isArray(selectedBOM.lines) ? selectedBOM.lines.length : 0})
              </h3>
              {Array.isArray(selectedBOM.lines) && selectedBOM.lines.length > 0 ? (
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-surface-1 border-b border-border">
                        <th className="px-3 py-2 text-left text-xs font-medium text-text-muted">Line</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-text-muted">Component</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-text-muted">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-text-muted">UOM</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-text-muted">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBOM.lines.map((line: any, idx: number) => (
                        <tr key={line.id || idx} className="border-b border-border last:border-b-0">
                          <td className="px-3 py-2 text-text-muted">{line.lineNumber ?? (idx + 1) * 10}</td>
                          <td className="px-3 py-2">
                            <div className="text-text-primary">{line.componentItemName || line.componentItemNumber || '-'}</div>
                            {line.componentItemName && line.componentItemNumber && (
                              <div className="text-2xs text-text-muted">{line.componentItemNumber}</div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right text-text-primary">{line.quantityRequired ?? '-'}</td>
                          <td className="px-3 py-2 text-text-secondary">{line.unitOfMeasure || '-'}</td>
                          <td className="px-3 py-2 text-text-muted text-xs">{line.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-text-muted">No component lines defined.</p>
              )}
            </div>
          </div>
        )}
      </SlideOver>

      {/* ── Create BOM SlideOver ── */}
      <SlideOver
        open={mode === 'create'}
        onClose={closeSlideOver}
        title="New BOM"
        description="Create a new bill of materials"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeSlideOver}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isCreating || !bomName.trim() || !finishedItemId}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">BOM Name *</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Motor Assembly A-200 BOM"
              value={bomName}
              onChange={(e) => setBomName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Finished Item *</label>
            <select
              className={INPUT_CLS}
              value={finishedItemId}
              onChange={(e) => setFinishedItemId(e.target.value)}
            >
              <option value="">Select an item...</option>
              {items.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.itemName} ({item.itemNumber})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">BOM Type</label>
              <select
                className={INPUT_CLS}
                value={bomType}
                onChange={(e) => setBomType(e.target.value)}
              >
                {BOM_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Version</label>
              <input
                className={INPUT_CLS}
                type="number"
                min="1"
                placeholder="1"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Components
              <span className="font-normal text-text-muted ml-1">(one per line: itemName, quantity)</span>
            </label>
            <textarea
              className={INPUT_CLS + ' min-h-[100px]'}
              rows={5}
              placeholder={'Motor Housing, 1\nBall Bearing 6205, 2\nCopper Winding Wire, 50'}
              value={components}
              onChange={(e) => setComponents(e.target.value)}
            />
            <p className="text-xs text-text-muted mt-1">
              Enter each component on a new line. Format: component name, quantity. Quantity defaults to 1 if omitted.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bom-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border text-brand-500 focus:ring-brand-500"
            />
            <label htmlFor="bom-active" className="text-sm font-medium text-text-primary">
              Active
            </label>
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
          const result = await importBOMs(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(bomImportSchema)}
      />
    </div>
  );
}
