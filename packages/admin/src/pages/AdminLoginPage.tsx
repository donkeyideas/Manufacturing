import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@erp/ui';
import { useAdminAuth } from '../data-layer/useAdminAuth';
import { Eye, EyeOff, Shield } from 'lucide-react';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, setup, isSettingUp } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message;
      if (typeof msg === 'string' && msg.includes('Admin setup')) {
        setIsSetupMode(true);
        setError('');
        return;
      }
      setError(typeof msg === 'string' ? msg : 'Invalid email or password');
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await setup({ email, password, firstName, lastName });
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message;
      setError(typeof msg === 'string' ? msg : 'Setup failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {isSetupMode ? 'Admin Setup' : 'Admin Login'}
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            {isSetupMode ? 'Create the first admin account' : 'Sign in to the admin panel'}
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={isSetupMode ? handleSetup : handleLogin} className="space-y-4">
              {error && (
                <div className="rounded-md bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 px-3 py-2 text-sm text-danger-700 dark:text-danger-300">
                  {error}
                </div>
              )}

              {isSetupMode && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">First Name</label>
                    <input className={INPUT_CLS} value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Last Name</label>
                    <input className={INPUT_CLS} value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
                <input
                  className={INPUT_CLS}
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
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

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoggingIn || isSettingUp}
              >
                {isSetupMode
                  ? (isSettingUp ? 'Creating Admin...' : 'Create Admin Account')
                  : (isLoggingIn ? 'Signing in...' : 'Sign In')
                }
              </Button>
            </form>

            {!isSetupMode && (
              <button
                onClick={() => setIsSetupMode(true)}
                className="mt-4 w-full text-center text-xs text-text-muted hover:text-text-primary"
              >
                First time? Set up admin account
              </button>
            )}
            {isSetupMode && (
              <button
                onClick={() => setIsSetupMode(false)}
                className="mt-4 w-full text-center text-xs text-text-muted hover:text-text-primary"
              >
                Already have an admin account? Sign in
              </button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
