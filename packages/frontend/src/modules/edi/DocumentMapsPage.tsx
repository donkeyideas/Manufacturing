import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, DataTable, Button, Badge, SlideOver } from '@erp/ui';
import {
  useEDIDocumentMaps,
  useCreateEDIDocumentMap,
  useUpdateEDIDocumentMap,
  useDeleteEDIDocumentMap,
  useEDITradingPartners,
} from '../../data-layer/hooks/useEDI';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Trash2 } from 'lucide-react';

const INPUT_CLS =
  'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

const DOC_TYPES = ['850', '855', '810', '856', '997'] as const;
const DIRECTIONS = ['inbound', 'outbound'] as const;
const TRANSFORMS = ['', 'trim', 'uppercase', 'lowercase', 'number', 'date', 'boolean'] as const;

interface MappingRule {
  sourceField: string;
  targetField: string;
  transform: string;
  defaultValue?: string;
}

interface MapForm {
  mapName: string;
  documentType: string;
  direction: string;
  partnerId: string;
  isDefault: boolean;
  isActive: boolean;
  mappingRules: MappingRule[];
}

const EMPTY_RULE: MappingRule = { sourceField: '', targetField: '', transform: '', defaultValue: '' };

const EMPTY_FORM: MapForm = {
  mapName: '',
  documentType: '850',
  direction: 'inbound',
  partnerId: '',
  isDefault: false,
  isActive: true,
  mappingRules: [{ ...EMPTY_RULE }],
};

