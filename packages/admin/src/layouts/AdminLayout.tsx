import { type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, KeyRound, CreditCard, DollarSign,
  Shield, Search, Settings, Sun, Moon, Bell, Mail, FileText, LogOut,
} from 'lucide-react';
import { cn } from '@erp/ui';
import { useTheme } from '../app/ThemeProvider';
import { useAdminAuth } from '../data-layer/useAdminAuth';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'User Management', path: '/users', icon: Users },
  { label: 'Demo Codes', path: '/demo-codes', icon: KeyRound },
  { label: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
  { label: 'Pricing', path: '/pricing', icon: DollarSign },
  { label: 'Security', path: '/security', icon: Shield },
  { label: 'SEO & GEO', path: '/seo', icon: Search },
  { label: 'Inbox', path: '/inbox', icon: Mail },
  { label: 'Blog', path: '/blog', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { admin, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">
      {/* Sidebar */}
      <aside className="w-56 flex flex-col border-r border-border bg-surface-1">
        <div className="flex h-12 items-center border-b border-border px-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 text-white text-xs font-bold">
              A
            </div>
            <span className="text-sm font-semibold text-text-primary">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors mb-0.5',
                  isActive
                    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center justify-between border-b border-border bg-surface-1 px-4">
          <span className="text-xs text-text-muted">
            Admin / {NAV_ITEMS.find((i) => i.path === location.pathname)?.label || 'Dashboard'}
          </span>
          <div className="flex items-center gap-2">
            <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-red-600 hover:bg-surface-2 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs font-medium" title={admin?.email || ''}>
              {admin ? `${admin.firstName[0]}${admin.lastName[0]}` : 'A'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
