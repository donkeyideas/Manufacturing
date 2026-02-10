import { useMemo, useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { useEmployees } from '../../data-layer/hooks/useHRPayroll';
import { formatCurrency, employeeImportSchema, validateRow, coerceRow } from '@erp/shared';
import { type ColumnDef } from '@tanstack/react-table';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function EmployeesPage() {
  const { data, isLoading } = useEmployees();
  const [localEmployees, setLocalEmployees] = useState<any[]>([]);
  const employees = [...localEmployees, ...(data ?? [])];

  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [empStatus, setEmpStatus] = useState('active');

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setDepartment('');
    setPosition('');
    setStartDate('');
    setEmpStatus('active');
  };

  const handleSubmit = () => {
    const id = `EMP-${String(employees.length + 900).padStart(3, '0')}`;
    const newEmployee = {
      id,
      employeeNumber: id,
      firstName: firstName || 'New',
      lastName: lastName || 'Employee',
      email: email || `${(firstName || 'new').toLowerCase()}.${(lastName || 'employee').toLowerCase()}@company.com`,
      department: department || 'General',
      jobTitle: position || 'Staff',
      employmentStatus: empStatus,
      salary: 55000,
      hireDate: startDate || '2024-12-01',
    };
    setLocalEmployees([newEmployee, ...localEmployees]);
    setShowForm(false);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      active: 'success',
      on_leave: 'warning',
      terminated: 'danger',
    };
    const labels: Record<string, string> = {
      active: 'Active',
      on_leave: 'On Leave',
      terminated: 'Terminated',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const columns: ColumnDef<any, any>[] = useMemo(
    () => [
      {
        accessorKey: 'employeeNumber',
        header: 'Employee #',
        cell: ({ row }) => (
          <span className="font-medium text-primary">{row.original.employeeNumber}</span>
        ),
      },
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-text-primary">
              {row.original.firstName} {row.original.lastName}
            </p>
            <p className="text-xs text-text-muted">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
      },
      {
        accessorKey: 'jobTitle',
        header: 'Job Title',
      },
      {
        accessorKey: 'employmentStatus',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.employmentStatus),
      },
      {
        accessorKey: 'salary',
        header: 'Salary',
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.salary)}
          </span>
        ),
      },
      {
        accessorKey: 'hireDate',
        header: 'Hire Date',
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.hireDate)}</span>
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
          <h1 className="text-lg font-semibold text-text-primary">Employees</h1>
          <p className="text-xs text-text-muted">
            Manage your workforce directory - {employees.length} employees
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Employee
          </Button>
        </div>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(employees, 'employees')}
              onExportExcel={() => exportToExcel(employees, 'employees')}
            />
          </div>
          <DataTable columns={columns} data={employees} />
        </CardContent>
      </Card>

      {/* New Employee SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Employee"
        description="Add a new employee to the directory"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">First Name</label>
              <input className={INPUT_CLS} placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Last Name</label>
              <input className={INPUT_CLS} placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
            <input className={INPUT_CLS} type="email" placeholder="email@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Department</label>
            <input className={INPUT_CLS} placeholder="e.g. Engineering, Sales" value={department} onChange={e => setDepartment(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Position</label>
            <input className={INPUT_CLS} placeholder="Job title" value={position} onChange={e => setPosition(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Start Date</label>
            <input className={INPUT_CLS} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
            <select className={INPUT_CLS} value={empStatus} onChange={e => setEmpStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={employeeImportSchema}
        onParseFile={parseFile}
        onAutoMap={autoMapColumns}
        onValidateRows={(rows, mappings, schema) => {
          const validData: Record<string, unknown>[] = [];
          const errors: any[] = [];
          rows.forEach((row, i) => {
            const mapped: Record<string, string> = {};
            mappings.forEach(m => {
              if (m.targetField && m.sourceColumn) {
                mapped[m.targetField] = row[m.sourceColumn] || '';
              }
            });
            const coerced = coerceRow(mapped, schema);
            const rowErrors = validateRow(coerced, schema);
            if (rowErrors.length > 0) {
              errors.push(...rowErrors.map(e => ({ ...e, row: i + 2 })));
            } else {
              validData.push(coerced);
            }
          });
          return { validData, errors };
        }}
        onImport={async (data) => {
          const newEmployees = data.map((row, i) => ({
            id: `import-${Date.now()}-${i}`,
            tenantId: 'tenant-demo',
            ...row,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'import',
          }));
          setLocalEmployees((prev: any[]) => [...newEmployees, ...prev]);
          return { success: data.length, errors: [] };
        }}
        onDownloadTemplate={() => downloadTemplate(employeeImportSchema)}
      />
    </div>
  );
}
