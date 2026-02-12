import { useMemo, useState } from 'react';
import { Plus, Upload, Pencil, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Badge, Button, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useImportEmployees } from '../../data-layer/hooks/useHRPayroll';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import { formatCurrency, employeeImportSchema, validateRow, coerceRow } from '@erp/shared';
import { type ColumnDef } from '@tanstack/react-table';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';
import GLAccountStrip from '../../components/GLAccountStrip';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-Time',
  part_time: 'Part-Time',
  contractor: 'Contractor',
  temporary: 'Temporary',
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  active: { label: 'Active', variant: 'success' },
  on_leave: { label: 'On Leave', variant: 'warning' },
  terminated: { label: 'Terminated', variant: 'danger' },
};

const PAY_FREQUENCY_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  semimonthly: 'Semi-Monthly',
  monthly: 'Monthly',
};

export default function EmployeesPage() {
  const { data: employees = [], isLoading } = useEmployees();
  const { mutate: createEmployee, isPending: isCreating } = useCreateEmployee();
  const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee();
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();
  const { mutateAsync: importEmployees } = useImportEmployees();
  const { isDemo } = useAppMode();

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);

  // Form fields
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employmentType, setEmploymentType] = useState('full_time');
  const [salary, setSalary] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [payFrequency, setPayFrequency] = useState('biweekly');
  const [status, setStatus] = useState('active');

  const resetForm = () => {
    setEmployeeNumber('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setHireDate('');
    setDepartment('');
    setJobTitle('');
    setEmploymentType('full_time');
    setSalary('');
    setHourlyRate('');
    setPayFrequency('biweekly');
    setStatus('active');
    setEditingEmployee(null);
  };

  const populateForm = (emp: any) => {
    setEmployeeNumber(emp.employeeNumber || '');
    setFirstName(emp.firstName || '');
    setLastName(emp.lastName || '');
    setEmail(emp.email || '');
    setPhone(emp.phone || '');
    setHireDate(emp.hireDate ? emp.hireDate.slice(0, 10) : '');
    setDepartment(emp.department || '');
    setJobTitle(emp.jobTitle || '');
    setEmploymentType(emp.employmentType || 'full_time');
    setSalary(emp.salary != null ? String(emp.salary) : '');
    setHourlyRate(emp.hourlyRate != null ? String(emp.hourlyRate) : '');
    setPayFrequency(emp.payFrequency || 'biweekly');
    setStatus(emp.employmentStatus || emp.status || 'active');
  };

  // --- Actions ---

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openView = (emp: any) => {
    setViewingEmployee(emp);
    setShowView(true);
  };

  const openEdit = (emp: any) => {
    setEditingEmployee(emp);
    populateForm(emp);
    setShowView(false);
    setShowForm(true);
  };

  const openDeleteConfirm = (emp: any) => {
    setViewingEmployee(emp);
    setShowView(false);
    setShowDeleteConfirm(true);
  };

  const handleSubmit = () => {
    const payload: Record<string, unknown> = {
      employeeNumber,
      firstName,
      lastName,
      email,
      phone,
      hireDate,
      department,
      jobTitle,
      employmentType,
      salary: salary ? parseFloat(salary) : undefined,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      payFrequency,
      employmentStatus: status,
    };

    if (editingEmployee) {
      updateEmployee(
        { id: editingEmployee.id, ...payload },
        {
          onSuccess: () => {
            setShowForm(false);
            resetForm();
          },
        },
      );
    } else {
      createEmployee(
        payload as any,
        {
          onSuccess: () => {
            setShowForm(false);
            resetForm();
          },
        },
      );
    }
  };

  const handleDelete = () => {
    if (!viewingEmployee) return;
    deleteEmployee(viewingEmployee.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        setViewingEmployee(null);
      },
    });
  };

  // --- Helpers ---

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (s: string) => {
    const config = STATUS_CONFIG[s];
    if (!config) return <Badge variant="default">{s}</Badge>;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // --- Table columns ---

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
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">{row.original.department || '-'}</span>
        ),
      },
      {
        accessorKey: 'jobTitle',
        header: 'Job Title',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">{row.original.jobTitle || '-'}</span>
        ),
      },
      {
        accessorKey: 'employmentType',
        header: 'Employment Type',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">
            {EMPLOYMENT_TYPE_LABELS[row.original.employmentType] || row.original.employmentType || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'employmentStatus',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.employmentStatus || row.original.status),
      },
      {
        accessorKey: 'salary',
        header: 'Salary',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.salary ? formatCurrency(Number(row.original.salary)) : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'hireDate',
        header: 'Hire Date',
        cell: ({ row }) => (
          <span className="text-sm text-text-secondary">{formatDate(row.original.hireDate)}</span>
        ),
      },
    ],
    [],
  );

  // --- KPI computations ---

  const kpiData = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(
      (emp: any) => (emp.employmentStatus || emp.status) === 'active',
    ).length;
    const onLeave = employees.filter(
      (emp: any) => (emp.employmentStatus || emp.status) === 'on_leave',
    ).length;
    const withSalary = employees.filter(
      (emp: any) => Number(emp.salary ?? 0) > 0,
    );
    const avgSalary =
      withSalary.length > 0
        ? withSalary.reduce((sum: number, emp: any) => sum + Number(emp.salary ?? 0), 0) /
          withSalary.length
        : 0;
    return { total, active, onLeave, avgSalary };
  }, [employees]);

  // --- Employee form fields JSX (shared between create and edit) ---

  const formFields = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Employee Number *</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. EMP-001"
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">First Name *</label>
          <input
            className={INPUT_CLS}
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Last Name *</label>
          <input
            className={INPUT_CLS}
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
        <input
          className={INPUT_CLS}
          type="email"
          placeholder="email@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
        <input
          className={INPUT_CLS}
          placeholder="(555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Hire Date *</label>
        <input
          className={INPUT_CLS}
          type="date"
          value={hireDate}
          onChange={(e) => setHireDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Department</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. Engineering, Sales"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Job Title</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. Software Engineer"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Employment Type</label>
        <select
          className={INPUT_CLS}
          value={employmentType}
          onChange={(e) => setEmploymentType(e.target.value)}
        >
          <option value="full_time">Full-Time</option>
          <option value="part_time">Part-Time</option>
          <option value="contractor">Contractor</option>
          <option value="temporary">Temporary</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Salary ($)</label>
          <input
            className={INPUT_CLS}
            type="number"
            placeholder="0.00"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Hourly Rate ($)</label>
          <input
            className={INPUT_CLS}
            type="number"
            placeholder="0.00"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Pay Frequency</label>
        <select
          className={INPUT_CLS}
          value={payFrequency}
          onChange={(e) => setPayFrequency(e.target.value)}
        >
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="semimonthly">Semi-Monthly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
        <select
          className={INPUT_CLS}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="on_leave">On Leave</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>
    </div>
  );

  // --- Loading skeleton ---

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-surface-2 animate-skeleton" />
        <div className="h-3 w-72 rounded bg-surface-2 animate-skeleton" />
        <div className="h-64 rounded-lg border border-border bg-surface-1 animate-skeleton mt-4" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Employees</h1>
          <p className="text-xs text-text-muted">
            Manage your workforce directory - {employees.length} employee{employees.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Employee
          </Button>
        </div>
      </div>

      {/* GL Account Links */}
      <GLAccountStrip module="employees" />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Employees</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{kpiData.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Active</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{kpiData.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">On Leave</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{kpiData.onLeave}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Avg Salary</p>
              <p className="text-lg font-bold text-brand-600 mt-2">{formatCurrency(kpiData.avgSalary)}</p>
            </div>
          </CardContent>
        </Card>
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
          <DataTable
            columns={columns}
            data={employees}
            searchable
            searchPlaceholder="Search by name, department, or employee number..."
            pageSize={15}
            emptyMessage="No employees found."
            onRowClick={openView}
          />
        </CardContent>
      </Card>

      {/* View Employee SlideOver */}
      <SlideOver
        open={showView}
        onClose={() => { setShowView(false); setViewingEmployee(null); }}
        title="Employee Details"
        description={viewingEmployee ? `${viewingEmployee.firstName} ${viewingEmployee.lastName}` : ''}
        width="md"
        footer={
          viewingEmployee ? (
            <>
              <Button
                variant="danger"
                size="sm"
                onClick={() => openDeleteConfirm(viewingEmployee)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openEdit(viewingEmployee)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { setShowView(false); setViewingEmployee(null); }}>
                Close
              </Button>
            </>
          ) : undefined
        }
      >
        {viewingEmployee && (
          <div className="space-y-5">
            {/* Name + Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-text-primary">
                  {viewingEmployee.firstName} {viewingEmployee.lastName}
                </p>
                <p className="text-sm text-text-muted">{viewingEmployee.employeeNumber}</p>
              </div>
              {getStatusBadge(viewingEmployee.employmentStatus || viewingEmployee.status)}
            </div>

            <hr className="border-border" />

            {/* Contact */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Contact Information</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-muted">Email</p>
                  <p className="text-sm text-text-primary">{viewingEmployee.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Phone</p>
                  <p className="text-sm text-text-primary">{viewingEmployee.phone || '-'}</p>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Employment */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Employment Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-muted">Department</p>
                  <p className="text-sm text-text-primary">{viewingEmployee.department || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Job Title</p>
                  <p className="text-sm text-text-primary">{viewingEmployee.jobTitle || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Employment Type</p>
                  <p className="text-sm text-text-primary">
                    {EMPLOYMENT_TYPE_LABELS[viewingEmployee.employmentType] || viewingEmployee.employmentType || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Hire Date</p>
                  <p className="text-sm text-text-primary">{formatDate(viewingEmployee.hireDate)}</p>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Compensation */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">Compensation</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-muted">Salary</p>
                  <p className="text-sm font-medium text-text-primary">
                    {viewingEmployee.salary ? formatCurrency(Number(viewingEmployee.salary)) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Hourly Rate</p>
                  <p className="text-sm font-medium text-text-primary">
                    {viewingEmployee.hourlyRate ? formatCurrency(Number(viewingEmployee.hourlyRate)) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Pay Frequency</p>
                  <p className="text-sm text-text-primary">
                    {PAY_FREQUENCY_LABELS[viewingEmployee.payFrequency] || viewingEmployee.payFrequency || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOver>

      {/* Create / Edit Employee SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => { setShowForm(false); resetForm(); }}
        title={editingEmployee ? 'Edit Employee' : 'New Employee'}
        description={editingEmployee ? `Editing ${editingEmployee.firstName} ${editingEmployee.lastName}` : 'Add a new employee to the directory'}
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? 'Saving...' : editingEmployee ? 'Update' : 'Save'}
            </Button>
          </>
        }
      >
        {formFields}
      </SlideOver>

      {/* Delete Confirmation SlideOver */}
      <SlideOver
        open={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setViewingEmployee(null); }}
        title="Delete Employee"
        description="This action cannot be undone"
        width="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => { setShowDeleteConfirm(false); setViewingEmployee(null); }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </>
        }
      >
        {viewingEmployee && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete the following employee? This will permanently remove their record from the system.
            </p>
            <div className="rounded-md border border-border bg-surface-0 p-4 space-y-2">
              <p className="text-sm font-medium text-text-primary">
                {viewingEmployee.firstName} {viewingEmployee.lastName}
              </p>
              <p className="text-xs text-text-muted">{viewingEmployee.employeeNumber}</p>
              <p className="text-xs text-text-muted">{viewingEmployee.department} - {viewingEmployee.jobTitle}</p>
            </div>
          </div>
        )}
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
            mappings.forEach((m) => {
              if (m.targetField && m.sourceColumn) {
                mapped[m.targetField] = row[m.sourceColumn] || '';
              }
            });
            const coerced = coerceRow(mapped, schema);
            const rowErrors = validateRow(coerced, schema);
            if (rowErrors.length > 0) {
              errors.push(...rowErrors.map((e) => ({ ...e, row: i + 2 })));
            } else {
              validData.push(coerced);
            }
          });
          return { validData, errors };
        }}
        onImport={async (data) => {
          if (isDemo) {
            return { success: data.length, errors: [] };
          }
          const result = await importEmployees(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(employeeImportSchema)}
      />
    </div>
  );
}
