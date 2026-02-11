import { useMemo, useState } from 'react';
import { UserPlus, Upload, Pencil, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, DataTable, Badge, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, customerImportSchema, validateRow, coerceRow } from '@erp/shared';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, useImportCustomers } from '../../data-layer/hooks/useSales';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import type { Customer } from '@erp/shared';
import { parseFile } from '../../utils/file-parsers';
import { autoMapColumns } from '../../utils/column-mapper';
import { downloadTemplate, exportToCSV, exportToExcel } from '../../utils/export-utils';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const PAYMENT_TERMS_OPTIONS = [
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
  'Due on Receipt',
  '2/10 Net 30',
] as const;

export default function CustomersPage() {
  const { data: customers = [], isLoading } = useCustomers();
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();
  const { mutateAsync: importCustomers } = useImportCustomers();
  const { isDemo } = useAppMode();

  // ── SlideOver state ──
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ── Form fields ──
  const [formCustomerNumber, setFormCustomerNumber] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formPaymentTerms, setFormPaymentTerms] = useState('Net 30');
  const [formCreditLimit, setFormCreditLimit] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  const resetForm = () => {
    setFormCustomerNumber('');
    setFormCustomerName('');
    setFormContactName('');
    setFormContactEmail('');
    setFormContactPhone('');
    setFormPaymentTerms('Net 30');
    setFormCreditLimit('');
    setFormStatus('active');
  };

  const populateForm = (c: Customer) => {
    setFormCustomerNumber(c.customerNumber);
    setFormCustomerName(c.customerName);
    setFormContactName(c.contactName ?? '');
    setFormContactEmail(c.contactEmail ?? '');
    setFormContactPhone(c.contactPhone ?? '');
    setFormPaymentTerms(c.paymentTerms ?? 'Net 30');
    setFormCreditLimit(c.creditLimit != null ? String(c.creditLimit) : '');
    setFormStatus(c.isActive ? 'active' : 'inactive');
  };

  // ── Actions ──
  const handleCreate = () => {
    createCustomer(
      {
        customerNumber: formCustomerNumber,
        customerName: formCustomerName,
        contactName: formContactName || undefined,
        contactEmail: formContactEmail || undefined,
        contactPhone: formContactPhone || undefined,
        paymentTerms: formPaymentTerms,
        creditLimit: formCreditLimit ? parseFloat(formCreditLimit) : undefined,
        isActive: formStatus === 'active',
      },
      {
        onSuccess: () => {
          setShowForm(false);
          resetForm();
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!selectedCustomer) return;
    updateCustomer(
      {
        id: selectedCustomer.id,
        customerNumber: formCustomerNumber,
        customerName: formCustomerName,
        contactName: formContactName || undefined,
        contactEmail: formContactEmail || undefined,
        contactPhone: formContactPhone || undefined,
        paymentTerms: formPaymentTerms,
        creditLimit: formCreditLimit ? parseFloat(formCreditLimit) : undefined,
        isActive: formStatus === 'active',
      },
      {
        onSuccess: () => {
          setShowView(false);
          setIsEditing(false);
          setSelectedCustomer(null);
          resetForm();
        },
      },
    );
  };

  const handleDelete = () => {
    if (!selectedCustomer) return;
    if (!window.confirm(`Delete customer "${selectedCustomer.customerName}"? This cannot be undone.`)) return;
    deleteCustomer(selectedCustomer.id, {
      onSuccess: () => {
        setShowView(false);
        setIsEditing(false);
        setSelectedCustomer(null);
        resetForm();
      },
    });
  };

  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    populateForm(customer);
    setIsEditing(false);
    setShowView(true);
  };

  const handleStartEdit = () => {
    if (selectedCustomer) populateForm(selectedCustomer);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (selectedCustomer) populateForm(selectedCustomer);
    setIsEditing(false);
  };

  // ── Table columns ──
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
        header: 'Customer Name',
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
            {row.original.creditLimit != null ? formatCurrency(row.original.creditLimit) : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? 'success' : 'default'}>
            {row.original.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    [],
  );

  // ── Shared form fields (used in both create and edit) ──
  const renderFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Customer Number</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. CUST-1001"
          value={formCustomerNumber}
          onChange={(e) => setFormCustomerNumber(e.target.value)}
          disabled={isEditing}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Customer Name</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. Acme Corporation"
          value={formCustomerName}
          onChange={(e) => setFormCustomerName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Contact Name</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. John Smith"
          value={formContactName}
          onChange={(e) => setFormContactName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Contact Email</label>
        <input
          type="email"
          className={INPUT_CLS}
          placeholder="e.g. john@example.com"
          value={formContactEmail}
          onChange={(e) => setFormContactEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Contact Phone</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. (555) 123-4567"
          value={formContactPhone}
          onChange={(e) => setFormContactPhone(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Payment Terms</label>
        <select
          className={INPUT_CLS}
          value={formPaymentTerms}
          onChange={(e) => setFormPaymentTerms(e.target.value)}
        >
          {PAYMENT_TERMS_OPTIONS.map((term) => (
            <option key={term} value={term}>{term}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Credit Limit ($)</label>
        <input
          type="number"
          className={INPUT_CLS}
          placeholder="e.g. 50000"
          value={formCreditLimit}
          onChange={(e) => setFormCreditLimit(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
        <select
          className={INPUT_CLS}
          value={formStatus}
          onChange={(e) => setFormStatus(e.target.value)}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );

  // ── View detail (read-only) ──
  const renderViewDetails = () => {
    if (!selectedCustomer) return null;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Customer Number</label>
          <p className="text-sm text-text-primary">{selectedCustomer.customerNumber}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Customer Name</label>
          <p className="text-sm text-text-primary">{selectedCustomer.customerName}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Contact Name</label>
          <p className="text-sm text-text-primary">{selectedCustomer.contactName || '-'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Contact Email</label>
          <p className="text-sm text-text-primary">{selectedCustomer.contactEmail || '-'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Contact Phone</label>
          <p className="text-sm text-text-primary">{selectedCustomer.contactPhone || '-'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Payment Terms</label>
          <p className="text-sm text-text-primary">{selectedCustomer.paymentTerms || '-'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Credit Limit</label>
          <p className="text-sm text-text-primary">
            {selectedCustomer.creditLimit != null ? formatCurrency(selectedCustomer.creditLimit) : '-'}
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-0.5">Status</label>
          <Badge variant={selectedCustomer.isActive ? 'success' : 'default'}>
            {selectedCustomer.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>
    );
  };

  // ── Loading skeleton ──
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
          <Button variant="primary" size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
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
          <DataTable
            columns={columns}
            data={customers}
            onRowClick={handleRowClick}
          />
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
            <Button variant="secondary" onClick={() => setShowForm(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Saving...' : 'Save'}
            </Button>
          </>
        }
      >
        {renderFormFields()}
      </SlideOver>

      {/* View / Edit Customer SlideOver */}
      <SlideOver
        open={showView}
        onClose={() => {
          setShowView(false);
          setIsEditing(false);
          setSelectedCustomer(null);
          resetForm();
        }}
        title={isEditing ? 'Edit Customer' : 'Customer Details'}
        description={
          isEditing
            ? 'Update customer information'
            : selectedCustomer?.customerNumber ?? ''
        }
        width="md"
        footer={
          isEditing ? (
            <>
              <Button variant="secondary" onClick={handleCancelEdit} disabled={isUpdating}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button onClick={handleStartEdit}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </>
          )
        }
      >
        {isEditing ? renderFormFields() : renderViewDetails()}
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
          const result = await importCustomers(data);
          return { success: result.successCount ?? data.length, errors: result.errors ?? [] };
        }}
        onDownloadTemplate={() => downloadTemplate(customerImportSchema)}
      />
    </div>
  );
}
