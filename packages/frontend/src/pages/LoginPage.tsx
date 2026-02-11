import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@erp/ui';
import { useAuth } from '../data-layer/hooks/useAuth';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Invalid email or password');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">
            E
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Sign in to ERP Platform</h1>
          <p className="mt-1 text-sm text-text-muted">Enter your credentials to continue</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <input
                  className={INPUT_CLS}
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
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
