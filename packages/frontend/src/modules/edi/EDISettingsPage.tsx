import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@erp/ui';
import { useEDISettings, useUpdateEDISettings } from '../../data-layer/hooks/useEDI';
import { Save } from 'lucide-react';

const INPUT_CLS =
  'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

interface SettingsForm {
  companyIsaId: string;
  companyGsId: string;
  companyAs2Id: string;
  companyCertificate: string;
  companyPrivateKey: string;
  autoAcknowledge997: boolean;
  autoCreateSalesOrders: boolean;
  autoGenerateOnApproval: boolean;
  defaultFormat: string;
  retentionDays: string;
  sftpPollingEnabled: boolean;
  sftpPollingIntervalMinutes: string;
}

const EMPTY_FORM: SettingsForm = {
  companyIsaId: '',
  companyGsId: '',
  companyAs2Id: '',
  companyCertificate: '',
  companyPrivateKey: '',
  autoAcknowledge997: true,
  autoCreateSalesOrders: false,
  autoGenerateOnApproval: false,
  defaultFormat: 'csv',
  retentionDays: '365',
  sftpPollingEnabled: true,
  sftpPollingIntervalMinutes: '15',
};

export default function EDISettingsPage() {
  const { data: settings, isLoading } = useEDISettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateEDISettings();

  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      const s = settings as any;
      setForm({
        companyIsaId: s.companyIsaId ?? '',
        companyGsId: s.companyGsId ?? '',
        companyAs2Id: s.companyAs2Id ?? '',
        companyCertificate: s.companyCertificate ?? '',
        companyPrivateKey: s.companyPrivateKey ?? '',
        autoAcknowledge997: s.autoAcknowledge997 ?? true,
        autoCreateSalesOrders: s.autoCreateSalesOrders ?? false,
        autoGenerateOnApproval: s.autoGenerateOnApproval ?? false,
        defaultFormat: s.defaultFormat ?? 'csv',
        retentionDays: s.retentionDays != null ? String(s.retentionDays) : '365',
        sftpPollingEnabled: s.sftpPollingEnabled ?? true,
        sftpPollingIntervalMinutes: s.sftpPollingIntervalMinutes != null ? String(s.sftpPollingIntervalMinutes) : '15',
      });
    }
  }, [settings]);

  const setField = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    setSaved(false);
    updateSettings(
      {
        ...form,
        retentionDays: parseInt(form.retentionDays, 10) || 365,
        sftpPollingIntervalMinutes: parseInt(form.sftpPollingIntervalMinutes, 10) || 15,
      },
      {
        onSuccess: () => setSaved(true),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <div className="h-6 w-40 bg-surface-2 animate-skeleton rounded" />
          <div className="h-3 w-64 bg-surface-2 animate-skeleton rounded mt-2" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-48 rounded-lg border border-border bg-surface-1 animate-skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">EDI Settings</h1>
          <p className="text-xs text-text-muted">Configure company identifiers, automation, and default preferences</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {saved && (
        <div className="rounded-md border border-success/30 bg-success/5 px-4 py-2">
          <p className="text-sm text-success">Settings saved successfully.</p>
        </div>
      )}

      {/* Company Identifiers */}
      <Card>
        <CardHeader>
          <CardTitle>Company Identifiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">ISA Interchange ID</label>
              <input
                className={INPUT_CLS}
                placeholder="e.g. ERPCOMPANY"
                value={form.companyIsaId}
                onChange={(e) => setField('companyIsaId', e.target.value)}
              />
              <p className="text-2xs text-text-muted mt-1">Used in X12 ISA envelope headers</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">GS Application ID</label>
              <input
                className={INPUT_CLS}
                placeholder="e.g. ERPCORP"
                value={form.companyGsId}
                onChange={(e) => setField('companyGsId', e.target.value)}
              />
              <p className="text-2xs text-text-muted mt-1">Used in X12 GS functional group headers</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">AS2 ID</label>
              <input
                className={INPUT_CLS}
                placeholder="e.g. erp-company-as2"
                value={form.companyAs2Id}
                onChange={(e) => setField('companyAs2Id', e.target.value)}
              />
              <p className="text-2xs text-text-muted mt-1">Your AS2 identifier for AS2 protocol exchanges</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Certificate */}
      <Card>
        <CardHeader>
          <CardTitle>Company Certificate (AS2)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Certificate (PEM)</label>
              <textarea
                className={INPUT_CLS + ' h-32 font-mono text-xs'}
                placeholder="-----BEGIN CERTIFICATE-----"
                value={form.companyCertificate}
                onChange={(e) => setField('companyCertificate', e.target.value)}
              />
              <p className="text-2xs text-text-muted mt-1">Your public certificate for signing outbound AS2 messages</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Private Key (PEM)</label>
              <textarea
                className={INPUT_CLS + ' h-32 font-mono text-xs'}
                placeholder="-----BEGIN PRIVATE KEY-----"
                value={form.companyPrivateKey}
                onChange={(e) => setField('companyPrivateKey', e.target.value)}
              />
              <p className="text-2xs text-text-muted mt-1">Your private key for decrypting inbound AS2 messages</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automation */}
      <Card>
        <CardHeader>
          <CardTitle>Automation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.autoAcknowledge997}
                onChange={(e) => setField('autoAcknowledge997', e.target.checked)}
                className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-sm font-medium text-text-primary">Auto-acknowledge with 997</span>
                <p className="text-2xs text-text-muted">Automatically generate 997 Functional Acknowledgment for inbound transactions</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.autoCreateSalesOrders}
                onChange={(e) => setField('autoCreateSalesOrders', e.target.checked)}
                className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-sm font-medium text-text-primary">Auto-create Sales Orders from inbound 850</span>
                <p className="text-2xs text-text-muted">Automatically create Sales Orders when processing inbound Purchase Orders</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.autoGenerateOnApproval}
                onChange={(e) => setField('autoGenerateOnApproval', e.target.checked)}
                className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-sm font-medium text-text-primary">Auto-generate outbound on approval</span>
                <p className="text-2xs text-text-muted">Automatically generate outbound EDI documents when POs/SOs are approved</p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* SFTP Polling */}
      <Card>
        <CardHeader>
          <CardTitle>SFTP Polling</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.sftpPollingEnabled}
                onChange={(e) => setField('sftpPollingEnabled', e.target.checked)}
                className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
              />
              <div>
                <span className="text-sm font-medium text-text-primary">Enable SFTP Polling</span>
                <p className="text-2xs text-text-muted">Automatically poll SFTP servers for new inbound EDI documents</p>
              </div>
            </label>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-text-primary mb-1">Default Polling Interval (minutes)</label>
              <input
                className={INPUT_CLS}
                type="number"
                min="1"
                value={form.sftpPollingIntervalMinutes}
                onChange={(e) => setField('sftpPollingIntervalMinutes', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Defaults & Retention</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Default Format</label>
              <select className={INPUT_CLS} value={form.defaultFormat} onChange={(e) => setField('defaultFormat', e.target.value)}>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="json">JSON</option>
                <option value="x12">X12</option>
              </select>
              <p className="text-2xs text-text-muted mt-1">Default format for new trading partners</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Retention (days)</label>
              <input
                className={INPUT_CLS}
                type="number"
                min="30"
                value={form.retentionDays}
                onChange={(e) => setField('retentionDays', e.target.value)}
              />
              <p className="text-2xs text-text-muted mt-1">How long to keep transaction history before archiving</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
