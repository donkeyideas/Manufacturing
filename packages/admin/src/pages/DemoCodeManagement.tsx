import { useState, useMemo } from 'react';
import {
  KeyRound, Plus, Copy, Ban, Search, CheckCircle2,
  Clock, XCircle, ExternalLink,
} from 'lucide-react';
import {
  Card, Badge, Button, Input, Modal, Select, cn,
} from '@erp/ui';
import { formatPercent } from '@erp/shared';
import { getDemoCodeList, getDemoCodeStats } from '@erp/demo-data';

const TEMPLATE_LABELS: Record<string, string> = {
  manufacturing: 'Manufacturing',
  distribution: 'Distribution',
  full: 'Full Platform',
};

const STATUS_CONFIG = {
  active: { label: 'Active', variant: 'success' as const, icon: CheckCircle2 },
  expired: { label: 'Expired', variant: 'default' as const, icon: Clock },
  revoked: { label: 'Revoked', variant: 'danger' as const, icon: XCircle },
};

export function DemoCodeManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const codes = useMemo(() => getDemoCodeList(), []);
  const stats = useMemo(() => getDemoCodeStats(), []);

  const filteredCodes = useMemo(() => {
    return codes.filter((code) => {
      const matchesSearch = search === '' ||
        code.code.toLowerCase().includes(search.toLowerCase()) ||
        code.label.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [codes, search, statusFilter]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const activeCodes = codes.filter((c) => c.status === 'active').length;
  const totalUsage = codes.reduce((sum, c) => sum + c.usageCount, 0);

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
          <p className="text-xl font-bold text-text-primary mt-0.5">{activeCodes}</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xs text-text-muted">Total Generated</p>
          <p className="text-xl font-bold text-text-primary mt-0.5">{codes.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xs text-text-muted">Total Uses</p>
          <p className="text-xl font-bold text-text-primary mt-0.5">{totalUsage}</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xs text-text-muted">Conversion Rate</p>
          <p className="text-xl font-bold text-emerald-600 mt-0.5">{formatPercent(stats.conversionRate)}</p>
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
      <div className="space-y-2">
        {filteredCodes.map((code) => {
          const statusCfg = STATUS_CONFIG[code.status];
          const StatusIcon = statusCfg.icon;
          const usagePercent = (code.usageCount / code.maxUses) * 100;
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
                  <p className="text-xs text-text-secondary mt-0.5">{code.label}</p>
                  <div className="flex items-center gap-3 mt-1 text-2xs text-text-muted">
                    <span>Template: <span className="text-text-secondary">{TEMPLATE_LABELS[code.template]}</span></span>
                    <span>Modules: <span className="text-text-secondary">{code.modulesEnabled.length}</span></span>
                    {code.status === 'active' && (
                      <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}</span>
                    )}
                  </div>
                </div>

                {/* Usage */}
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-right">
                    <p className="text-xs font-medium text-text-primary">{code.usageCount} / {code.maxUses}</p>
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
                    {code.status === 'active' && (
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        title="Revoke code"
                      >
                        <Ban className="h-3.5 w-3.5" />
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

  const handleGenerate = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const code = 'DEMO-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setGeneratedCode(code);
  };

  const handleClose = () => {
    setLabel('');
    setTemplate('manufacturing');
    setExpDays('14');
    setMaxUses('50');
    setGeneratedCode(null);
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
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={!label.trim()}>
              <KeyRound className="h-3.5 w-3.5" />
              Generate
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
