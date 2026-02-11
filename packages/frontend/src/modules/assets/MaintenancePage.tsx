import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, SlideOver, Button } from '@erp/ui';
import { getMaintenanceRecords } from '@erp/demo-data';
import { formatCurrency } from '@erp/shared';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function MaintenancePage() {
  const { isDemo } = useAppMode();
  const [records, setRecords] = useState<any[]>(() => isDemo ? getMaintenanceRecords() : []);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [assetName, setAssetName] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('preventive');
  const [scheduledDate, setScheduledDate] = useState('2024-12-20');
  const [assignedTo, setAssignedTo] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const resetForm = () => {
    setAssetName('');
    setMaintenanceType('preventive');
    setScheduledDate('2024-12-20');
    setAssignedTo('');
    setDescription('');
    setPriority('medium');
  };

  const handleSubmit = () => {
    if (!assetName.trim() || !description.trim()) return;
    const newRecord = {
      id: `maint-${Date.now()}`,
      assetId: `asset-new-${Date.now()}`,
      assetNumber: `FA-${String(records.length + 500).padStart(3, '0')}`,
      assetName: assetName.trim(),
      maintenanceType,
      maintenanceDate: new Date(scheduledDate).toISOString(),
      description: description.trim(),
      cost: 0,
      performedBy: assignedTo.trim() || 'Unassigned',
      nextMaintenanceDate: new Date(
        new Date(scheduledDate).getTime() + 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
      notes: `Priority: ${priority}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
    };
    setRecords((prev) => [newRecord, ...prev]);
    resetForm();
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMaintenanceTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
      preventive: 'success',
      corrective: 'danger',
      inspection: 'info',
    };
    const labels: Record<string, string> = {
      preventive: 'Preventive',
      corrective: 'Corrective',
      inspection: 'Inspection',
    };
    return <Badge variant={variants[type] || 'default'}>{labels[type] || type}</Badge>;
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
        accessorKey: 'maintenanceType',
        header: 'Type',
        cell: ({ row }) => getMaintenanceTypeBadge(row.original.maintenanceType),
      },
      {
        accessorKey: 'maintenanceDate',
        header: 'Maintenance Date',
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.maintenanceDate)}</span>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="text-sm text-text-primary truncate">{row.original.description}</p>
          </div>
        ),
      },
      {
        accessorKey: 'cost',
        header: 'Cost',
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.cost)}
          </span>
        ),
      },
      {
        accessorKey: 'performedBy',
        header: 'Performed By',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">{row.original.performedBy}</span>
        ),
      },
      {
        accessorKey: 'nextMaintenanceDate',
        header: 'Next Maintenance',
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.nextMaintenanceDate)}</span>
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
          <h1 className="text-lg font-semibold text-text-primary">Maintenance Records</h1>
          <p className="text-xs text-text-muted">
            Track and manage asset maintenance activities - {records.length} records
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Schedule Maintenance
        </button>
      </div>

      {/* Maintenance Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Maintenance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={records} />
        </CardContent>
      </Card>

      {/* Schedule Maintenance SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Schedule Maintenance"
        description="Schedule a new maintenance activity"
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Asset *</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. CNC Milling Machine"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Type</label>
            <select
              className={INPUT_CLS}
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value)}
            >
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Scheduled Date</label>
            <input
              type="date"
              className={INPUT_CLS}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Assigned To</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. TechServ Maintenance Co."
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description *</label>
            <textarea
              className={INPUT_CLS}
              rows={3}
              placeholder="Describe the maintenance activity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Priority</label>
            <select
              className={INPUT_CLS}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
