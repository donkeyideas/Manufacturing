import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

export function HeroSection() {
  const navigate = useNavigate();
  const [demoCode, setDemoCode] = useState('');

  const handleDemo = () => {
    if (demoCode.trim()) {
      navigate(`/dashboard?code=${demoCode.trim()}`);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-4 py-1.5 text-xs text-text-secondary mb-6">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Trusted by 500+ manufacturers worldwide
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
          The Manufacturing ERP
          <br />
          <span className="text-blue-600">Built for Growth</span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
          Streamline production, automate payroll, manage inventory, and make data-driven
          decisions — all from one powerful platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Play className="h-4 w-4" />
            Explore Demo
          </button>
          <button
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-0 px-6 py-3 text-sm font-medium text-text-primary hover:bg-surface-1 transition-colors"
          >
            View Pricing
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
          <input
            type="text"
            value={demoCode}
            onChange={(e) => setDemoCode(e.target.value)}
            placeholder="Enter demo code"
            className="flex-1 rounded-lg border border-border bg-surface-0 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
          />
          <button
            onClick={handleDemo}
            className="rounded-lg bg-surface-2 px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-3 transition-colors whitespace-nowrap"
          >
            Try Demo
          </button>
        </div>
      </div>
    </section>
  );
}
