import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver } from '@erp/ui';
import { usePayrollRuns } from '../../data-layer/hooks/useHRPayroll';
import { formatCurrency } from '@erp/shared';
import { type ColumnDef } from '@tanstack/react-table';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function PayrollRunsPage() {
  const { data, isLoading } = usePayrollRuns();
  const [localRuns, setLocalRuns] = useState<any[]>([]);
  const payrollRuns = [...localRuns, ...(data ?? [])];

  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [period, setPeriod] = useState('');
  const [payDate, setPayDate] = useState('');
  const [dept, setDept] = useState('All');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setPeriod('');
    setPayDate('');
    setDept('All');
    setDescription('');
  };

  const handleSubmit = () => {
    const id = `PR-${String(payrollRuns.length + 900).padStart(3, '0')}`;
    const newRun = {
      id,
      employeeName: dept === 'All' ? 'All Departments' : dept,
      payDate: payDate || '2024-12-31',
      grossPay: 5200,
      totalDeductions: 1560,
      netPay: 3640,
      paymentMethod: 'direct_deposit',
      isPosted: false,
      period: period || 'December 2024',
      description: description || 'Regular payroll run',
    };
    setLocalRuns([newRun, ...localRuns]);
    setShowForm(false);
    resetForm();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'employeeName',
        header: 'Employee',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.employeeName}</span>
        ),
      },
      {
        accessorKey: 'payDate',
        header: 'Pay Date',
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.payDate)}</span>
        ),
      },
      {
        accessorKey: 'grossPay',
        header: 'Gross Pay',
        cell: ({ row }) => (
          <span className="font-medium text-green-600">
            {formatCurrency(row.original.grossPay)}
          </span>
        ),
      },
      {
        accessorKey: 'totalDeductions',
        header: 'Total Deductions',
        cell: ({ row }) => (
          <span className="font-medium text-red-600">
            {formatCurrency(row.original.totalDeductions)}
          </span>
        ),
      },
      {
        accessorKey: 'netPay',
        header: 'Net Pay',
        cell: ({ row }) => (
          <span className="font-bold">
            {formatCurrency(row.original.netPay)}
          </span>
        ),
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Payment Method',
        cell: ({ row }) => (
          <span className="text-sm capitalize">
            {row.original.paymentMethod.replace('_', ' ')}
          </span>
        ),
      },
      {
        accessorKey: 'isPosted',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isPosted ? 'success' : 'default'}>
            {row.original.isPosted ? 'Posted' : 'Pending'}
          </Badge>
        ),
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
          <h1 className="text-lg font-semibold text-text-primary">Payroll Runs</h1>
          <p className="text-xs text-text-muted">
            View and manage payroll processing - {payrollRuns.length} records
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Run Payroll
        </Button>
      </div>

      {/* Payroll Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payroll Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={payrollRuns} />
        </CardContent>
      </Card>

      {/* Run Payroll SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Run Payroll"
        description="Create a new payroll run"
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
            <label className="block text-xs font-medium text-text-secondary mb-1">Period</label>
            <input className={INPUT_CLS} placeholder="e.g. December 2024" value={period} onChange={e => setPeriod(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Pay Date</label>
            <input className={INPUT_CLS} type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Department</label>
            <select className={INPUT_CLS} value={dept} onChange={e => setDept(e.target.value)}>
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
            <input className={INPUT_CLS} placeholder="Payroll run description" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
