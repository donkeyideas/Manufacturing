import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { getPricingTiers } from '@erp/demo-data';
import { cn } from '@erp/ui';

export function PricingSection() {
  const navigate = useNavigate();
  const tiers = useMemo(() => getPricingTiers(), []);

  return (
    <section id="pricing" className="py-20 md:py-28 bg-surface-1 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Start small and scale as you grow. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'relative rounded-xl border bg-surface-0 p-6 flex flex-col',
                tier.isPopular
                  ? 'border-blue-500 shadow-lg shadow-blue-500/10 scale-105'
                  : 'border-border'
              )}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-2xs font-medium text-white">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  {tier.price > 0 ? (
                    <>
                      <span className="text-4xl font-bold text-text-primary">${tier.price}</span>
                      <span className="text-sm text-text-muted">/{tier.period}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold text-text-primary">Custom</span>
                  )}
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/dashboard')}
                className={cn(
                  'w-full rounded-lg py-2.5 text-sm font-medium transition-colors',
                  tier.isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-surface-2 text-text-primary hover:bg-surface-3'
                )}
              >
                {tier.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
