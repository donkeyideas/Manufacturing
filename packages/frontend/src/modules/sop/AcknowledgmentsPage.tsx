import { useMemo, useState } from 'react';
import { DataTable, Badge } from '@erp/ui';
import { useSOPAcknowledgments } from '../../data-layer/hooks/useSOP';
import { CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { SOPAcknowledgment } from '@erp/shared';

interface AckRow {
  id: string;
  employeeName: string;
  sopTitle: string;
  dueDate: string;
  isAcknowledged: boolean;
  acknowledgedAt?: string;
}

const FILTER_OPTIONS = ['All', 'Acknowledged', 'Pending'];

export default function AcknowledgmentsPage() {
  const { data: acksData, isLoading } = useSOPAcknowledgments();
  const [statusFilter, setStatusFilter] = useState('All');

  const acknowledgments: SOPAcknowledgment[] = useMemo(() => acksData ?? [], [acksData]);

  const stats = useMemo(() => {
    const total = acknowledgments.length;
    const acknowledged = acknowledgments.filter((a: SOPAcknowledgment) => a.isAcknowledged).length;
    const pending = total - acknowledged;
    const overdue = acknowledgments.filter(
      (a: SOPAcknowledgment) => !a.isAcknowledged && a.dueDate && new Date(a.dueDate) < new Date()
    ).length;
    return { total, acknowledged, pending, overdue };
  }, [acknowledgments]);

  const filteredData: AckRow[] = useMemo(() => {
    let items: SOPAcknowledgment[] = acknowledgments;
    if (statusFilter === 'Acknowledged') {
      items = items.filter((a: SOPAcknowledgment) => a.isAcknowledged);
    } else if (statusFilter === 'Pending') {
      items = items.filter((a: SOPAcknowledgment) => !a.isAcknowledged);
    }
    return items.map((a: SOPAcknowledgment) => ({
      id: a.id,
      employeeName: a.employeeName,
      sopTitle: a.sopTitle,
      dueDate: a.dueDate,
      isAcknowledged: a.isAcknowledged,
      acknowledgedAt: a.acknowledgedAt,
    }));
  }, [acknowledgments, statusFilter]);

  const columns: ColumnDef<AckRow, unknown>[] = useMemo(
    () => [
      { accessorKey: 'employeeName', header: 'Employee Name' },
      { accessorKey: 'sopTitle', header: 'SOP Title' },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        size: 120,
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return date ? new Date(date).toLocaleDateString() : '-';
        },
      },
      {
        accessorKey: 'isAcknowledged',
        header: 'Status',
        size: 140,
        cell: ({ getValue }) => {
          const acked = getValue() as boolean;
          return (
            <Badge variant={acked ? 'success' : 'warning'}>
              {acked ? 'Acknowledged' : 'Pending'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'acknowledgedAt',
        header: 'Acknowledged Date',
        size: 160,
        cell: ({ getValue }) => {
          const date = getValue() as string | undefined;
          return date ? new Date(date).toLocaleDateString() : '-';
        },
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">SOP Acknowledgments</h1>
        <p className="text-xs text-text-muted">Track employee acknowledgment status for all SOPs</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-4 w-4" />} label="Total" value={stats.total} color="text-brand-600" bg="bg-brand-50 dark:bg-brand-950" />
        <StatCard icon={<CheckCircle className="h-4 w-4" />} label="Acknowledged" value={stats.acknowledged} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-950" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Pending" value={stats.pending} color="text-amber-600" bg="bg-amber-50 dark:bg-amber-950" />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Overdue" value={stats.overdue} color="text-red-600" bg="bg-red-50 dark:bg-red-950" />
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={isLoading}
        searchPlaceholder="Search by employee or SOP..."
        toolbar={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-border bg-surface-0 px-3 text-sm text-text-primary"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        }
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-1">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-muted">{label}</p>
      </div>
    </div>
  );
}
