import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { useLeaveRequests } from '../../data-layer/hooks/useHRPayroll';
import { type ColumnDef } from '@tanstack/react-table';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function LeaveRequestsPage() {
  const { data, isLoading } = useLeaveRequests();
  const [localRequests, setLocalRequests] = useState<any[]>([]);
  const leaveRequests = [...localRequests, ...(data ?? [])];

  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [employee, setEmployee] = useState('');
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const resetForm = () => {
    setEmployee('');
    setLeaveType('annual');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const handleSubmit = () => {
    const id = `LR-${String(leaveRequests.length + 900).padStart(3, '0')}`;
    const start = startDate || '2024-12-20';
    const end = endDate || '2024-12-24';
    const days = Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const newRequest = {
      id,
      requestNumber: id,
      employeeName: employee || 'New Employee',
      leaveType: leaveType,
      startDate: start,
      endDate: end,
      totalDays: days,
      status: 'pending',
      reason: reason || '',
    };
    setLocalRequests([newRequest, ...localRequests]);
    setShowForm(false);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      approved: 'success',
      pending: 'warning',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'default'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'requestNumber',
        header: 'Request #',
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.requestNumber}</span>
        ),
      },
      {
        accessorKey: 'employeeName',
        header: 'Employee',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.employeeName}</span>
        ),
      },
      {
        accessorKey: 'leaveType',
        header: 'Leave Type',
        cell: ({ row }) => (
          <span className="text-sm capitalize">{row.original.leaveType}</span>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.startDate)}</span>
        ),
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.endDate)}</span>
        ),
      },
      {
        accessorKey: 'totalDays',
        header: 'Days',
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.totalDays}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
    ],
    []
  );

  if (isLoading) return null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Leave Requests</h1>
          <p className="text-xs text-text-muted">
            Track and manage employee leave requests - {leaveRequests.length} requests
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Leave Request
        </Button>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={leaveRequests} />
        </CardContent>
      </Card>

      {/* New Leave Request SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Leave Request"
        description="Submit a new leave request"
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Employee</label>
            <input className={INPUT_CLS} placeholder="Employee name" value={employee} onChange={e => setEmployee(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Type</label>
            <select className={INPUT_CLS} value={leaveType} onChange={e => setLeaveType(e.target.value)}>
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="personal">Personal</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Start Date</label>
              <input className={INPUT_CLS} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">End Date</label>
              <input className={INPUT_CLS} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Reason</label>
            <textarea className={INPUT_CLS + ' min-h-[60px]'} placeholder="Reason for leave" rows={3} value={reason} onChange={e => setReason(e.target.value)} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
