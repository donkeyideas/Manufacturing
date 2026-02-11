import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, DataTable, Button, Badge, SlideOver, Tabs, TabsList, TabsTrigger, TabsContent } from '@erp/ui';
import {
  useEDITradingPartners,
  useCreateEDIPartner,
  useUpdateEDIPartner,
  useDeleteEDIPartner,
  useTestEDIConnection,
} from '../../data-layer/hooks/useEDI';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Wifi } from 'lucide-react';

const INPUT_CLS =
  'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const COMM_METHODS = ['manual', 'as2', 'sftp', 'api', 'email'] as const;
const FORMATS = ['csv', 'xml', 'json', 'x12'] as const;
const PARTNER_TYPES = ['customer', 'vendor', 'both'] as const;
const STATUSES = ['active', 'testing', 'inactive'] as const;

interface PartnerForm {
  partnerCode: string;
  partnerName: string;
  partnerType: string;
  customerId: string;
  vendorId: string;
  communicationMethod: string;
  defaultFormat: string;
  status: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
  // AS2
  as2Id: string;
  as2Url: string;
  partnerCertificate: string;
  encryptionAlgorithm: string;
  signatureAlgorithm: string;
  // SFTP
  sftpHost: string;
  sftpPort: string;
  sftpUsername: string;
  sftpPassword: string;
  sftpRemoteDir: string;
  sftpPollSchedule: string;
  // X12
  isaId: string;
  gsId: string;
}

const EMPTY_FORM: PartnerForm = {
  partnerCode: '',
  partnerName: '',
  partnerType: 'customer',
  customerId: '',
  vendorId: '',
  communicationMethod: 'manual',
  defaultFormat: 'csv',
  status: 'active',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  notes: '',
  as2Id: '',
  as2Url: '',
  partnerCertificate: '',
  encryptionAlgorithm: 'aes256',
  signatureAlgorithm: 'sha256',
  sftpHost: '',
  sftpPort: '22',
  sftpUsername: '',
  sftpPassword: '',
  sftpRemoteDir: '',
  sftpPollSchedule: '*/15 * * * *',
  isaId: '',
  gsId: '',
};

