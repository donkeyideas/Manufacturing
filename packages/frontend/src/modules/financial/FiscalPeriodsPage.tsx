import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { useFiscalPeriods } from '../../data-layer/hooks/useFinancial';
import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function FiscalPeriodsPage() {
  const { data: fetchedPeriods = [] } = useFiscalPeriods();
  const [localPeriods, setLocalPeriods] = useState<any[]>([]);
  const periods = useMemo(() => [...localPeriods, ...fetchedPeriods], [localPeriods, fetchedPeriods]);

  // ── SlideOver form state ──
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formStartDate, setFormStartDate] = useState('2024-12-01');
  const [formEndDate, setFormEndDate] = useState('2024-12-31');
  const [formStatus, setFormStatus] = useState('open');

  const resetForm = () => {
    setFormName('');
    setFormStartDate('2024-12-01');
    setFormEndDate('2024-12-31');
    setFormStatus('open');
  };

  const handleSubmit = () => {
    const newPeriod = {
      id: `fp-${String(periods.length + 1001).padStart(4, '0')}`,
      periodName: formName,
      startDate: formStartDate,
      endDate: formEndDate,
      status: formStatus,
      closedBy: formStatus === 'closed' ? 'Admin' : '',
      closedAt: formStatus === 'closed' ? '2024-12-15T10:00:00Z' : '',
    };
    setLocalPeriods((prev) => [newPeriod, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '\u2014';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'periodName',
        header: 'Period',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.periodName}</span>
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'open' ? 'success' : 'default'}>
            {row.original.status === 'open' ? 'Open' : 'Closed'}
          </Badge>
        ),
      },
      {
        accessorKey: 'closedBy',
        header: 'Closed By',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {row.original.closedBy || '\u2014'}
          </span>
        ),
      },
      {
        accessorKey: 'closedAt',
        header: 'Closed At',
        cell: ({ row }) => (
          <span className="text-sm text-text-muted">
            {formatDateTime(row.original.closedAt)}
          </span>
        ),
      },
    ],
    []
  );

  const openPeriods = periods.filter((p) => p.status === 'open').length;
  const closedPeriods = periods.filter((p) => p.status === 'closed').length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Fiscal Periods</h1>
          <p className="text-xs text-text-muted">
            Manage fiscal periods and period closings - {openPeriods} open, {closedPeriods} closed
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          New Period
        </Button>
      </div>

      {/* Fiscal Periods Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Fiscal Periods</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={periods} searchPlaceholder="Search periods..." />
        </CardContent>
      </Card>

      {/* New Period SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Fiscal Period"
        description="Add a new fiscal period"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Period Name</label>
            <input className={INPUT_CLS} placeholder="e.g. January 2025" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Start Date</label>
            <input type="date" className={INPUT_CLS} value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">End Date</label>
            <input type="date" className={INPUT_CLS} value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select className={INPUT_CLS} value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
