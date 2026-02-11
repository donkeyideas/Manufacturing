import { useState, useMemo } from 'react';
import {
  KeyRound, Plus, Copy, Ban, Search, CheckCircle2,
  Clock, XCircle, ExternalLink, Loader2,
} from 'lucide-react';
import {
  Card, Badge, Button, Input, Modal, Select, cn,
} from '@erp/ui';
import {
  useDemoCodes, useDemoCodeStats, useCreateDemoCode, useRevokeDemoCode,
  type DemoCode,
} from '../data-layer/useAdminData';

const TEMPLATE_LABELS: Record<string, string> = {
  manufacturing: 'Manufacturing',
  distribution: 'Distribution',
  full: 'Full Platform',
};

type DemoCodeStatus = 'active' | 'expired' | 'revoked';

const STATUS_CONFIG = {
  active: { label: 'Active', variant: 'success' as const, icon: CheckCircle2 },
  expired: { label: 'Expired', variant: 'default' as const, icon: Clock },
  revoked: { label: 'Revoked', variant: 'danger' as const, icon: XCircle },
};

function getCodeStatus(code: DemoCode): DemoCodeStatus {
  if (code.isActive === false) return 'revoked';
  if (code.expiresAt && new Date(code.expiresAt).getTime() < Date.now()) return 'expired';
  return 'active';
}

