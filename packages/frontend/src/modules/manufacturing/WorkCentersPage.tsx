import { useMemo, useState } from 'react';
import { Plus, Upload, Eye, Pencil, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { workCenterImportSchema, validateRow, coerceRow } from '@erp/shared';
import { useWorkCenters, useCreateWorkCenter, useUpdateWorkCenter, useDeleteWorkCenter, useImportWorkCenters } from '../../data-layer/hooks/useManufacturing';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function WorkCentersPage() {
  const { data: workCenters = [], isLoading } = useWorkCenters();
  const { mutate: createWorkCenter, isPending: isCreating } = useCreateWorkCenter();
  const { mutate: updateWorkCenter, isPending: isUpdating } = useUpdateWorkCenter();
  const { mutate: deleteWorkCenter, isPending: isDeleting } = useDeleteWorkCenter();
  const { mutateAsync: importWorkCenters } = useImportWorkCenters();
  const { isDemo } = useAppMode();

  // ── SlideOver state ──
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ── Form fields ──
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formHourlyRate, setFormHourlyRate] = useState('');
  const [formEfficiency, setFormEfficiency] = useState('');
  const [formCapacity, setFormCapacity] = useState('');
  const [formSetupTime, setFormSetupTime] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const resetForm = () => {
    setFormCode('');
    setFormName('');
    setFormDescription('');
    setFormLocation('');
    setFormHourlyRate('');
    setFormEfficiency('');
    setFormCapacity('');
    setFormSetupTime('');
    setFormIsActive(true);
  };

  const populateForm = (wc: any) => {
    setFormCode(wc.workCenterCode ?? '');
    setFormName(wc.workCenterName ?? '');
    setFormDescription(wc.description ?? '');
    setFormLocation(wc.location ?? '');
    setFormHourlyRate(wc.hourlyRate != null ? String(wc.hourlyRate) : '');
    setFormEfficiency(wc.efficiencyPercent != null ? String(wc.efficiencyPercent) : '');
    setFormCapacity(wc.capacityHoursPerDay != null ? String(wc.capacityHoursPerDay) : '');
    setFormSetupTime(wc.setupTimeMinutes != null ? String(wc.setupTimeMinutes) : '');
    setFormIsActive(wc.isActive ?? true);
  };

  // ── Actions ──
  const handleCreate = () => {
    createWorkCenter(
      {
        workCenterCode: formCode,
        workCenterName: formName,
        description: formDescription || undefined,
        location: formLocation || undefined,
        hourlyRate: formHourlyRate ? parseFloat(formHourlyRate) : undefined,
        efficiencyPercent: formEfficiency ? parseFloat(formEfficiency) : undefined,
        capacityHoursPerDay: formCapacity ? parseFloat(formCapacity) : undefined,
        setupTimeMinutes: formSetupTime ? parseInt(formSetupTime, 10) : undefined,
        isActive: formIsActive,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!selectedWorkCenter) return;
    updateWorkCenter(
      {
        id: selectedWorkCenter.id,
        workCenterCode: formCode,
        workCenterName: formName,
        description: formDescription || undefined,
        location: formLocation || undefined,
        hourlyRate: formHourlyRate ? parseFloat(formHourlyRate) : undefined,
        efficiencyPercent: formEfficiency ? parseFloat(formEfficiency) : undefined,
        capacityHoursPerDay: formCapacity ? parseFloat(formCapacity) : undefined,
        setupTimeMinutes: formSetupTime ? parseInt(formSetupTime, 10) : undefined,
        isActive: formIsActive,
      },
      {
        onSuccess: () => {
          setShowView(false);
          setIsEditing(false);
          setSelectedWorkCenter(null);
          resetForm();
        },
      },
    );
  };

  const handleDelete = () => {
    if (!selectedWorkCenter) return;
    if (!window.confirm(`Delete work center "${selectedWorkCenter.workCenterName}"? This cannot be undone.`)) return;
    deleteWorkCenter(selectedWorkCenter.id, {
      onSuccess: () => {
        setShowView(false);
        setIsEditing(false);
        setSelectedWorkCenter(null);
        resetForm();
      },
    });
  };

  const handleRowClick = (workCenter: any) => {
    setSelectedWorkCenter(workCenter);
    populateForm(workCenter);
    setIsEditing(false);
    setShowView(true);
  };

  const handleStartEdit = () => {
    if (selectedWorkCenter) populateForm(selectedWorkCenter);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (selectedWorkCenter) populateForm(selectedWorkCenter);
    setIsEditing(false);
  };

  // ── Table columns ──
  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'workCenterCode',
        header: 'Code',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.workCenterCode}
          </span>
        ),
      },
      {
        accessorKey: 'workCenterName',
        header: 'Name',
        cell: ({ row }) => (
          <span className="text-xs font-medium text-text-primary">
            {row.original.workCenterName}
          </span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary min-w-[200px]">
            {row.original.description || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.location || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'hourlyRate',
        header: 'Hourly Rate',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.hourlyRate != null ? `$${Number(row.original.hourlyRate).toFixed(2)}` : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'efficiencyPercent',
        header: 'Efficiency',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.efficiencyPercent != null ? `${row.original.efficiencyPercent}%` : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'capacityHoursPerDay',
        header: 'Capacity (hrs/day)',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.capacityHoursPerDay != null ? `${row.original.capacityHoursPerDay}h` : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'setupTimeMinutes',
        header: 'Setup Time',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.setupTimeMinutes != null ? `${row.original.setupTimeMinutes} min` : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'default'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    [],
  );

  // ── Shared form fields (used in both create and edit) ──
  const renderFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Work Center Code</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. WC-001"
          value={formCode}
          onChange={(e) => setFormCode(e.target.value)}
          disabled={isEditing}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Work Center Name</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. Assembly Line A"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
        <textarea
          className={INPUT_CLS}
          rows={3}
          placeholder="Optional description"
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Location</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. Building A, Floor 2"
          value={formLocation}
          onChange={(e) => setFormLocation(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Hourly Rate ($)</label>
          <input
            type="number"
            className={INPUT_CLS}
            min="0"
            step="0.01"
            placeholder="e.g. 50.00"
            value={formHourlyRate}
            onChange={(e) => setFormHourlyRate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Efficiency (%)</label>
          <input
            type="number"
            className={INPUT_CLS}
            min="0"
            max="100"
            step="0.1"
            placeholder="e.g. 95"
            value={formEfficiency}
            onChange={(e) => setFormEfficiency(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Capacity (hrs/day)</label>
          <input
            type="number"
            className={INPUT_CLS}
            min="0"
            step="0.5"
            placeholder="e.g. 8"
            value={formCapacity}
            onChange={(e) => setFormCapacity(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Setup Time (min)</label>
          <input
            type="number"
            className={INPUT_CLS}
            min="0"
            placeholder="e.g. 15"
            value={formSetupTime}
            onChange={(e) => setFormSetupTime(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={formIsActive}
            onChange={(e) => setFormIsActive(e.target.checked)}
          />
          <div className="w-9 h-5 bg-surface-3 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500" />
        </label>
        <span className="text-xs font-medium text-text-secondary">Active</span>
      </div>
    </div>
  );

  // ── View detail (read-only) ──
  const renderViewDetails = () => {
    if (!selectedWorkCenter) return null;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Work Center Code</label>
          <p className="text-sm text-text-primary">{selectedWorkCenter.workCenterCode}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Work Center Name</label>
          <p className="text-sm text-text-primary">{selectedWorkCenter.workCenterName}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Description</label>
          <p className="text-sm text-text-primary">{selectedWorkCenter.description || '-'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Location</label>
          <p className="text-sm text-text-primary">{selectedWorkCenter.location || '-'}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-0.5">Hourly Rate</label>
            <p className="text-sm text-text-primary">
              {selectedWorkCenter.hourlyRate != null ? `$${Number(selectedWorkCenter.hourlyRate).toFixed(2)}` : '-'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-0.5">Efficiency</label>
            <p className="text-sm text-text-primary">
              {selectedWorkCenter.efficiencyPercent != null ? `${selectedWorkCenter.efficiencyPercent}%` : '-'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-0.5">Capacity (hrs/day)</label>
            <p className="text-sm text-text-primary">
              {selectedWorkCenter.capacityHoursPerDay != null ? `${selectedWorkCenter.capacityHoursPerDay}h` : '-'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-0.5">Setup Time</label>
            <p className="text-sm text-text-primary">
              {selectedWorkCenter.setupTimeMinutes != null ? `${selectedWorkCenter.setupTimeMinutes} min` : '-'}
            </p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Status</label>
          <Badge variant={selectedWorkCenter.isActive ? 'success' : 'default'}>
            {selectedWorkCenter.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
    );
  };

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
          <h1 className="text-lg font-semibold text-text-primary">Work Centers</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage production work centers and capacity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Work Center
          </Button>
        </div>
      </div>

      {/* Work Centers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Work Centers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(workCenters, 'work-centers')}
              onExportExcel={() => exportToExcel(workCenters, 'work-centers')}
            />
          </div>
          <DataTable
            columns={columns}
            data={workCenters}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>

      {/* New Work Center SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Work Center"
        description="Add a new production work center"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        {renderFormFields()}
      </SlideOver>

      {/* View / Edit Work Center SlideOver */}
      <SlideOver
        open={showView}
        onClose={() => {
          setShowView(false);
          setIsEditing(false);
          setSelectedWorkCenter(null);
          resetForm();
        }}
        title={isEditing ? 'Edit Work Center' : 'Work Center Details'}
        description={
          isEditing
            ? 'Update work center information'
            : selectedWorkCenter?.workCenterCode ?? ''
        }
        width="md"
        footer={
          isEditing ? (
            <>
              <Button variant="secondary" onClick={handleCancelEdit} disabled={isUpdating}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button onClick={handleStartEdit}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </>
          )
        }
      >
        {isEditing ? renderFormFields() : renderViewDetails()}
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={workCenterImportSchema}
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
          const result = await importWorkCenters(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(workCenterImportSchema)}
      />
    </div>
  );
}
