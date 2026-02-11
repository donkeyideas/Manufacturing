import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@erp/ui';
import { useAuth } from '../data-layer/hooks/useAuth';
import { Eye, EyeOff, Check, X, Building2, UserPlus } from 'lucide-react';

const INPUT_CLS = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';

function PasswordStrength({ password }: { password: string }) {
  const checks = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
  ], [password]);

  const strength = checks.filter(c => c.met).length;
  const colors = ['bg-danger-500', 'bg-warning-500', 'bg-warning-400', 'bg-success-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? colors[strength - 1] : 'bg-surface-2'}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength <= 1 ? 'text-danger-500' : strength <= 2 ? 'text-warning-500' : 'text-success-500'}`}>
        {labels[strength - 1] || ''}
      </p>
      <div className="space-y-1">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            {check.met ? (
              <Check className="h-3 w-3 text-success-500" />
            ) : (
              <X className="h-3 w-3 text-text-muted" />
            )}
            <span className={check.met ? 'text-success-600 dark:text-success-400' : 'text-text-muted'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isRegistering } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');

  const passwordsMatch = password === confirmPassword;
  const isFormValid = firstName && lastName && companyName && email && password.length >= 8 && passwordsMatch && agreedToTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    if (!agreedToTerms) {
      setError('You must agree to the terms to continue');
      return;
    }

    try {
      await register({ email, password, firstName, lastName, companyName });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.response?.data?.message ?? err?.message;
      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
          <p className="mt-2 text-sm text-text-muted">Set up your manufacturing ERP in under 2 minutes</p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-3 justify-center">
          <div className="flex items-center gap-2 text-xs font-medium text-brand-600">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white text-[10px]">1</div>
            Your details
          </div>
          <div className="h-px w-8 bg-border" />
          <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-text-muted text-[10px]">2</div>
            Dashboard
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-md bg-danger-50 dark:bg-danger-950 border border-danger-200 dark:border-danger-800 px-3 py-2 text-sm text-danger-700 dark:text-danger-300">
                  {error}
                </div>
              )}

              {/* Company section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-text-muted" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Company</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Company Name</label>
                  <input
                    className={INPUT_CLS}
                    placeholder="Acme Manufacturing Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-text-muted">This creates your workspace. You can invite team members later.</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Personal section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <UserPlus className="h-4 w-4 text-text-muted" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Your Details</span>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">First Name</label>
                      <input
                        className={INPUT_CLS}
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Last Name</label>
                      <input
                        className={INPUT_CLS}
                        placeholder="Smith"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Work Email</label>
                    <input
                      className={INPUT_CLS}
                      type="email"
                      placeholder="john@acme-mfg.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Password section */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
                  <div className="relative">
                    <input
                      className={INPUT_CLS + ' pr-10'}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <PasswordStrength password={password} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Confirm Password</label>
                  <input
                    className={`${INPUT_CLS} ${confirmPassword && !passwordsMatch ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1 text-xs text-danger-500">Passwords do not match</p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span className="text-xs text-text-muted leading-relaxed">
                  I agree to the{' '}
                  <span className="text-brand-600 hover:underline cursor-pointer">Terms of Service</span>
                  {' '}and{' '}
                  <span className="text-brand-600 hover:underline cursor-pointer">Privacy Policy</span>
                </span>
              </label>

              <Button type="submit" className="w-full" disabled={isRegistering || !isFormValid}>
                {isRegistering ? 'Creating your workspace...' : 'Create Account'}
              </Button>

              <p className="text-center text-xs text-text-muted">
                Free to use. No credit card required.
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
            Sign in
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
