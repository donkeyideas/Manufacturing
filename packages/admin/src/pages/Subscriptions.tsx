import { useState, useMemo } from 'react';
import {
  DollarSign, Users, TrendingDown, BarChart3,
  Calendar, CreditCard, Settings, ArrowUpRight,
  KeyRound, Plus, Copy, Ban, CheckCircle2, Clock, XCircle, ExternalLink, Search,
} from 'lucide-react';
import {
  Card, Badge, Button, Input, Modal, Select, cn,
} from '@erp/ui';
import { formatCurrency } from '@erp/shared';
import { useTenants, useDemoCodes, useDemoCodeStats, useCreateDemoCode, useRevokeDemoCode } from '../data-layer/useAdminData';
import type { DemoCode, Tenant } from '../data-layer/useAdminData';

type TabType = 'subscriptions' | 'demo-codes';

const PLAN_BADGE_VARIANT: Record<string, 'primary' | 'info' | 'success' | 'warning'> = {
  enterprise: 'primary',
  professional: 'info',
  starter: 'success',
  trial: 'warning',
};

const PLAN_FILTERS = ['All', 'Enterprise', 'Professional', 'Starter', 'Trial'] as const;

function getDemoCodeStatus(code: DemoCode): 'active' | 'expired' | 'revoked' {
  if (!code.isActive) return 'revoked';
  if (new Date(code.expiresAt) <= new Date()) return 'expired';
  return 'active';
}

const STATUS_CONFIG = {
  active: { label: 'Active', variant: 'success' as const, icon: CheckCircle2 },
  expired: { label: 'Expired', variant: 'default' as const, icon: Clock },
  revoked: { label: 'Revoked', variant: 'danger' as const, icon: XCircle },
};

const TEMPLATE_LABELS: Record<string, string> = {
  manufacturing: 'Manufacturing',
  distribution: 'Distribution',
  full: 'Full Platform',
};

export function Subscriptions() {
  const [tab, setTab] = useState<TabType>('subscriptions');
  const [planFilter, setPlanFilter] = useState<string>('All');

  // API data
  const { data: tenants, isLoading: tenantsLoading } = useTenants();
  const { data: demoCodes, isLoading: codesLoading } = useDemoCodes();
  const { data: codeStats } = useDemoCodeStats();

  const filteredTenants = useMemo(() => {
    if (!tenants) return [];
    if (planFilter === 'All') return tenants;
    return tenants.filter((t) => (t.plan || 'trial').toLowerCase() === planFilter.toLowerCase());
  }, [tenants, planFilter]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Subscriptions</h1>
        <p className="text-xs text-text-muted mt-0.5">Manage tenant subscriptions and demo access codes.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-1 w-fit">
        <button
          onClick={() => setTab('subscriptions')}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition-colors',
            tab === 'subscriptions' ? 'bg-surface-1 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
          )}
        >
          <CreditCard className="h-3.5 w-3.5" />
          Subscriptions
        </button>
        <button
          onClick={() => setTab('demo-codes')}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-4 py-1.5 text-xs font-medium transition-colors',
            tab === 'demo-codes' ? 'bg-surface-1 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
          )}
        >
          <KeyRound className="h-3.5 w-3.5" />
          Demo Codes
          {codeStats && codeStats.activeCodes > 0 && (
            <span className="ml-1 rounded-full bg-brand-500 text-white text-[10px] px-1.5 py-0.5 font-medium">
              {codeStats.activeCodes}
            </span>
          )}
        </button>
      </div>

      {tab === 'subscriptions' ? (
        <SubscriptionsTab tenants={filteredTenants} isLoading={tenantsLoading} planFilter={planFilter} setPlanFilter={setPlanFilter} />
      ) : (
        <DemoCodesTab codes={demoCodes || []} isLoading={codesLoading} stats={codeStats} />
      )}
    </div>
  );
}

// ─── Subscriptions Tab ───

