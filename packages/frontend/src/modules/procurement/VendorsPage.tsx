import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, DataTable, Button, Badge, SlideOver, ImportWizard, ExportButton } from '@erp/ui';
import { formatCurrency, vendorImportSchema, validateRow, coerceRow } from '@erp/shared';
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor, useImportVendors } from '../../data-layer/hooks/useProcurement';
import { useAppMode } from '../../data-layer/providers/AppModeProvider';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, Upload, Plus } from 'lucide-react';
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
];

interface VendorFormState {
  vendorNumber: string;
  vendorName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  paymentTerms: string;
  creditLimit: string;
  is1099Eligible: boolean;
  isActive: boolean;
}

const EMPTY_FORM: VendorFormState = {
  vendorNumber: '',
  vendorName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  paymentTerms: 'Net 30',
  creditLimit: '',
  is1099Eligible: false,
  isActive: true,
};

export default function VendorsPage() {
  const { isDemo } = useAppMode();
  const { data: vendors = [], isLoading } = useVendors();
  const { mutate: createVendor, isPending: isCreating } = useCreateVendor();
  const { mutate: updateVendor, isPending: isUpdating } = useUpdateVendor();
  const { mutate: deleteVendor, isPending: isDeleting } = useDeleteVendor();
  const { mutate: importVendors } = useImportVendors();

  // SlideOver state
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  // Form state
  const [form, setForm] = useState<VendorFormState>(EMPTY_FORM);

  const resetForm = () => setForm(EMPTY_FORM);

  const setField = <K extends keyof VendorFormState>(key: K, value: VendorFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // -- Handlers --

  const handleCreate = () => {
    createVendor(
      {
        vendorNumber: form.vendorNumber,
        vendorName: form.vendorName,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        paymentTerms: form.paymentTerms,
        creditLimit: parseFloat(form.creditLimit) || 0,
        is1099Eligible: form.is1099Eligible,
        isActive: form.isActive,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          resetForm();
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!selectedVendor) return;
    updateVendor(
      {
        id: selectedVendor.id,
        vendorNumber: form.vendorNumber,
        vendorName: form.vendorName,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        paymentTerms: form.paymentTerms,
        creditLimit: parseFloat(form.creditLimit) || 0,
        is1099Eligible: form.is1099Eligible,
        isActive: form.isActive,
      },
      {
        onSuccess: () => {
          setShowEdit(false);
          setSelectedVendor(null);
          resetForm();
        },
      },
    );
  };

  const handleDelete = () => {
    if (!selectedVendor) return;
    if (!window.confirm(`Delete vendor "${selectedVendor.vendorName || selectedVendor.name}"? This action cannot be undone.`)) return;
    deleteVendor(selectedVendor.id, {
      onSuccess: () => {
        setShowView(false);
        setShowEdit(false);
        setSelectedVendor(null);
      },
    });
  };

  const openView = (vendor: any) => {
    setSelectedVendor(vendor);
    setShowView(true);
  };

  const openEdit = () => {
    if (!selectedVendor) return;
    setForm({
      vendorNumber: selectedVendor.vendorNumber ?? '',
      vendorName: selectedVendor.vendorName ?? selectedVendor.name ?? '',
      contactName: selectedVendor.contactName ?? '',
      contactEmail: selectedVendor.contactEmail ?? '',
      contactPhone: selectedVendor.contactPhone ?? selectedVendor.phone ?? '',
      paymentTerms: selectedVendor.paymentTerms ?? 'Net 30',
      creditLimit: selectedVendor.creditLimit != null ? String(selectedVendor.creditLimit) : '',
      is1099Eligible: !!selectedVendor.is1099Eligible,
      isActive: selectedVendor.isActive !== false,
    });
    setShowView(false);
    setShowEdit(true);
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  // -- Columns --

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'vendorNumber',
        header: 'Vendor #',
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.vendorNumber}</span>
        ),
      },
      {
        accessorKey: 'vendorName',
        header: 'Name',
        cell: ({ row }) => (
          <span className="text-text-primary">{row.original.vendorName ?? row.original.name}</span>
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
            {row.original.creditLimit != null
              ? formatCurrency(Number(row.original.creditLimit))
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'is1099Eligible',
        header: '1099',
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            {row.original.is1099Eligible ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <span className="text-text-muted">-</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive !== false ? 'success' : 'default'}>
            {row.original.isActive !== false ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    [],
  );

  // -- Shared form fields renderer --

  const renderFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Vendor Number</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g. V-1001"
          value={form.vendorNumber}
          onChange={(e) => setField('vendorNumber', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Vendor Name</label>
        <input
          className={INPUT_CLS}
          placeholder="Vendor name"
          value={form.vendorName}
          onChange={(e) => setField('vendorName', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Contact Name</label>
        <input
          className={INPUT_CLS}
          placeholder="Contact person"
          value={form.contactName}
          onChange={(e) => setField('contactName', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
        <input
          className={INPUT_CLS}
          type="email"
          placeholder="vendor@example.com"
          value={form.contactEmail}
          onChange={(e) => setField('contactEmail', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
        <input
          className={INPUT_CLS}
          placeholder="(555) 000-0000"
          value={form.contactPhone}
          onChange={(e) => setField('contactPhone', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Payment Terms</label>
        <select
          className={INPUT_CLS}
          value={form.paymentTerms}
          onChange={(e) => setField('paymentTerms', e.target.value)}
        >
          {PAYMENT_TERMS_OPTIONS.map((term) => (
            <option key={term} value={term}>{term}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Credit Limit ($)</label>
        <input
          className={INPUT_CLS}
          type="number"
          placeholder="0.00"
          value={form.creditLimit}
          onChange={(e) => setField('creditLimit', e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is1099Eligible"
          checked={form.is1099Eligible}
          onChange={(e) => setField('is1099Eligible', e.target.checked)}
          className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="is1099Eligible" className="text-sm font-medium text-text-primary">
          1099 Eligible
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
        <select
          className={INPUT_CLS}
          value={form.isActive ? 'active' : 'inactive'}
          onChange={(e) => setField('isActive', e.target.value === 'active')}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );

  // -- View detail fields renderer --

  const renderViewFields = () => {
    if (!selectedVendor) return null;
    const v = selectedVendor;
    const fields = [
      { label: 'Vendor Number', value: v.vendorNumber },
      { label: 'Vendor Name', value: v.vendorName ?? v.name },
      { label: 'Contact Name', value: v.contactName },
      { label: 'Email', value: v.contactEmail },
      { label: 'Phone', value: v.contactPhone ?? v.phone },
      { label: 'Payment Terms', value: v.paymentTerms },
      {
        label: 'Credit Limit',
        value: v.creditLimit != null ? formatCurrency(Number(v.creditLimit)) : '-',
      },
      { label: '1099 Eligible', value: v.is1099Eligible ? 'Yes' : 'No' },
      { label: 'Status', value: v.isActive !== false ? 'Active' : 'Inactive' },
    ];

    return (
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.label}>
            <dt className="text-xs font-medium text-text-muted">{f.label}</dt>
            <dd className="mt-0.5 text-sm text-text-primary">{f.value || '-'}</dd>
          </div>
        ))}
      </div>
    );
  };

  // -- Loading skeleton --

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-32 bg-surface-100 animate-pulse rounded"></div>
            <div className="h-4 w-64 bg-surface-100 animate-pulse rounded mt-2"></div>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-24 bg-surface-100 animate-pulse rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-surface-100 animate-pulse rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Vendors</h1>
          <p className="text-xs text-text-muted">
            Manage vendor information and relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Vendors</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{vendors.length.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Active Vendors</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {vendors.filter((v: any) => v.isActive !== false).length.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">1099 Eligible</p>
              <p className="text-2xl font-bold text-text-primary mt-2">
                {vendors.filter((v: any) => v.is1099Eligible).length.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-xs text-text-muted">Total Credit Limit</p>
              <p className="text-lg font-bold text-brand-600 mt-2">
                {formatCurrency(vendors.reduce((sum: number, v: any) => sum + Number(v.creditLimit ?? 0), 0))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <ExportButton
              onExportCSV={() => exportToCSV(vendors, 'vendors')}
              onExportExcel={() => exportToExcel(vendors, 'vendors')}
            />
          </div>
          <DataTable
            columns={columns}
            data={vendors}
            searchable
            searchPlaceholder="Search vendors..."
            pageSize={15}
            emptyMessage="No vendors found."
            onRowClick={openView}
          />
        </CardContent>
      </Card>

      {/* View Vendor SlideOver */}
      <SlideOver
        open={showView}
        onClose={() => { setShowView(false); setSelectedVendor(null); }}
        title={selectedVendor?.vendorName ?? selectedVendor?.name ?? 'Vendor Details'}
        description={selectedVendor?.vendorNumber ?? ''}
        width="md"
        footer={
          <>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" onClick={() => { setShowView(false); setSelectedVendor(null); }}>
              Close
            </Button>
            <Button onClick={openEdit}>Edit</Button>
          </>
        }
      >
        {renderViewFields()}
      </SlideOver>

      {/* Create Vendor SlideOver */}
      <SlideOver
        open={showCreate}
        onClose={() => { setShowCreate(false); resetForm(); }}
        title="New Vendor"
        description="Add a new vendor to the system"
        width="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowCreate(false); resetForm(); }} disabled={isCreating}>
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

      {/* Edit Vendor SlideOver */}
      <SlideOver
        open={showEdit}
        onClose={() => { setShowEdit(false); setSelectedVendor(null); resetForm(); }}
        title="Edit Vendor"
        description={`Update details for ${selectedVendor?.vendorName ?? selectedVendor?.name ?? 'vendor'}`}
        width="md"
        footer={
          <>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting || isUpdating}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" onClick={() => { setShowEdit(false); setSelectedVendor(null); resetForm(); }} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        {renderFormFields()}
      </SlideOver>

      {/* Import Wizard */}
      <ImportWizard
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={vendorImportSchema}
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
          return new Promise((resolve) => {
            importVendors(data, {
              onSuccess: (result: any) => {
                resolve({ success: result?.successCount ?? data.length, errors: result?.errors ?? [] });
              },
              onError: () => {
                resolve({ success: 0, errors: [{ row: 0, field: '', value: '', code: 'INVALID_TYPE' as const, message: 'Import failed' }] });
              },
            });
          });
        }}
        onDownloadTemplate={() => downloadTemplate(vendorImportSchema)}
      />
    </div>
  );
}
