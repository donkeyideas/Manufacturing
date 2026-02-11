import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge } from '@erp/ui';
import { Clock } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { useClockEntries } from '../../data-layer/hooks/usePortal';
import { getWorkOrders } from '@erp/demo-data';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import type { ClockEntry } from '@erp/shared';

const columnHelper = createColumnHelper<ClockEntry>();

const columns = [
  columnHelper.accessor('date', {
    header: 'Date',
    cell: (info) => new Date(info.getValue() + 'T12:00:00').toLocaleDateString(),
  }),
  columnHelper.accessor('clockIn', {
    header: 'Clock In',
    cell: (info) => new Date(info.getValue()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }),
  columnHelper.accessor('clockOut', {
    header: 'Clock Out',
    cell: (info) => {
      const v = info.getValue();
      return v ? new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
    },
  }),
  columnHelper.accessor('regularHours', {
    header: 'Regular',
    cell: (info) => `${info.getValue()}h`,
  }),
  columnHelper.accessor('overtimeHours', {
    header: 'OT',
    cell: (info) => info.getValue() > 0 ? `${info.getValue()}h` : '--',
  }),
  columnHelper.accessor('totalHours', {
    header: 'Total',
    cell: (info) => info.getValue() > 0 ? `${info.getValue()}h` : '--',
  }),
  columnHelper.accessor('workOrderNumber', {
    header: 'Work Order',
    cell: (info) => info.getValue() ?? '--',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const status = info.getValue();
      const styles: Record<string, string> = {
        active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
        completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        edited: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
      };
      return <Badge className={styles[status]}>{status}</Badge>;
    },
  }),
];

export default function TimeClockPage() {
  const { isDemo } = useAppMode();
  const { data: clockEntries, isLoading } = useClockEntries();
  const [clockedIn, setClockedIn] = useState(true);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState('');

  const entries = useMemo(() => clockEntries ?? [], [clockEntries]);
  const workOrders = useMemo(() => isDemo ? getWorkOrders() : [], [isDemo]);
  const activeEntry = useMemo(
    () => entries.find((e: ClockEntry) => e.status === 'active'),
    [entries]
  );

  const elapsedTime = useMemo(() => {
    if (!activeEntry?.clockIn || !clockedIn) return null;
    const start = new Date(activeEntry.clockIn);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }, [activeEntry, clockedIn]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Time Clock</h1>
        <p className="text-xs text-text-muted">Track your working hours</p>
      </div>

      {/* Clock In/Out Card */}
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
              <Clock className="h-8 w-8 text-text-muted" />
            </div>

            <div className="text-center">
              {clockedIn ? (
                <>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Currently Clocked In
                  </p>
                  {elapsedTime && (
                    <p className="text-2xl font-bold text-text-primary mt-1">{elapsedTime}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-medium text-text-muted">Not Clocked In</p>
              )}
            </div>

            {/* Work order selector */}
            <div className="w-64">
              <label className="block text-xs text-text-muted mb-1">
                Work Order (optional)
              </label>
              <select
                value={selectedWorkOrder}
                onChange={(e) => setSelectedWorkOrder(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-surface-0 px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No work order</option>
                {workOrders.map((wo) => (
                  <option key={wo.id} value={wo.id}>
                    {wo.workOrderNumber} - {wo.finishedItemName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setClockedIn(!clockedIn)}
              className={`px-12 py-4 rounded-xl text-base font-semibold text-white transition-colors shadow-lg ${
                clockedIn
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {clockedIn ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* This Week's Time */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Time</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns as ColumnDef<ClockEntry, unknown>[]}
            data={entries}
            loading={isLoading}
            searchable={false}
            pageSize={10}
            emptyMessage="No time entries found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