function SubscriptionsTab({
  tenants, isLoading, planFilter, setPlanFilter,
}: {
  tenants: Tenant[];
  isLoading: boolean;
  planFilter: string;
  setPlanFilter: (v: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg border border-border bg-surface-1 animate-skeleton" />)}
        </div>
        {[0, 1, 2].map(i => <div key={i} className="h-16 rounded-lg border border-border bg-surface-1 animate-skeleton" />)}
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Total Tenants</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{tenants.length}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Active</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{tenants.filter(t => t.isActive).length}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Trial</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{tenants.filter(t => (t.plan || 'trial') === 'trial').length}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Enterprise</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{tenants.filter(t => t.plan === 'enterprise').length}</p>
        </Card>
      </div>

      {/* Plan Filter */}
      <div className="inline-flex items-center gap-1 rounded-lg bg-surface-2 p-1">
        {PLAN_FILTERS.map((plan) => (
          <button
            key={plan}
            onClick={() => setPlanFilter(plan)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              planFilter === plan ? 'bg-surface-1 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {plan}
          </button>
        ))}
      </div>

      {/* Tenant List */}
      <div className="space-y-2">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="p-4 hover:border-border-hover transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{tenant.name}</p>
                  <Badge variant={PLAN_BADGE_VARIANT[(tenant.plan || 'trial').toLowerCase()] || 'warning'}>
                    {tenant.plan || 'Trial'}
                  </Badge>
                  {tenant.isActive ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="danger">Inactive</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-2xs text-text-muted">
                  <span>Slug: <span className="text-text-secondary font-mono">{tenant.slug}</span></span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created: {new Date(tenant.createdAt).toLocaleDateString()}
                  </span>
                  {tenant.industryType && (
                    <span>Industry: <span className="text-text-secondary">{tenant.industryType}</span></span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary">
                  <Settings className="h-3 w-3" />
                  Manage
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {tenants.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No tenants found.</p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Demo Codes Tab ───

function DemoCodesTab({
  codes, isLoading, stats,
}: {
  codes: DemoCode[];
  isLoading: boolean;
  stats?: { totalCodes: number; activeCodes: number; totalUses: number; expiredCodes: number } | null;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const revokeMutation = useRevokeDemoCode();

  const filteredCodes = useMemo(() => {
    return codes.filter((code) => {
      const status = getDemoCodeStatus(code);
      const matchesSearch = search === '' ||
        code.code.toLowerCase().includes(search.toLowerCase()) ||
        (code.label || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [codes, search, statusFilter]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRevoke = async (id: string) => {
    await revokeMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-20 rounded-lg border border-border bg-surface-1 animate-skeleton" />)}
        </div>
        {[0, 1, 2].map(i => <div key={i} className="h-16 rounded-lg border border-border bg-surface-1 animate-skeleton" />)}
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">Generate and manage demo access codes for prospects.</p>
        <Button onClick={() => setShowGenerateModal(true)}>
          <Plus className="h-3.5 w-3.5" />
          Generate Code
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-3">
          <p className="text-2xs text-text-muted">Active Codes</p>
          <p className="text-xl font-bold text-text-primary mt-0.5">{stats?.activeCodes ?? 0}</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xs text-text-muted">Total Generated</p>
          <p className="text-xl font-bold text-text-primary mt-0.5">{stats?.totalCodes ?? 0}</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xs text-text-muted">Total Uses</p>
          <p className="text-xl font-bold text-text-primary mt-0.5">{stats?.totalUses ?? 0}</p>
        </Card>
        <Card className="p-3">
          <p className="text-2xs text-text-muted">Expired</p>
          <p className="text-xl font-bold text-text-primary mt-0.5">{stats?.expiredCodes ?? 0}</p>
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
                statusFilter === s ? 'bg-surface-1 text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
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
          const status = getDemoCodeStatus(code);
          const statusCfg = STATUS_CONFIG[status];
          const StatusIcon = statusCfg.icon;
          const usagePercent = code.maxUsages ? ((code.usageCount || 0) / code.maxUsages) * 100 : 0;
          const daysLeft = Math.max(0, Math.ceil(
            (new Date(code.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ));

          return (
            <Card key={code.id} className="p-4 hover:border-border-hover transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                  <p className="text-xs text-text-secondary mt-0.5">{code.label || 'No label'}</p>
                  <div className="flex items-center gap-3 mt-1 text-2xs text-text-muted">
                    <span>Template: <span className="text-text-secondary">{TEMPLATE_LABELS[code.template] || code.template}</span></span>
                    {status === 'active' && (
                      <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-right">
                    <p className="text-xs font-medium text-text-primary">{code.usageCount || 0} / {code.maxUsages || 0}</p>
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
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(`${window.location.origin}/login?code=${code.code}`)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
                      title="Copy demo link"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                    {status === 'active' && (
                      <button
                        onClick={() => handleRevoke(code.id)}
                        disabled={revokeMutation.isPending}
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
            <p className="text-xs text-text-muted mt-0.5">Generate a new code to get started.</p>
          </div>
        )}
      </div>

      <GenerateCodeModal open={showGenerateModal} onClose={() => setShowGenerateModal(false)} />
    </>
  );
}

// ─── Generate Code Modal ───

function GenerateCodeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [label, setLabel] = useState('');
  const [template, setTemplate] = useState<string>('manufacturing');
  const [expDays, setExpDays] = useState<string>('14');
  const [maxUses, setMaxUses] = useState('50');
  const createMutation = useCreateDemoCode();
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleGenerate = async () => {
    const result = await createMutation.mutateAsync({
      label,
      template,
      maxUsages: Number(maxUses),
      expiryDays: Number(expDays),
    });
    setGeneratedCode(result.code);
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
            <Button onClick={handleGenerate} disabled={!label.trim() || createMutation.isPending}>
              <KeyRound className="h-3.5 w-3.5" />
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
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/login?code=${generatedCode}`)}
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
