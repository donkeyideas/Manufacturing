import { useState, useMemo } from 'react';
import { Check, DollarSign, Users, TrendingUp, Plus } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent, Badge, Button, Modal, cn,
} from '@erp/ui';
import { formatCurrency } from '@erp/shared';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

interface Plan {
  name: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  tenantCount: number;
  color: string;
  popular?: boolean;
}

const DEFAULT_COLORS = ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4'];

export function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      name: 'Starter',
      price: 595,
      interval: 'month',
      description: 'For small manufacturers getting started',
      features: ['Up to 10 users', '5 modules', 'Email support', '5GB storage', 'Basic reporting'],
      tenantCount: 12,
      color: '#10b981',
    },
    {
      name: 'Professional',
      price: 1490,
      interval: 'month',
      description: 'For growing manufacturing companies',
      features: [
        'Up to 25 users', 'All modules', 'Priority support', '25GB storage',
        'Advanced reporting', 'API access', 'Custom workflows',
      ],
      tenantCount: 14,
      color: '#8b5cf6',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 4990,
      interval: 'month',
      description: 'For large-scale manufacturing operations',
      features: [
        'Unlimited users', 'All modules', 'Dedicated support', 'Unlimited storage',
        'Custom reporting', 'Full API access', 'Custom workflows', 'SSO / SAML',
        'SLA guarantee', 'On-premise option',
      ],
      tenantCount: 8,
      color: '#3b82f6',
    },
  ]);

  const totalMRR = useMemo(
    () => plans.reduce((sum, p) => sum + p.price * p.tenantCount, 0),
    [plans],
  );

  // --- Modal state for editing / creating a plan ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formDescription, setFormDescription] = useState('');
  const [formFeatures, setFormFeatures] = useState('');

  const isCreating = editingIndex === null;

  function openEditModal(index: number) {
    const plan = plans[index];
    setEditingIndex(index);
    setFormName(plan.name);
    setFormPrice(plan.price);
    setFormDescription(plan.description);
    setFormFeatures(plan.features.join('\n'));
    setModalOpen(true);
  }

  function openCreateModal() {
    setEditingIndex(null);
    setFormName('');
    setFormPrice(0);
    setFormDescription('');
    setFormFeatures('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingIndex(null);
  }

  function handleSave() {
    const features = formFeatures
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (isCreating) {
      const newPlan: Plan = {
        name: formName,
        price: formPrice,
        interval: 'month',
        description: formDescription,
        features,
        tenantCount: 0,
        color: DEFAULT_COLORS[plans.length % DEFAULT_COLORS.length],
      };
      setPlans((prev) => [...prev, newPlan]);
    } else {
      setPlans((prev) =>
        prev.map((plan, i) =>
          i === editingIndex
            ? { ...plan, name: formName, price: formPrice, description: formDescription, features }
            : plan,
        ),
      );
    }

    closeModal();
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Pricing Management</h1>
          <p className="text-xs text-text-muted mt-0.5">Manage subscription tiers and platform pricing.</p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create Plan
        </Button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, index) => (
          <Card
            key={plan.name}
            className={cn(
              'relative flex flex-col',
              plan.popular && 'border-brand-500 shadow-md',
            )}
          >
            {plan.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <Badge variant="primary">Most Popular</Badge>
              </div>
            )}

            <CardHeader>
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: plan.color }}
                />
                <CardTitle>{plan.name}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col flex-1">
              {/* Price */}
              <div className="mb-3">
                <span className="text-2xl font-bold text-text-primary">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-xs text-text-muted ml-1">/ {plan.interval}</span>
              </div>

              <p className="text-xs text-text-muted mb-4">{plan.description}</p>

              {/* Features */}
              <ul className="space-y-2 mb-4 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Tenant Count */}
              <div className="flex items-center gap-1.5 mb-4">
                <Users className="h-3.5 w-3.5 text-text-muted" />
                <span className="text-xs text-text-muted">
                  {plan.tenantCount} active tenants
                </span>
              </div>

              {/* Action */}
              <Button variant="secondary" className="w-full" onClick={() => openEditModal(index)}>
                Edit Plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-text-muted" />
            <CardTitle>Revenue Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total MRR */}
            <div className="rounded-md bg-surface-2 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="h-3.5 w-3.5 text-text-muted" />
                <p className="text-2xs text-text-muted">Total MRR</p>
              </div>
              <p className="text-xl font-bold text-text-primary">
                {formatCurrency(totalMRR)}
              </p>
            </div>

            {/* Per-plan breakdown */}
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-md bg-surface-2 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: plan.color }}
                  />
                  <p className="text-2xs text-text-muted">{plan.name} MRR</p>
                </div>
                <p className="text-xl font-bold text-text-primary">
                  {formatCurrency(plan.price * plan.tenantCount)}
                </p>
                <p className="text-2xs text-text-muted mt-0.5">
                  {plan.tenantCount} tenants x {formatCurrency(plan.price)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit / Create Plan Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={isCreating ? 'Create Plan' : `Edit Plan \u2014 ${formName}`}
        description={
          isCreating
            ? 'Add a new subscription tier to the platform.'
            : 'Update the details for this subscription tier.'
        }
        size="lg"
      >
        <div className="space-y-4">
          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Plan Name
            </label>
            <input
              type="text"
              className={INPUT_CLS}
              placeholder="e.g. Professional"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Price (per month)
            </label>
            <input
              type="number"
              min={0}
              className={INPUT_CLS}
              placeholder="0"
              value={formPrice}
              onChange={(e) => setFormPrice(Number(e.target.value))}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Description
            </label>
            <input
              type="text"
              className={INPUT_CLS}
              placeholder="Short description of the plan"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Features (one per line)
            </label>
            <textarea
              rows={5}
              className={INPUT_CLS}
              placeholder={'Up to 10 users\n5 modules\nEmail support'}
              value={formFeatures}
              onChange={(e) => setFormFeatures(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {isCreating ? 'Create Plan' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
