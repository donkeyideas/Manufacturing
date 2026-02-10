import { useState, useMemo } from 'react';
import {
  DollarSign, Users, TrendingDown, BarChart3,
  Calendar, CreditCard, Settings, ArrowUpRight,
} from 'lucide-react';
import {
  Card, Badge, Button, cn,
} from '@erp/ui';
import { formatCurrency } from '@erp/shared';

type PlanType = 'Enterprise' | 'Professional' | 'Starter' | 'Trial';
type StatusType = 'active' | 'trial' | 'past_due';

interface Subscription {
  id: string;
  tenant: string;
  plan: PlanType;
  mrr: number;
  users: number;
  status: StatusType;
  startDate: string;
  nextBilling: string;
}

const PLAN_BADGE_VARIANT: Record<PlanType, 'primary' | 'info' | 'success' | 'warning'> = {
  Enterprise: 'primary',
  Professional: 'info',
  Starter: 'success',
  Trial: 'warning',
};

const STATUS_BADGE_VARIANT: Record<StatusType, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  trial: 'warning',
  past_due: 'danger',
};

const STATUS_LABELS: Record<StatusType, string> = {
  active: 'Active',
  trial: 'Trial',
  past_due: 'Past Due',
};

const PLAN_FILTERS = ['All', 'Enterprise', 'Professional', 'Starter', 'Trial'] as const;

export function Subscriptions() {
  const [planFilter, setPlanFilter] = useState<string>('All');

  const subscriptions = useMemo<Subscription[]>(() => [
    { id: 's-1', tenant: 'Acme Manufacturing', plan: 'Enterprise', mrr: 4990, users: 45, status: 'active', startDate: '2023-06-15', nextBilling: '2024-03-15' },
    { id: 's-2', tenant: 'Pacific Steel Works', plan: 'Professional', mrr: 1490, users: 18, status: 'active', startDate: '2023-09-01', nextBilling: '2024-03-01' },
    { id: 's-3', tenant: 'Coastal Fabrication', plan: 'Starter', mrr: 595, users: 8, status: 'active', startDate: '2024-01-10', nextBilling: '2024-03-10' },
    { id: 's-4', tenant: 'Mountain Parts Co.', plan: 'Trial', mrr: 0, users: 3, status: 'trial', startDate: '2024-02-01', nextBilling: 'N/A' },
    { id: 's-5', tenant: 'Tech Assemblies Inc.', plan: 'Enterprise', mrr: 4990, users: 52, status: 'active', startDate: '2023-03-20', nextBilling: '2024-03-20' },
    { id: 's-6', tenant: 'Delta Components', plan: 'Professional', mrr: 1490, users: 15, status: 'active', startDate: '2023-11-05', nextBilling: '2024-03-05' },
    { id: 's-7', tenant: 'Summit Metals', plan: 'Starter', mrr: 595, users: 5, status: 'past_due', startDate: '2023-08-15', nextBilling: '2024-02-15' },
    { id: 's-8', tenant: 'Precision Works LLC', plan: 'Professional', mrr: 1490, users: 22, status: 'active', startDate: '2023-07-01', nextBilling: '2024-03-01' },
    { id: 's-9', tenant: 'Harbor Industries', plan: 'Enterprise', mrr: 4990, users: 38, status: 'active', startDate: '2023-04-10', nextBilling: '2024-03-10' },
    { id: 's-10', tenant: 'Atlas Manufacturing', plan: 'Trial', mrr: 0, users: 2, status: 'trial', startDate: '2024-02-05', nextBilling: 'N/A' },
  ], []);

  const filteredSubscriptions = useMemo(() => {
    if (planFilter === 'All') return subscriptions;
    return subscriptions.filter((s) => s.plan === planFilter);
  }, [subscriptions, planFilter]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Subscriptions</h1>
        <p className="text-xs text-text-muted mt-0.5">Manage tenant subscriptions, plans, and billing.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Total MRR</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{formatCurrency(59920)}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Total Tenants</p>
          </div>
          <p className="text-xl font-bold text-text-primary">34</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Churn Rate</p>
          </div>
          <p className="text-xl font-bold text-text-primary">2.1%</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-3.5 w-3.5 text-text-muted" />
            <p className="text-2xs text-text-muted">Avg Revenue/Tenant</p>
          </div>
          <p className="text-xl font-bold text-text-primary">{formatCurrency(1762)}</p>
        </Card>
      </div>

      {/* Plan Filter Tabs */}
      <div className="inline-flex items-center gap-1 rounded-lg bg-surface-2 p-1">
        {PLAN_FILTERS.map((plan) => (
          <button
            key={plan}
            onClick={() => setPlanFilter(plan)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              planFilter === plan
                ? 'bg-surface-1 text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {plan}
          </button>
        ))}
      </div>

      {/* Subscription List */}
      <div className="space-y-2">
        {filteredSubscriptions.map((sub) => (
          <Card key={sub.id} className="p-4 hover:border-border-hover transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Tenant Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{sub.tenant}</p>
                  <Badge variant={PLAN_BADGE_VARIANT[sub.plan]}>{sub.plan}</Badge>
                  <Badge variant={STATUS_BADGE_VARIANT[sub.status]}>{STATUS_LABELS[sub.status]}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-2xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    MRR: <span className="text-text-secondary font-medium">{formatCurrency(sub.mrr)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {sub.users} users
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Started: {sub.startDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Next billing: {sub.nextBilling}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary">
                  <Settings className="h-3 w-3" />
                  Manage
                </Button>
                {sub.plan !== 'Enterprise' && (
                  <Button size="sm" variant="ghost">
                    <ArrowUpRight className="h-3 w-3" />
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-8 w-8 text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">No subscriptions found.</p>
            <p className="text-xs text-text-muted mt-0.5">Try adjusting your filter selection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
