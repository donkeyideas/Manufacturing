import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, SlideOver, Button } from '@erp/ui';
import { getProjects } from '@erp/demo-data';
import { formatCurrency } from '@erp/shared';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState(() => getProjects());
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [projectName, setProjectName] = useState('');
  const [client, setClient] = useState('');
  const [startDate, setStartDate] = useState('2024-12-01');
  const [endDate, setEndDate] = useState('2025-06-30');
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState('planning');
  const [manager, setManager] = useState('');

  const resetForm = () => {
    setProjectName('');
    setClient('');
    setStartDate('2024-12-01');
    setEndDate('2025-06-30');
    setBudget('');
    setStatus('planning');
    setManager('');
  };

  const handleSubmit = () => {
    if (!projectName.trim()) return;
    const newProject = {
      id: `prj-${Date.now()}`,
      projectNumber: `PRJ-${String(projects.length + 500).padStart(3, '0')}`,
      projectName: projectName.trim(),
      description: client.trim() ? `Client: ${client.trim()}` : '',
      status,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      budget: parseFloat(budget) || 0,
      actualCost: 0,
      managerName: manager.trim() || 'Unassigned',
      completionPercent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
    };
    setProjects((prev) => [newProject, ...prev]);
    resetForm();
    setShowForm(false);
  };

  const getStatusBadge = (s: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
      planning: 'default',
      active: 'success',
      on_hold: 'warning',
      completed: 'info',
      cancelled: 'danger',
    };
    const labels: Record<string, string> = {
      planning: 'Planning',
      active: 'Active',
      on_hold: 'On Hold',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return <Badge variant={variants[s] || 'default'}>{labels[s] || s}</Badge>;
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'projectNumber',
        header: 'Project #',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.projectNumber}</span>
        ),
      },
      {
        accessorKey: 'projectName',
        header: 'Project Name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-text-primary">{row.original.projectName}</p>
            {row.original.description && (
              <p className="text-xs text-text-muted mt-1 line-clamp-1">{row.original.description}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'managerName',
        header: 'Manager',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.managerName}</span>
        ),
      },
      {
        accessorKey: 'budget',
        header: 'Budget',
        cell: ({ row }) => (
          <span className="font-medium">{formatCurrency(row.original.budget)}</span>
        ),
      },
      {
        accessorKey: 'actualCost',
        header: 'Actual Cost',
        cell: ({ row }) => (
          <span className="font-medium">{formatCurrency(row.original.actualCost)}</span>
        ),
      },
      {
        accessorKey: 'completionPercent',
        header: 'Completion',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full"
                style={{ width: `${row.original.completionPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-text-muted">
              {row.original.completionPercent}%
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => (
          <span className="text-sm">
            {new Date(row.original.startDate).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) => (
          <span className="text-sm">
            {new Date(row.original.endDate).toLocaleDateString()}
          </span>
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
          <h1 className="text-lg font-semibold text-text-primary">Projects</h1>
          <p className="text-xs text-text-muted">
            Manage and track all projects - {projects.length} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={projects} />
        </CardContent>
      </Card>

      {/* New Project SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Project"
        description="Create a new project"
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Name *</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. New Assembly Line Automation"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Client</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Internal / Acme Corp"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Start Date</label>
              <input
                type="date"
                className={INPUT_CLS}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">End Date</label>
              <input
                type="date"
                className={INPUT_CLS}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Budget ($)</label>
            <input
              type="number"
              className={INPUT_CLS}
              placeholder="e.g. 250000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
            <select
              className={INPUT_CLS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Manager</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. Sarah Chen"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
            />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