function parseModulesEnabled(modulesEnabled: string | null): string[] {
  if (!modulesEnabled) return [];
  try {
    const parsed = JSON.parse(modulesEnabled);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function DemoCodeManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: codes = [], isLoading: codesLoading } = useDemoCodes();
  const { data: stats, isLoading: statsLoading } = useDemoCodeStats();
  const revokeMutation = useRevokeDemoCode();

  const filteredCodes = useMemo(() => {
    return codes.filter((code) => {
      const codeLabel = code.label ?? '';
      const matchesSearch = search === '' ||
        code.code.toLowerCase().includes(search.toLowerCase()) ||
        codeLabel.toLowerCase().includes(search.toLowerCase());
      const status = getCodeStatus(code);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [codes, search, statusFilter]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRevoke = async (id: string) => {
    await revokeMutation.mutateAsync(id);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Demo Code Management</h1>
          <p className="text-xs text-text-muted mt-0.5">Generate and manage demo access codes for prospects.</p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)}>
          <Plus className="h-3.5 w-3.5" />
          Generate Code
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-3">
          <p className="text-2xs text-text-muted">Active Codes</p>
          <p className="text-xl font-bold text-text-primary mt-0.5">
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (stats?.activeCodes ?? 0)}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-2xs text-text-muted">Total Generated</p>
          <p className="text-xl font-bold text-text-primary mt-0.5">
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (stats?.totalCodes ?? 0)}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-2xs text-text-muted">Total Uses</p>
          <p className="text-xl font-bold text-text-primary mt-0.5">
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (stats?.totalUses ?? 0)}
          </p>
        </Card>
        <Card className="p-3">
          <p className="text-2xs text-text-muted">Expired Codes</p>
          <p className="text-xl font-bold text-text-primary mt-0.5">
            {statsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (stats?.expiredCodes ?? 0)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            type="text"
            placeholder="Search codes or labels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-surface-0 pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>
        <div className="inline-flex items-center gap-1 rounded-lg bg-surface-2 p-1">
          {['all', 'active', 'expired', 'revoked'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors capitalize',
                statusFilter === s
                  ? 'bg-surface-1 text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Code List */}
      {codesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCodes.map((code) => {
            const status = getCodeStatus(code);
            const statusCfg = STATUS_CONFIG[status];
            const StatusIcon = statusCfg.icon;
            const maxUsages = code.maxUsages ?? 1;
            const usageCount = code.usageCount ?? 0;
            const usagePercent = maxUsages > 0 ? (usageCount / maxUsages) * 100 : 0;
            const modules = parseModulesEnabled(code.modulesEnabled);
            const daysLeft = Math.max(0, Math.ceil(
              (new Date(code.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            ));

            return (
              <Card key={code.id} className="p-4 hover:border-border-hover transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Code + Label */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-bold font-mono text-text-primary">{code.code}</code>
                      <button
                        onClick={() => handleCopy(code.code)}
                        className="text-text-muted hover:text-text-primary transition-colors"
                        title="Copy code"
                      >
                        {copiedCode === code.code ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <Badge variant={statusCfg.variant}>
                        <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                        {statusCfg.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{code.label ?? 'No label'}</p>
                    <div className="flex items-center gap-3 mt-1 text-2xs text-text-muted">
                      <span>Template: <span className="text-text-secondary">{TEMPLATE_LABELS[code.template] ?? code.template}</span></span>
                      <span>Modules: <span className="text-text-secondary">{modules.length}</span></span>
                      {status === 'active' && (
                        <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}</span>
                      )}
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <p className="text-xs font-medium text-text-primary">{usageCount} / {maxUsages}</p>
                      <p className="text-2xs text-text-muted">uses</p>
                      <div className="w-20 h-1.5 rounded-full bg-surface-2 mt-1">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            usagePercent > 80 ? 'bg-amber-500' : 'bg-brand-500'
                          )}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(`https://demo.yoursite.com?code=${code.code}`)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                        title="Copy demo link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                      {status === 'active' && (
                        <button
                          onClick={() => handleRevoke(code.id)}
                          disabled={revokeMutation.isPending}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
                          title="Revoke code"
                        >
                          {revokeMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Ban className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredCodes.length === 0 && (
            <div className="text-center py-12">
              <KeyRound className="h-8 w-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-text-muted">No demo codes found.</p>
              <p className="text-xs text-text-muted mt-0.5">Try adjusting your filters or generate a new code.</p>
            </div>
          )}
        </div>
      )}

      {/* Generate Modal */}
      <GenerateCodeModal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
      />
    </div>
  );
}

// ─── Generate Code Modal ───

function GenerateCodeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [label, setLabel] = useState('');
  const [template, setTemplate] = useState<string>('manufacturing');
  const [expDays, setExpDays] = useState<string>('14');
  const [maxUses, setMaxUses] = useState('50');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateDemoCode();

  const handleGenerate = async () => {
    setError(null);
    try {
      const result = await createMutation.mutateAsync({
        label: label.trim(),
        template,
        maxUsages: parseInt(maxUses, 10) || 50,
        expiryDays: parseInt(expDays, 10) || 14,
      });
      setGeneratedCode(result.code);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to generate code');
    }
  };

  const handleClose = () => {
    setLabel('');
    setTemplate('manufacturing');
    setExpDays('14');
    setMaxUses('50');
    setGeneratedCode(null);
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Generate Demo Code" size="md">
      {!generatedCode ? (
        <div className="space-y-4">
          <Input
            label="Label"
            placeholder="e.g., Acme Corp Sales Demo"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Select
            label="Template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            options={[
              { label: 'Manufacturing', value: 'manufacturing' },
              { label: 'Distribution', value: 'distribution' },
              { label: 'Full Platform', value: 'full' },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Expires In"
              value={expDays}
              onChange={(e) => setExpDays(e.target.value)}
              options={[
                { label: '7 days', value: '7' },
                { label: '14 days', value: '14' },
                { label: '30 days', value: '30' },
              ]}
            />
            <Input
              label="Max Uses"
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={!label.trim() || createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <KeyRound className="h-3.5 w-3.5" />
              )}
              {createMutation.isPending ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 mx-auto mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-text-secondary mb-2">Demo code generated successfully!</p>
          <code className="block text-2xl font-bold font-mono text-text-primary my-4">
            {generatedCode}
          </code>
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={() => navigator.clipboard.writeText(generatedCode!)}
            >
              <Copy className="h-3 w-3" />
              Copy Code
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(`https://demo.yoursite.com?code=${generatedCode}`)}
            >
              <ExternalLink className="h-3 w-3" />
              Copy Link
            </Button>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <Button variant="secondary" onClick={handleClose} className="w-full">Done</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
