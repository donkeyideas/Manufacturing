import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-surface-1 border-t border-border">
      <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          Ready to Transform Your Manufacturing?
        </h2>
        <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
          Start your 14-day free trial today. No credit card required.
          See why 500+ manufacturers trust our platform.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-0 px-8 py-3 text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors"
          >
            View Pricing
          </button>
        </div>
      </div>
    </section>
  );
}
