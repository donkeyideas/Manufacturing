import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { usePayrollPeriods } from '../../data-layer/hooks/useHRPayroll';
import type { ColumnDef } from '@tanstack/react-table';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PayrollPeriodsPage() {
  const { data, isLoading } = usePayrollPeriods();
  const [localPeriods, setLocalPeriods] = useState<any[]>([]);
  const periods = [...localPeriods, ...(data ?? [])];
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [periodName, setPeriodName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [payDate, setPayDate] = useState('');
  const [periodStatus, setPeriodStatus] = useState('open');

  const resetForm = () => {
    setPeriodName('');
    setStartDate('');
    setEndDate('');
    setPayDate('');
    setPeriodStatus('open');
  };

  const handleSubmit = () => {
    const id = `PP-${String(periods.length + 900).padStart(3, '0')}`;
    const newPeriod = {
      id,
      periodName: periodName || 'New Period',
      periodType: 'biweekly',
      startDate: startDate || '2024-12-16',
      endDate: endDate || '2024-12-31',
      payDate: payDate || '2024-12-31',
      isClosed: periodStatus === 'closed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
    };
    setLocalPeriods([newPeriod, ...localPeriods]);
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'periodName',
        header: 'Period',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.periodName}
          </span>
        ),
      },
      {
        accessorKey: 'periodType',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary capitalize">
            {row.original.periodType}
          </span>
        ),
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {formatDate(row.original.startDate)}
          </span>
        ),
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) => (
          <span className="text-xs text-text-secondary">
            {formatDate(row.original.endDate)}
          </span>
        ),
      },
      {
        accessorKey: 'payDate',
        header: 'Pay Date',
        cell: ({ row }) => (
          <span className="text-xs font-medium text-text-primary">
            {formatDate(row.original.payDate)}
          </span>
        ),
      },
      {
        accessorKey: 'isClosed',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isClosed ? 'default' : 'success'}>
            {row.original.isClosed ? 'Closed' : 'Open'}
          </Badge>
        ),
      },
    ],
    []
  );

  if (isLoading) return null;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Payroll Periods</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage payroll period schedules and status
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Period
        </Button>
      </div>

      {/* Payroll Periods Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payroll Periods</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={periods} />
        </CardContent>
      </Card>

      {/* New Period SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Period"
        description="Create a new payroll period"
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
            <input className={INPUT_CLS} placeholder="e.g. Dec 16-31 2024" value={periodName} onChange={e => setPeriodName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Start Date</label>
            <input className={INPUT_CLS} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">End Date</label>
            <input className={INPUT_CLS} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Pay Date</label>
            <input className={INPUT_CLS} type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
            <select className={INPUT_CLS} value={periodStatus} onChange={e => setPeriodStatus(e.target.value)}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
