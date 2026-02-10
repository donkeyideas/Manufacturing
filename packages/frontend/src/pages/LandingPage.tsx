import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory, BarChart3, Shield, Zap, ArrowRight,
  CheckCircle2, Sun, Moon,
} from 'lucide-react';
import { Button, cn } from '@erp/ui';
import { useTheme } from '../app/ThemeProvider';

const FEATURES = [
  { icon: Factory, title: 'Manufacturing', desc: 'BOMs, work orders, production tracking, quality control' },
  { icon: BarChart3, title: 'Financial', desc: 'GL, AP/AR, journal entries, financial statements' },
  { icon: Zap, title: 'AI-Powered', desc: 'Smart insights, demand forecasting, anomaly detection' },
  { icon: Shield, title: 'Enterprise-Ready', desc: 'Multi-tenant, RBAC, audit logs, SSO integration' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [demoCode, setDemoCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTryDemo = () => {
    if (!demoCode.trim()) {
      setError('Please enter a demo code');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate validation delay
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  const handleExploreDemo = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-surface-0/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-sm font-bold">
              E
            </div>
            <span className="text-base font-semibold text-text-primary">ERP Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/dashboard')}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 text-xs text-text-secondary mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Now in beta
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary tracking-tight leading-tight">
            The manufacturing ERP
            <br />
            <span className="text-brand-600 dark:text-brand-400">built for modern teams</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
            Manage your entire manufacturing operation - from procurement to production to financials - in one intelligent platform.
          </p>

          {/* CTA Group */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={handleExploreDemo}>
              Explore Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
            <span className="text-xs text-text-muted">or</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter demo code"
                  value={demoCode}
                  onChange={(e) => { setDemoCode(e.target.value.toUpperCase()); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleTryDemo()}
                  className={cn(
                    'w-48 rounded-md border bg-surface-0 px-3 py-2 text-sm text-text-primary font-mono placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors',
                    error ? 'border-red-500' : 'border-border'
                  )}
                />
                {error && (
                  <p className="absolute -bottom-5 left-0 text-2xs text-red-500">{error}</p>
                )}
              </div>
              <Button variant="secondary" onClick={handleTryDemo} loading={loading}>
                Go
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 border-t border-border bg-surface-1">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-text-primary text-center mb-10">
            Everything you need to run your manufacturing business
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-xl border border-border bg-surface-0 p-5 hover:shadow-md transition-shadow">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">{feature.title}</h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-6 mb-8">
            {['Acme Manufacturing', 'Pacific Steel', 'Tech Assemblies'].map((name) => (
              <span key={name} className="text-xs font-medium text-text-muted">{name}</span>
            ))}
          </div>
          <div className="space-y-2">
            {['Full inventory and production tracking', 'Real-time financial reporting', 'AI-powered demand forecasting', 'Multi-location warehouse management'].map((item) => (
              <div key={item} className="flex items-center gap-2 justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-xs text-text-muted">ERP Platform v3.0</p>
          <p className="text-xs text-text-muted">Built for manufacturers, by manufacturers.</p>
        </div>
      </footer>
    </div>
  );
}
