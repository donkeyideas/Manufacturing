import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, DataTable, Button, SlideOver } from '@erp/ui';
import { getVendors } from '@erp/demo-data';
import type { ColumnDef } from '@tanstack/react-table';
import { Check } from 'lucide-react';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>(() => getVendors());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const resetForm = () => {
    setName('');
    setContactName('');
    setContactEmail('');
    setPhone('');
    setAddress('');
    setStatus('active');
  };

  const handleSubmit = () => {
    const newVendor = {
      id: `vendor-${vendors.length + 101}`,
      vendorNumber: `V-${String(vendors.length + 1001).padStart(4, '0')}`,
      name,
      contactName,
      contactEmail,
      phone,
      address,
      paymentTerms: 'Net 30',
      is1099Eligible: false,
      isActive: status === 'active',
    };
    setVendors((prev) => [newVendor, ...prev]);
    setShowForm(false);
    resetForm();
  };

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'vendorNumber',
      header: 'Vendor #',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.vendorNumber}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="text-text-primary">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'contactName',
      header: 'Contact',
      cell: ({ row }) => (
        <span className="text-text-secondary">{row.original.contactName}</span>
      ),
    },
    {
      accessorKey: 'contactEmail',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-text-secondary">{row.original.contactEmail}</span>
      ),
    },
    {
      accessorKey: 'paymentTerms',
      header: 'Payment Terms',
      cell: ({ row }) => (
        <span className="text-text-secondary">{row.original.paymentTerms}</span>
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
      header: 'Active',
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          {row.original.isActive ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <span className="text-text-muted">-</span>
          )}
        </div>
      ),
    },
  ];

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
        <Button onClick={() => setShowForm(true)}>Add Vendor</Button>
      </div>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={vendors} />
        </CardContent>
      </Card>

      {/* New Vendor SlideOver */}
      <SlideOver
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Vendor"
        description="Add a new vendor to the system"
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
            <label className="block text-sm font-medium text-text-primary mb-1">Name</label>
            <input className={INPUT_CLS} placeholder="Vendor name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Contact Name</label>
            <input className={INPUT_CLS} placeholder="Contact person" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <input className={INPUT_CLS} type="email" placeholder="vendor@example.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
            <input className={INPUT_CLS} placeholder="(555) 000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Address</label>
            <input className={INPUT_CLS} placeholder="Street address, City, State" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
            <select className={INPUT_CLS} value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
