import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, SlideOver, Button } from '@erp/ui';
import { getSprints } from '@erp/demo-data';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function SprintsPage() {
  const [sprints, setSprints] = useState(() => getSprints());
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [sprintName, setSprintName] = useState('');
  const [project, setProject] = useState('');
  const [startDate, setStartDate] = useState('2024-12-02');
  const [endDate, setEndDate] = useState('2024-12-16');
  const [goal, setGoal] = useState('');
  const [capacity, setCapacity] = useState('');

  const resetForm = () => {
    setSprintName('');
    setProject('');
    setStartDate('2024-12-02');
    setEndDate('2024-12-16');
    setGoal('');
    setCapacity('');
  };

  const handleSubmit = () => {
    if (!sprintName.trim()) return;
    const totalPts = parseInt(capacity) || 30;
    const newSprint = {
      id: `spr-${Date.now()}`,
      projectId: project.trim() || 'prj-1',
      sprintName: sprintName.trim(),
      sprintNumber: sprints.length + 1,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: 'planning',
      goal: goal.trim() || 'Sprint goal',
      totalPoints: totalPts,
      completedPoints: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
    };
    setSprints((prev) => [newSprint, ...prev]);
    resetForm();
    setShowForm(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'info'> = {
      planning: 'default',
      active: 'success',
      completed: 'info',
    };
    const labels: Record<string, string> = {
      planning: 'Planning',
      active: 'Active',
      completed: 'Completed',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'sprintName',
        header: 'Sprint',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.sprintName}</span>
        ),
      },
      {
        accessorKey: 'sprintNumber',
        header: '#',
        cell: ({ row }) => (
          <span>{row.original.sprintNumber}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
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
      {
        accessorKey: 'goal',
        header: 'Goal',
        cell: ({ row }) => (
          <p className="text-sm text-text-primary line-clamp-1">{row.original.goal}</p>
        ),
      },
      {
        accessorKey: 'totalPoints',
        header: 'Total Points',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.totalPoints}</span>
        ),
      },
      {
        accessorKey: 'completedPoints',
        header: 'Completed',
        cell: ({ row }) => (
          <span className="text-sm">{row.original.completedPoints}</span>
        ),
      },
      {
        id: 'progress',
        header: 'Progress',
        cell: ({ row }) => {
          const percent =
            row.original.totalPoints > 0
              ? Math.round(
                  (row.original.completedPoints / row.original.totalPoints) * 100
                )
              : 0;
          return (
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-text-muted">{percent}%</span>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Sprints</h1>
          <p className="text-xs text-text-muted">
            Plan and track sprint progress - {sprints.length} sprints
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          New Sprint
        </button>
      </div>

      {/* Sprints Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sprints</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={sprints} />
        </CardContent>
      </Card>

      {/* New Sprint SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Sprint"
        description="Plan a new sprint"
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
              placeholder="e.g. Sprint 5"
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Project</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g. PRJ-001 or project name"
              value={project}
              onChange={(e) => setProject(e.target.value)}
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Goal</label>
            <textarea
              className={INPUT_CLS}
              rows={3}
              placeholder="What should this sprint accomplish?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Capacity (story points)</label>
            <input
              type="number"
              className={INPUT_CLS}
              placeholder="e.g. 30"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