export default function TradingPartnersPage() {
  const { data: partners = [], isLoading } = useEDITradingPartners();
  const { mutate: createPartner, isPending: isCreating } = useCreateEDIPartner();
  const { mutate: updatePartner, isPending: isUpdating } = useUpdateEDIPartner();
  const { mutate: deletePartner, isPending: isDeleting } = useDeleteEDIPartner();
  const { mutate: testConnection, isPending: isTesting } = useTestEDIConnection();

  const [form, setForm] = useState<PartnerForm>(EMPTY_FORM);
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const resetForm = () => setForm(EMPTY_FORM);
  const setField = <K extends keyof PartnerForm>(key: K, value: PartnerForm[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleCreate = () => {
    createPartner({ ...form } as Record<string, unknown>, {
      onSuccess: () => {
        setShowCreate(false);
        resetForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!selected) return;
    updatePartner(
      { id: selected.id, ...form },
      {
        onSuccess: () => {
          setShowEdit(false);
          setSelected(null);
          resetForm();
        },
      },
    );
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!window.confirm(`Delete partner "${selected.partnerName}"?`)) return;
    deletePartner(selected.id, {
      onSuccess: () => {
        setShowView(false);
        setShowEdit(false);
        setSelected(null);
      },
    });
  };

  const handleTestConnection = () => {
    if (!selected) return;
    setTestResult(null);
    testConnection(selected.id, {
      onSuccess: (data: any) => {
        setTestResult(data?.success ? 'Connection successful!' : `Failed: ${data?.error || 'Unknown error'}`);
      },
      onError: (err: any) => {
        setTestResult(`Error: ${err.message}`);
      },
    });
  };

  const openView = (partner: any) => {
    setSelected(partner);
    setTestResult(null);
    setShowView(true);
  };

  const openEdit = () => {
    if (!selected) return;
    setForm({
      partnerCode: selected.partnerCode ?? '',
      partnerName: selected.partnerName ?? '',
      partnerType: selected.partnerType ?? 'customer',
      customerId: selected.customerId ?? '',
      vendorId: selected.vendorId ?? '',
      communicationMethod: selected.communicationMethod ?? 'manual',
      defaultFormat: selected.defaultFormat ?? 'csv',
      status: selected.status ?? 'active',
      contactName: selected.contactName ?? '',
      contactEmail: selected.contactEmail ?? '',
      contactPhone: selected.contactPhone ?? '',
      notes: selected.notes ?? '',
      as2Id: selected.as2Id ?? '',
      as2Url: selected.as2Url ?? '',
      partnerCertificate: selected.partnerCertificate ?? '',
      encryptionAlgorithm: selected.encryptionAlgorithm ?? 'aes256',
      signatureAlgorithm: selected.signatureAlgorithm ?? 'sha256',
      sftpHost: selected.sftpHost ?? '',
      sftpPort: selected.sftpPort != null ? String(selected.sftpPort) : '22',
      sftpUsername: selected.sftpUsername ?? '',
      sftpPassword: '',
      sftpRemoteDir: selected.sftpRemoteDir ?? '',
      sftpPollSchedule: selected.sftpPollSchedule ?? '*/15 * * * *',
      isaId: selected.isaId ?? '',
      gsId: selected.gsId ?? '',
    });
    setShowView(false);
    setShowEdit(true);
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'partnerCode',
        header: 'Code',
        cell: ({ row }) => <span className="font-medium text-text-primary">{row.original.partnerCode}</span>,
      },
      {
        accessorKey: 'partnerName',
        header: 'Name',
        cell: ({ row }) => <span className="text-text-primary">{row.original.partnerName}</span>,
      },
      {
        accessorKey: 'partnerType',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant={row.original.partnerType === 'customer' ? 'info' : row.original.partnerType === 'vendor' ? 'warning' : 'default'}>
            {row.original.partnerType}
          </Badge>
        ),
      },
      {
        accessorKey: 'communicationMethod',
        header: 'Comm Method',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary uppercase">{row.original.communicationMethod}</span>
        ),
      },
      {
        accessorKey: 'defaultFormat',
        header: 'Format',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary uppercase">{row.original.defaultFormat}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.status === 'active' ? 'success' : row.original.status === 'testing' ? 'warning' : 'default'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  const renderFormFields = () => (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="communication">Communication</TabsTrigger>
        <TabsTrigger value="x12">X12 Config</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Partner Code</label>
            <input className={INPUT_CLS} placeholder="e.g. ACME-EDI" value={form.partnerCode} onChange={(e) => setField('partnerCode', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Partner Name</label>
            <input className={INPUT_CLS} placeholder="e.g. Acme Manufacturing" value={form.partnerName} onChange={(e) => setField('partnerName', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Type</label>
              <select className={INPUT_CLS} value={form.partnerType} onChange={(e) => setField('partnerType', e.target.value)}>
                {PARTNER_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
              <select className={INPUT_CLS} value={form.status} onChange={(e) => setField('status', e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Default Format</label>
              <select className={INPUT_CLS} value={form.defaultFormat} onChange={(e) => setField('defaultFormat', e.target.value)}>
                {FORMATS.map((f) => (
                  <option key={f} value={f}>{f.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Comm Method</label>
              <select className={INPUT_CLS} value={form.communicationMethod} onChange={(e) => setField('communicationMethod', e.target.value)}>
                {COMM_METHODS.map((m) => (
                  <option key={m} value={m}>{m.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="communication">
        <div className="space-y-4 pt-4">
          {form.communicationMethod === 'as2' && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">AS2 ID</label>
                <input className={INPUT_CLS} placeholder="Partner AS2 identifier" value={form.as2Id} onChange={(e) => setField('as2Id', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">AS2 URL</label>
                <input className={INPUT_CLS} placeholder="https://partner.com/as2" value={form.as2Url} onChange={(e) => setField('as2Url', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Partner Certificate (PEM)</label>
                <textarea
                  className={INPUT_CLS + ' h-24 font-mono text-xs'}
                  placeholder="-----BEGIN CERTIFICATE-----"
                  value={form.partnerCertificate}
                  onChange={(e) => setField('partnerCertificate', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Encryption</label>
                  <select className={INPUT_CLS} value={form.encryptionAlgorithm} onChange={(e) => setField('encryptionAlgorithm', e.target.value)}>
                    <option value="aes256">AES-256</option>
                    <option value="aes128">AES-128</option>
                    <option value="3des">3DES</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Signature</label>
                  <select className={INPUT_CLS} value={form.signatureAlgorithm} onChange={(e) => setField('signatureAlgorithm', e.target.value)}>
                    <option value="sha256">SHA-256</option>
                    <option value="sha1">SHA-1</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {form.communicationMethod === 'sftp' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-primary mb-1">SFTP Host</label>
                  <input className={INPUT_CLS} placeholder="sftp.partner.com" value={form.sftpHost} onChange={(e) => setField('sftpHost', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Port</label>
                  <input className={INPUT_CLS} type="number" value={form.sftpPort} onChange={(e) => setField('sftpPort', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Username</label>
                  <input className={INPUT_CLS} value={form.sftpUsername} onChange={(e) => setField('sftpUsername', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
                  <input className={INPUT_CLS} type="password" placeholder="********" value={form.sftpPassword} onChange={(e) => setField('sftpPassword', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Remote Directory</label>
                <input className={INPUT_CLS} placeholder="/edi/incoming" value={form.sftpRemoteDir} onChange={(e) => setField('sftpRemoteDir', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Poll Schedule (cron)</label>
                <input className={INPUT_CLS} placeholder="*/15 * * * *" value={form.sftpPollSchedule} onChange={(e) => setField('sftpPollSchedule', e.target.value)} />
              </div>
            </>
          )}

          {(form.communicationMethod === 'manual' || form.communicationMethod === 'email' || form.communicationMethod === 'api') && (
            <p className="text-xs text-text-muted py-4 text-center">
              No additional configuration needed for {form.communicationMethod.toUpperCase()} communication.
            </p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="x12">
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">ISA Interchange ID</label>
            <input className={INPUT_CLS} placeholder="e.g. ACME001" value={form.isaId} onChange={(e) => setField('isaId', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">GS Application ID</label>
            <input className={INPUT_CLS} placeholder="e.g. ACME" value={form.gsId} onChange={(e) => setField('gsId', e.target.value)} />
          </div>
          <p className="text-xs text-text-muted">
            These identifiers are used in X12 envelope headers (ISA and GS segments) to identify this trading partner.
          </p>
        </div>
      </TabsContent>

      <TabsContent value="contact">
        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Contact Name</label>
            <input className={INPUT_CLS} placeholder="Full name" value={form.contactName} onChange={(e) => setField('contactName', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <input className={INPUT_CLS} type="email" placeholder="contact@partner.com" value={form.contactEmail} onChange={(e) => setField('contactEmail', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Phone</label>
            <input className={INPUT_CLS} placeholder="555-0101" value={form.contactPhone} onChange={(e) => setField('contactPhone', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
            <textarea className={INPUT_CLS + ' h-20'} placeholder="Additional notes..." value={form.notes} onChange={(e) => setField('notes', e.target.value)} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  const renderViewFields = () => {
    if (!selected) return null;
    const p = selected;
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">General</h3>
          {[
            { label: 'Partner Code', value: p.partnerCode },
            { label: 'Partner Name', value: p.partnerName },
            { label: 'Type', value: p.partnerType },
            { label: 'Format', value: p.defaultFormat?.toUpperCase() },
            { label: 'Communication', value: p.communicationMethod?.toUpperCase() },
            { label: 'Status', value: p.status },
          ].map((f) => (
            <div key={f.label}>
              <dt className="text-xs font-medium text-text-muted">{f.label}</dt>
              <dd className="mt-0.5 text-sm text-text-primary">{f.value || '-'}</dd>
            </div>
          ))}
        </div>

        {p.communicationMethod === 'as2' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">AS2 Configuration</h3>
            {[
              { label: 'AS2 ID', value: p.as2Id },
              { label: 'AS2 URL', value: p.as2Url },
              { label: 'Encryption', value: p.encryptionAlgorithm },
              { label: 'Signature', value: p.signatureAlgorithm },
            ].map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-medium text-text-muted">{f.label}</dt>
                <dd className="mt-0.5 text-sm text-text-primary">{f.value || '-'}</dd>
              </div>
            ))}
          </div>
        )}

        {p.communicationMethod === 'sftp' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">SFTP Configuration</h3>
            {[
              { label: 'Host', value: `${p.sftpHost || '-'}:${p.sftpPort || 22}` },
              { label: 'Username', value: p.sftpUsername },
              { label: 'Remote Dir', value: p.sftpRemoteDir },
              { label: 'Poll Schedule', value: p.sftpPollSchedule },
            ].map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-medium text-text-muted">{f.label}</dt>
                <dd className="mt-0.5 text-sm text-text-primary">{f.value || '-'}</dd>
              </div>
            ))}
          </div>
        )}

        {(p.isaId || p.gsId) && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">X12 Config</h3>
            {[
              { label: 'ISA ID', value: p.isaId },
              { label: 'GS ID', value: p.gsId },
            ].map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-medium text-text-muted">{f.label}</dt>
                <dd className="mt-0.5 text-sm text-text-primary">{f.value || '-'}</dd>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Contact</h3>
          {[
            { label: 'Name', value: p.contactName },
            { label: 'Email', value: p.contactEmail },
            { label: 'Phone', value: p.contactPhone },
            { label: 'Notes', value: p.notes },
          ].map((f) => (
            <div key={f.label}>
              <dt className="text-xs font-medium text-text-muted">{f.label}</dt>
              <dd className="mt-0.5 text-sm text-text-primary">{f.value || '-'}</dd>
            </div>
          ))}
        </div>

        {/* Test Connection */}
        {(p.communicationMethod === 'as2' || p.communicationMethod === 'sftp') && (
          <div className="pt-2 border-t border-border">
            <Button variant="secondary" size="sm" onClick={handleTestConnection} disabled={isTesting}>
              <Wifi className="h-4 w-4 mr-1" />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
            {testResult && (
              <p className={`text-xs mt-2 ${testResult.startsWith('Connection') ? 'text-success' : 'text-danger'}`}>
                {testResult}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <div className="h-6 w-40 bg-surface-2 animate-skeleton rounded" />
          <div className="h-3 w-64 bg-surface-2 animate-skeleton rounded mt-2" />
        </div>
        <Card>
          <CardContent>
            <div className="space-y-3 pt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-surface-2 animate-skeleton rounded" />
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
          <h1 className="text-lg font-semibold text-text-primary">Trading Partners</h1>
          <p className="text-xs text-text-muted">Manage EDI trading partner configurations and connections</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={partners as any[]}
            searchable
            searchPlaceholder="Search partners..."
            pageSize={15}
            emptyMessage="No trading partners found."
            onRowClick={openView}
          />
        </CardContent>
      </Card>

      {/* View SlideOver */}
      <SlideOver
        open={showView}
        onClose={() => { setShowView(false); setSelected(null); }}
        title={selected?.partnerName ?? 'Partner Details'}
        description={selected?.partnerCode ?? ''}
        width="md"
        footer={
          <>
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" onClick={() => { setShowView(false); setSelected(null); }}>
              Close
            </Button>
            <Button onClick={openEdit}>Edit</Button>
          </>
        }
      >
        {renderViewFields()}
      </SlideOver>

      {/* Create SlideOver */}
      <SlideOver
        open={showCreate}
        onClose={() => { setShowCreate(false); resetForm(); }}
        title="New Trading Partner"
        description="Add a new EDI trading partner"
        width="lg"
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

      {/* Edit SlideOver */}
      <SlideOver
        open={showEdit}
        onClose={() => { setShowEdit(false); setSelected(null); resetForm(); }}
        title="Edit Partner"
        description={`Update details for ${selected?.partnerName ?? 'partner'}`}
        width="lg"
        footer={
          <>
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting || isUpdating}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" onClick={() => { setShowEdit(false); setSelected(null); resetForm(); }} disabled={isUpdating}>
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
    </div>
  );
}
