import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@erp/ui';
import { useAuth } from '../data-layer/hooks/useAuth';
import { Eye, EyeOff, LogIn, KeyRound } from 'lucide-react';
import { apiClient } from '../data-layer/api/client';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

type TabMode = 'login' | 'demo';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuth();
  const [tab, setTab] = useState<TabMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Demo code fields
  const [demoEmail, setDemoEmail] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message;
      setError(typeof msg === 'string' ? msg : 'Invalid email or password');
    }
  };

  const handleDemoAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsDemoLoading(true);
    try {
      const res = await apiClient.post('/admin/demo-codes/validate', {
        code: demoCode.toUpperCase(),
        email: demoEmail,
      });
      // Demo code is valid — set demo mode and navigate
      const data = res.data.data;
      sessionStorage.setItem('demo_access', JSON.stringify({
        email: demoEmail,
        template: data.template,
        modulesEnabled: data.modulesEnabled,
        expiresAt: data.expiresAt,
      }));
      // Force app into demo mode by setting the flag
      sessionStorage.setItem('force_demo', 'true');
      window.location.href = '/dashboard';
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message;
      setError(typeof msg === 'string' ? msg : 'Invalid demo code');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
          <p className="mt-2 text-sm text-text-muted">Sign in to your manufacturing ERP</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex mb-4 rounded-lg bg-surface-1 p-1 border border-border">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === 'login'
                ? 'bg-surface-0 text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </button>
          <button
            onClick={() => { setTab('demo'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
              tab === 'demo'
                ? 'bg-surface-0 text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            Demo Access
          </button>
        </div>

        <Card>
          <CardContent className="p-6">
            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 px-3 py-2 text-sm text-danger-700 dark:text-danger-300">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                  <input
                    className={INPUT_CLS}
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
                  <div className="relative">
                    <input
                      className={INPUT_CLS + ' pr-10'}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleDemoAccess} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 px-3 py-2 text-sm text-danger-700 dark:text-danger-300">
                    {error}
                  </div>
                )}
                <p className="text-xs text-text-muted">
                  Enter your email and demo code to access a live demo of the platform.
                </p>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                  <input
                    className={INPUT_CLS}
                    type="email"
                    placeholder="you@company.com"
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Demo Code</label>
                  <input
                    className={INPUT_CLS + ' uppercase tracking-wider font-mono'}
                    type="text"
                    placeholder="DEMO-XXXX"
                    value={demoCode}
                    onChange={(e) => setDemoCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isDemoLoading}>
                  {isDemoLoading ? 'Verifying...' : 'Access Demo'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500">
            Create one
          </Link>
        </p>
        <p className="mt-2 text-center text-sm text-text-muted">
          <Link to="/" className="text-text-muted hover:text-text-primary">
            Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
