import { Navigate } from 'react-router-dom';
import { useAuth } from '../data-layer/hooks/useAuth';
import { useAppMode } from '../data-layer/providers/AppModeProvider';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isDemo } = useAppMode();
  const { isAuthenticated, isLoading } = useAuth();

  // Demo mode: no auth required
  if (isDemo) return <>{children}</>;

  // Loading: show minimal spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-0">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated: redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
