import { useMemo, useState } from 'react';
import { Plus, Upload, Trash2, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Button,
  SlideOver,
  ImportWizard,
  ExportButton,
} from '@erp/ui';
import {
  useRoutings,
  useCreateRouting,
  useDeleteRouting,
} from '../../data-layer/hooks/useManufacturing';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import { routingImportSchema, validateRow, coerceRow } from '@erp/shared';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS =
  'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

type SlideOverMode = 'closed' | 'view' | 'create';

export default function RoutingsPage() {
  const { data: routings = [], isLoading } = useRoutings();
  const { mutate: createRouting, isPending: isCreating } = useCreateRouting();
  const { mutate: deleteRouting, isPending: isDeleting } = useDeleteRouting();
  const { isDemo } = useAppMode();

  // SlideOver state
  const [mode, setMode] = useState<SlideOverMode>('closed');
  const [showImport, setShowImport] = useState(false);
  const [selectedRouting, setSelectedRouting] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state (create)
  const [routingName, setRoutingName] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setRoutingName('');
    setDescription('');
  };

  const openCreate = () => {
    resetForm();
    setSelectedRouting(null);
    setMode('create');
  };

  const openView = (routing: any) => {
    setSelectedRouting(routing);
    setShowDeleteConfirm(false);
    setMode('view');
  };

  const closeSlideOver = () => {
    setMode('closed');
    setSelectedRouting(null);
    setShowDeleteConfirm(false);
    resetForm();
  };

  const handleCreate = () => {
    createRouting(
      {
        routingName: routingName.trim(),
        description: description.trim() || undefined,
      },
      { onSuccess: closeSlideOver },
    );
  };

  const handleDelete = () => {
    if (!selectedRouting) return;
    deleteRouting(selectedRouting.id, { onSuccess: closeSlideOver });
  };

  // ── Table columns ──
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'routingName',
        header: 'Routing Name',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.routingName || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary min-w-[200px]">
            {row.original.description || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.createdAt
              ? new Date(row.original.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '-'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              className="p-1.5 rounded hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
              title="View details"
              onClick={(e) => {
                e.stopPropagation();
                openView(row.original);
              }}
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        ),
        size: 60,
      },
    ],
    [],
  );

  // ── Detail row helper ──
  const detailRow = (label: string, value: React.ReactNode) => (
    <div
      key={label}
      className="flex items-start justify-between py-2 border-b border-border last:border-b-0"
    >
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm text-text-primary text-right max-w-[60%]">
        {value ?? '-'}
      </span>
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
          <h1 className="text-lg font-semibold text-text-primary">Routings</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Define step-by-step production processes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowImport(true)}
          >
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Routing
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      {(() => {
        const totalRoutings = routings.length;
        const uniqueProducts = new Set(routings.map((r: any) => r.finishedItemId).filter(Boolean)).size;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Total Routings</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{totalRoutings.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Linked Products</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">{uniqueProducts.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-text-muted">Avg Steps / Routing</p>
                  <p className="text-2xl font-bold text-text-primary mt-2">1.0</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      {/* Routings Table */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(routings, 'routings')}
              onExportExcel={() => exportToExcel(routings, 'routings')}
            />
          </div>
          <DataTable
            columns={columns}
            data={routings}
            searchable
            searchPlaceholder="Search routings..."
            pageSize={15}
            emptyMessage="No routings found."
            onRowClick={openView}
          />
        </CardContent>
      </Card>

      {/* ── View Routing SlideOver ── */}
      <SlideOver
        open={mode === 'view'}
        onClose={closeSlideOver}
        title={selectedRouting?.routingName ?? 'Routing Details'}
        description={selectedRouting?.routingNumber || ''}
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeSlideOver}>
              Close
            </Button>
            {!showDeleteConfirm ? (
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            )}
          </>
        }
      >
        {selectedRouting && (
          <div>
            {detailRow('Routing Name', selectedRouting.routingName)}
            {detailRow('Routing Number', selectedRouting.routingNumber || '-')}
            {detailRow('Description', selectedRouting.description || '-')}
            {detailRow(
              'Created',
              selectedRouting.createdAt
                ? new Date(selectedRouting.createdAt).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    },
                  )
                : '-',
            )}
            {detailRow(
              'Updated',
              selectedRouting.updatedAt
                ? new Date(selectedRouting.updatedAt).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    },
                  )
                : '-',
            )}
          </div>
        )}
      </SlideOver>

      {/* ── Create Routing SlideOver ── */}
      <SlideOver
        open={mode === 'create'}
        onClose={closeSlideOver}
        title="New Routing"
        description="Define a new production routing"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeSlideOver}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !routingName.trim()}
            >
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Routing Name *
            </label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Assembly Line A Routing"
              value={routingName}
              onChange={(e) => setRoutingName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Description
            </label>
            <textarea
              className={INPUT_CLS}
              rows={3}
              placeholder="Optional description of this routing"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
          if (isDemo) {
            return { success: data.length, errors: [] };
          }
          // No bulk import endpoint for routings; create each individually
          let successCount = 0;
          const importErrors: any[] = [];
          for (let i = 0; i < data.length; i++) {
            try {
              await new Promise<void>((resolve, reject) => {
                createRouting(
                  {
                    routingName:
                      (data[i].routingName as string) || `Imported Routing ${i + 1}`,
                    description: (data[i].description as string) || undefined,
                  },
                  {
                    onSuccess: () => resolve(),
                    onError: (err) => reject(err),
                  },
                );
              });
              successCount++;
            } catch (err: any) {
              importErrors.push({
                row: i + 2,
                field: 'routingName',
                message: err?.message || 'Failed to create routing',
              });
            }
          }
          return { success: successCount, errors: importErrors };
        }}
        onDownloadTemplate={() => downloadTemplate(routingImportSchema)}
      />
    </div>
  );
}
