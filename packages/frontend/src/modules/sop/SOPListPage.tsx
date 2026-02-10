import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Badge, Button } from '@erp/ui';
import { useSOPs } from '../../data-layer/hooks/useSOP';
import { Plus } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { SOP } from '@erp/shared';

interface SOPRow {
  id: string;
  sopNumber: string;
  title: string;
  department: string;
  version: string;
  status: string;
  effectiveDate: string;
}

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'warning' | 'info'> = {
  published: 'success',
  draft: 'default',
  under_review: 'warning',
  archived: 'info',
};

const STATUS_LABEL: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  under_review: 'Under Review',
  archived: 'Archived',
};

const DEPARTMENTS = ['All', 'Manufacturing', 'Quality', 'Warehouse', 'Shipping', 'Safety'];
const STATUSES = ['All', 'published', 'draft', 'under_review', 'archived'];

export default function SOPListPage() {
  const navigate = useNavigate();
  const { data: sopsData, isLoading } = useSOPs();
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredSOPs = useMemo(() => {
    let items: SOP[] = sopsData ?? [];
    if (deptFilter !== 'All') {
      items = items.filter((s: SOP) => s.department === deptFilter);
    }
    if (statusFilter !== 'All') {
      items = items.filter((s: SOP) => s.status === statusFilter);
    }
    return items.map((s: SOP) => ({
      id: s.id,
      sopNumber: s.sopNumber,
      title: s.title,
      department: s.department,
      version: s.version,
      status: s.status,
      effectiveDate: s.effectiveDate,
    }));
  }, [sopsData, deptFilter, statusFilter]);

  const columns: ColumnDef<SOPRow, unknown>[] = useMemo(
    () => [
      { accessorKey: 'sopNumber', header: 'SOP Number', size: 130 },
      { accessorKey: 'title', header: 'Title' },
      { accessorKey: 'department', header: 'Department', size: 130 },
      { accessorKey: 'version', header: 'Version', size: 80 },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <Badge variant={STATUS_VARIANT[status] || 'default'}>
              {STATUS_LABEL[status] || status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'effectiveDate',
        header: 'Effective Date',
        size: 120,
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return date ? new Date(date).toLocaleDateString() : '-';
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 100,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/sop/${row.original.id}`);
              }}
            >
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/sop/${row.original.id}/edit`);
              }}
            >
              Edit
            </Button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Standard Operating Procedures</h1>
          <p className="text-xs text-text-muted">Manage and track all SOPs across departments</p>
        </div>
        <Button onClick={() => navigate('/sop/new')}>
          <Plus className="h-4 w-4 mr-1" />
          Create SOP
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredSOPs}
        loading={isLoading}
        searchPlaceholder="Search SOPs..."
        onRowClick={(row) => navigate(`/sop/${row.id}`)}
        toolbar={
          <>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface-0 px-3 text-sm text-text-primary"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-surface-0 px-3 text-sm text-text-primary"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : STATUS_LABEL[s] || s}
                </option>
              ))}
            </select>
          </>
        }
      />
    </div>
  );
}
