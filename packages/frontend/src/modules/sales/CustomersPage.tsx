import { useMemo, useState } from 'react';
import { UserPlus, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, DataTable, Badge, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, customerImportSchema, validateRow, coerceRow } from '@erp/shared';
import { getCustomers } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';
import type { Customer } from '@erp/shared';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function CustomersPage() {
  const [customers, setCustomers] = useState(() => getCustomers());

  // ── SlideOver form state ──
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCompany('');
    setFormAddress('');
    setFormStatus('active');
  };

  const handleSubmit = () => {
    const custNum = customers.length + 1001;
    const newCustomer = {
      id: `cust-${String(customers.length + 1001).padStart(4, '0')}`,
      tenantId: 'tenant-demo',
      customerNumber: `CUST-${custNum}`,
      customerName: formCompany || formName,
      legalName: formCompany || formName,
      contactName: formName,
      contactEmail: formEmail,
      contactPhone: formPhone,
      paymentTerms: 'Net 30',
      creditLimit: 50000,
      isActive: formStatus === 'active',
      createdAt: '2024-12-15T08:00:00Z',
      updatedAt: '2024-12-15T08:00:00Z',
      createdBy: 'system',
      updatedBy: 'system',
    };
    setCustomers((prev) => [newCustomer as any, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<Customer>[] = useMemo(
    () => [
      {
        accessorKey: 'customerNumber',
        header: 'Customer #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.customerNumber}
          </span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Name',
        cell: ({ row }) => (
          <span className="text-text-primary">{row.original.customerName}</span>
        ),
      },
      {
        accessorKey: 'contactName',
        header: 'Contact',
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.contactName || '-'}</span>
        ),
      },
      {
        accessorKey: 'contactEmail',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.contactEmail || '-'}</span>
        ),
      },
      {
        accessorKey: 'paymentTerms',
        header: 'Payment Terms',
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.paymentTerms || '-'}</span>
        ),
      },
      {
        accessorKey: 'creditLimit',
        header: 'Credit Limit',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.creditLimit ? formatCurrency(row.original.creditLimit) : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'default'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Customers</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Manage customer accounts and contact information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(customers, 'customers')}
              onExportExcel={() => exportToExcel(customers, 'customers')}
            />
          </div>
          <DataTable columns={columns} data={customers} />
        </CardContent>
      </Card>

      {/* New Customer SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Customer"
        description="Add a new customer to the system"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Contact Name</label>
            <input className={INPUT_CLS} placeholder="e.g. John Smith" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <input type="email" className={INPUT_CLS} placeholder="e.g. john@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
            <input className={INPUT_CLS} placeholder="e.g. (555) 123-4567" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Company</label>
            <input className={INPUT_CLS} placeholder="e.g. Acme Corporation" value={formCompany} onChange={(e) => setFormCompany(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Address</label>
            <textarea className={INPUT_CLS} rows={2} placeholder="Street address, City, State, ZIP" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select className={INPUT_CLS} value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={customerImportSchema}
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
          const newCustomers = data.map((row, i) => ({
            id: `import-${Date.now()}-${i}`,
            tenantId: 'tenant-demo',
            ...row,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'import',
          }));
          setCustomers((prev: any[]) => [...newCustomers, ...prev]);
          return { success: data.length, errors: [] };
        }}
        onDownloadTemplate={() => downloadTemplate(customerImportSchema)}
      />
    </div>
  );
}
