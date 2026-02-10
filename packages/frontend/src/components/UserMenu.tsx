import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Moon, Sun, HelpCircle } from 'lucide-react';
import { cn, Badge } from '@erp/ui';
import { useTheme } from '../app/ThemeProvider';
import { useAppMode } from '../data-layer/providers/AppModeProvider';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isDemo } = useAppMode();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const menuItems = [
    { icon: User, label: 'Profile', onClick: () => navigate('/settings/profile') },
    { icon: Settings, label: 'Settings', onClick: () => navigate('/settings') },
    { icon: theme === 'dark' ? Sun : Moon, label: theme === 'dark' ? 'Light Mode' : 'Dark Mode', onClick: toggleTheme },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => navigate('/settings') },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 text-xs font-medium hover:ring-2 hover:ring-brand-200 dark:hover:ring-brand-800 transition-all"
      >
        JD
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-lg border border-border bg-surface-1 shadow-lg animate-slide-up overflow-hidden">
          {/* User info */}
          <div className="px-3 py-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 text-sm font-medium">
                JD
              </div>
              <div>
                <p className="text-xs font-medium text-text-primary">John Doe</p>
                <p className="text-2xs text-text-muted">john@company.com</p>
              </div>
            </div>
            {isDemo && (
              <Badge variant="warning" className="w-full justify-center mt-2 py-0.5">
                Demo Mode
              </Badge>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => { item.onClick(); setOpen(false); }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Logout */}
          <div className="border-t border-border py-1">
            <button
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