export default function DocumentMapsPage() {
  const { data: maps = [], isLoading } = useEDIDocumentMaps();
  const { data: partners = [] } = useEDITradingPartners();
  const { mutate: createMap, isPending: isCreating } = useCreateEDIDocumentMap();
  const { mutate: updateMap, isPending: isUpdating } = useUpdateEDIDocumentMap();
  const { mutate: deleteMap, isPending: isDeleting } = useDeleteEDIDocumentMap();

  const [form, setForm] = useState<MapForm>(EMPTY_FORM);
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const resetForm = () => setForm(EMPTY_FORM);
  const setField = <K extends keyof MapForm>(key: K, value: MapForm[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const setRule = (idx: number, key: keyof MappingRule, value: string) => {
    setForm((p) => {
      const rules = [...p.mappingRules];
      rules[idx] = { ...rules[idx], [key]: value };
      return { ...p, mappingRules: rules };
    });
  };

  const addRule = () => setForm((p) => ({ ...p, mappingRules: [...p.mappingRules, { ...EMPTY_RULE }] }));

  const removeRule = (idx: number) => {
    setForm((p) => ({
      ...p,
      mappingRules: p.mappingRules.filter((_, i) => i !== idx),
    }));
  };

  const handleCreate = () => {
    createMap(
      {
        ...form,
        partnerId: form.partnerId || null,
        mappingRules: form.mappingRules.filter((r) => r.sourceField || r.targetField),
      },
      { onSuccess: () => { setShowCreate(false); resetForm(); } },
    );
  };

  const handleUpdate = () => {
    if (!selected) return;
    updateMap(
      {
        id: selected.id,
        ...form,
        partnerId: form.partnerId || null,
        mappingRules: form.mappingRules.filter((r) => r.sourceField || r.targetField),
      },
      { onSuccess: () => { setShowEdit(false); setSelected(null); resetForm(); } },
    );
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!window.confirm(`Delete map "${selected.mapName}"?`)) return;
    deleteMap(selected.id, {
      onSuccess: () => {
        setShowView(false);
        setShowEdit(false);
        setSelected(null);
      },
    });
  };

  const openView = (map: any) => {
    setSelected(map);
    setShowView(true);
  };

  const openEdit = () => {
    if (!selected) return;
    setForm({
      mapName: selected.mapName ?? '',
      documentType: selected.documentType ?? '850',
      direction: selected.direction ?? 'inbound',
      partnerId: selected.partnerId ?? '',
      isDefault: selected.isDefault ?? false,
      isActive: selected.isActive ?? true,
      mappingRules:
        selected.mappingRules && selected.mappingRules.length > 0
          ? selected.mappingRules.map((r: any) => ({
              sourceField: r.sourceField ?? '',
              targetField: r.targetField ?? '',
              transform: r.transform ?? '',
              defaultValue: r.defaultValue ?? '',
            }))
          : [{ ...EMPTY_RULE }],
    });
    setShowView(false);
    setShowEdit(true);
  };

  const openCreate = () => {
    resetForm();
    setShowCreate(true);
  };

  const partnerLookup = useMemo(() => {
    const m: Record<string, string> = {};
    (partners as any[]).forEach((p) => {
      m[p.id] = p.partnerName;
    });
    return m;
  }, [partners]);

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorKey: 'mapName',
        header: 'Map Name',
        cell: ({ row }) => <span className="font-medium text-text-primary">{row.original.mapName}</span>,
      },
      {
        accessorKey: 'documentType',
        header: 'Doc Type',
        cell: ({ row }) => <span className="text-xs text-text-primary">{row.original.documentType}</span>,
      },
      {
        accessorKey: 'direction',
        header: 'Direction',
        cell: ({ row }) => (
          <Badge variant={row.original.direction === 'inbound' ? 'info' : 'success'}>
            {row.original.direction}
          </Badge>
        ),
      },
      {
        accessorKey: 'partnerId',
        header: 'Partner',
        cell: ({ row }) => (
          <span className="text-xs text-text-primary">
            {row.original.partnerId ? partnerLookup[row.original.partnerId] || row.original.partnerId : 'Default'}
          </span>
        ),
      },
      {
        accessorKey: 'isDefault',
        header: 'Default',
        cell: ({ row }) =>
          row.original.isDefault ? (
            <Badge variant="warning">Default</Badge>
          ) : (
            <span className="text-text-muted">-</span>
          ),
      },
      {
        accessorKey: 'isActive',
        header: 'Active',
        cell: ({ row }) => (
          <Badge variant={row.original.isActive !== false ? 'success' : 'default'}>
            {row.original.isActive !== false ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    [partnerLookup],
  );

  const renderFormFields = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Map Name</label>
        <input className={INPUT_CLS} placeholder="e.g. Standard PO Inbound (CSV)" value={form.mapName} onChange={(e) => setField('mapName', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Document Type</label>
          <select className={INPUT_CLS} value={form.documentType} onChange={(e) => setField('documentType', e.target.value)}>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Direction</label>
          <select className={INPUT_CLS} value={form.direction} onChange={(e) => setField('direction', e.target.value)}>
            {DIRECTIONS.map((d) => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">Partner (optional)</label>
        <select className={INPUT_CLS} value={form.partnerId} onChange={(e) => setField('partnerId', e.target.value)}>
          <option value="">Default (all partners)</option>
          {(partners as any[]).map((p) => (
            <option key={p.id} value={p.id}>{p.partnerName}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setField('isDefault', e.target.checked)}
            className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-text-primary">Default Map</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setField('isActive', e.target.checked)}
            className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-text-primary">Active</span>
        </label>
      </div>

      {/* Mapping Rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-text-primary">Field Mappings</label>
          <Button variant="secondary" size="sm" onClick={addRule}>
            <Plus className="h-3 w-3 mr-1" />
            Add Row
          </Button>
        </div>
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-text-muted">
            <div className="col-span-3">Source Field</div>
            <div className="col-span-3">Target Field</div>
            <div className="col-span-2">Transform</div>
            <div className="col-span-3">Default Value</div>
            <div className="col-span-1" />
          </div>
          {form.mappingRules.map((rule, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-3">
                <input
                  className={INPUT_CLS}
                  placeholder="Source"
                  value={rule.sourceField}
                  onChange={(e) => setRule(idx, 'sourceField', e.target.value)}
                />
              </div>
              <div className="col-span-3">
                <input
                  className={INPUT_CLS}
                  placeholder="Target"
                  value={rule.targetField}
                  onChange={(e) => setRule(idx, 'targetField', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <select
                  className={INPUT_CLS}
                  value={rule.transform}
                  onChange={(e) => setRule(idx, 'transform', e.target.value)}
                >
                  {TRANSFORMS.map((t) => (
                    <option key={t} value={t}>{t || 'None'}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-3">
                <input
                  className={INPUT_CLS}
                  placeholder="Default"
                  value={rule.defaultValue ?? ''}
                  onChange={(e) => setRule(idx, 'defaultValue', e.target.value)}
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => removeRule(idx)}
                  className="text-text-muted hover:text-danger transition-colors"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderViewFields = () => {
    if (!selected) return null;
    const m = selected;
    return (
      <div className="space-y-5">
        <div className="space-y-3">
          {[
            { label: 'Map Name', value: m.mapName },
            { label: 'Document Type', value: m.documentType },
            { label: 'Direction', value: m.direction },
            { label: 'Partner', value: m.partnerId ? partnerLookup[m.partnerId] || m.partnerId : 'Default (all)' },
            { label: 'Default', value: m.isDefault ? 'Yes' : 'No' },
            { label: 'Active', value: m.isActive !== false ? 'Yes' : 'No' },
          ].map((f) => (
            <div key={f.label}>
              <dt className="text-xs font-medium text-text-muted">{f.label}</dt>
              <dd className="mt-0.5 text-sm text-text-primary">{f.value || '-'}</dd>
            </div>
          ))}
        </div>

        {m.mappingRules && m.mappingRules.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Field Mappings ({m.mappingRules.length})
            </h3>
            <div className="rounded-md border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-text-muted">Source</th>
                    <th className="px-3 py-2 text-left font-medium text-text-muted">Target</th>
                    <th className="px-3 py-2 text-left font-medium text-text-muted">Transform</th>
                  </tr>
                </thead>
                <tbody>
                  {m.mappingRules.map((r: any, i: number) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 font-mono text-text-primary">{r.sourceField}</td>
                      <td className="px-3 py-2 font-mono text-text-primary">{r.targetField}</td>
                      <td className="px-3 py-2 text-text-muted">{r.transform || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              {[...Array(4)].map((_, i) => (
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
          <h1 className="text-lg font-semibold text-text-primary">Document Maps</h1>
          <p className="text-xs text-text-muted">Configure field mappings between partner formats and ERP fields</p>
        </div>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Map
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Document Maps</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={maps as any[]}
            searchable
            searchPlaceholder="Search maps..."
            pageSize={15}
            emptyMessage="No document maps found."
            onRowClick={openView}
          />
        </CardContent>
      </Card>

      {/* View */}
      <SlideOver
        open={showView}
        onClose={() => { setShowView(false); setSelected(null); }}
        title={selected?.mapName ?? 'Map Details'}
        description={`${selected?.documentType ?? ''} ${selected?.direction ?? ''}`}
        width="lg"
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

      {/* Create */}
      <SlideOver
        open={showCreate}
        onClose={() => { setShowCreate(false); resetForm(); }}
        title="New Document Map"
        description="Define a new field mapping configuration"
        width="xl"
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

      {/* Edit */}
      <SlideOver
        open={showEdit}
        onClose={() => { setShowEdit(false); setSelected(null); resetForm(); }}
        title="Edit Document Map"
        description={`Update ${selected?.mapName ?? 'map'}`}
        width="xl"
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
