import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { getWorkCenters } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function WorkCentersPage() {
  const [workCenters, setWorkCenters] = useState(() => getWorkCenters());
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [capacity, setCapacity] = useState('');
  const [shift, setShift] = useState('Day');
  const [hourlyRate, setHourlyRate] = useState('');
  const [wcStatus, setWcStatus] = useState('active');

  const resetForm = () => {
    setName('');
    setDepartment('');
    setCapacity('');
    setShift('Day');
    setHourlyRate('');
    setWcStatus('active');
  };

  const handleSubmit = () => {
    const id = `WC-${String(workCenters.length + 900).padStart(3, '0')}`;
    const newWorkCenter = {
      id,
      workCenterCode: id,
      workCenterName: name || 'New Work Center',
      description: `${department || 'Production'} - ${shift} Shift`,
      location: department || 'Main Floor',
      hourlyRate: Number(hourlyRate) || 50,
      efficiencyPercent: 95,
      capacityHoursPerDay: Number(capacity) || 8,
      setupTimeMinutes: 15,
      isActive: wcStatus === 'active',
      tenantId: 'tenant-demo',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorkCenters([newWorkCenter, ...workCenters]);
    setShowForm(false);
    resetForm();
  };

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
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.location}
          </span>
        ),
      },
      {
        accessorKey: 'hourlyRate',
        header: 'Hourly Rate',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            ${row.original.hourlyRate.toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'efficiencyPercent',
        header: 'Efficiency',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.efficiencyPercent}%
          </span>
        ),
      },
      {
        accessorKey: 'capacityHoursPerDay',
        header: 'Capacity (hrs/day)',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.capacityHoursPerDay}h
          </span>
        ),
      },
      {
        accessorKey: 'setupTimeMinutes',
        header: 'Setup Time',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {row.original.setupTimeMinutes} min
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
    []
  );

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
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Work Center
        </Button>
      </div>

      {/* Work Centers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Work Centers</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={workCenters} />
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
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
            <input className={INPUT_CLS} placeholder="Work center name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Department</label>
            <input className={INPUT_CLS} placeholder="e.g. Assembly, Machining" value={department} onChange={e => setDepartment(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Capacity (hours/day)</label>
            <input className={INPUT_CLS} type="number" min="1" placeholder="8" value={capacity} onChange={e => setCapacity(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Shift</label>
            <select className={INPUT_CLS} value={shift} onChange={e => setShift(e.target.value)}>
              <option value="Day">Day</option>
              <option value="Night">Night</option>
              <option value="Swing">Swing</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Hourly Rate ($)</label>
            <input className={INPUT_CLS} type="number" min="0" step="0.01" placeholder="50.00" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
            <select className={INPUT_CLS} value={wcStatus} onChange={e => setWcStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
