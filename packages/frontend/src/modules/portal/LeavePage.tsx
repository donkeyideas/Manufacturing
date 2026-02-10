import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, SlideOver, ProgressBar, DataTable } from '@erp/ui';
import { Plus } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { useLeaveBalances, usePortalLeaveRequests } from '../../data-layer/hooks/usePortal';
import type { ColumnDef } from '@tanstack/react-table';
import type { LeaveBalance, PortalLeaveRequest } from '@erp/shared';

const columnHelper = createColumnHelper<PortalLeaveRequest>();

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

const columns = [
  columnHelper.accessor('type', { header: 'Type' }),
  columnHelper.accessor('startDate', {
    header: 'Start',
    cell: (info) => new Date(info.getValue() + 'T12:00:00').toLocaleDateString(),
  }),
  columnHelper.accessor('endDate', {
    header: 'End',
    cell: (info) => new Date(info.getValue() + 'T12:00:00').toLocaleDateString(),
  }),
  columnHelper.accessor('totalDays', {
    header: 'Days',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const status = info.getValue();
      return <Badge className={statusStyles[status]}>{status}</Badge>;
    },
  }),
  columnHelper.accessor('submittedAt', {
    header: 'Submitted',
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
];

const leaveColors: Record<string, 'brand' | 'success' | 'warning' | 'info'> = {
  Vacation: 'brand',
  'Sick Leave': 'success',
  Personal: 'warning',
};

export default function LeavePage() {
  const { data: balancesData } = useLeaveBalances();
  const { data: requestsData, isLoading } = usePortalLeaveRequests();
  const [slideOpen, setSlideOpen] = useState(false);

  const balances = useMemo(() => balancesData ?? [], [balancesData]);
  const requests = useMemo(() => requestsData ?? [], [requestsData]);

  const [form, setForm] = useState({
    type: 'Vacation',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const handleSubmit = () => {
    setSlideOpen(false);
    setForm({ type: 'Vacation', startDate: '', endDate: '', reason: '' });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Leave Management</h1>
          <p className="text-xs text-text-muted">View balances and request time off</p>
        </div>
        <Button onClick={() => setSlideOpen(true)}>
          <Plus className="h-4 w-4" />
          Request Leave
        </Button>
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balances.map((bal: LeaveBalance) => (
          <Card key={bal.type}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-text-primary">{bal.type}</h3>
                {bal.pending > 0 && (
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                    {bal.pending} pending
                  </Badge>
                )}
              </div>
              <ProgressBar
                value={bal.available}
                max={bal.accrued}
                label={`${bal.available} available of ${bal.accrued} accrued`}
                color={leaveColors[bal.type] ?? 'brand'}
                size="lg"
              />
              <p className="text-xs text-text-muted mt-2">
                Used: {bal.used} days
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leave Request History */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns as ColumnDef<PortalLeaveRequest, unknown>[]}
            data={requests}
            loading={isLoading}
            searchable={false}
            pageSize={10}
            emptyMessage="No leave requests found."
          />
        </CardContent>
      </Card>

      {/* Request Leave SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title="Request Leave"
        description="Submit a new leave request for approval"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSlideOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Submit Request</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Leave Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-surface-0 px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Vacation">Vacation</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-surface-0 px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              End Date
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full h-9 rounded-md border border-border bg-surface-0 px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Reason
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={4}
              placeholder="Provide a reason for your leave request..."
              className="w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
