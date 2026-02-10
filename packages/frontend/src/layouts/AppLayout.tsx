import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, DollarSign, ShoppingCart, Truck, Package,
  Factory, Users, Building2, FolderKanban, Bot, BarChart3,
  Settings, ChevronDown, ChevronRight, Search, Calendar, Ticket,
  FileCheck, Menu, X, Sun, Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandPalette, type CommandItem, cn, Badge } from '@erp/ui';
import { MODULES, type ModuleDefinition } from '@erp/shared';
import { useAppMode } from '../data-layer/providers/AppModeProvider';
import { useTheme } from '../app/ThemeProvider';
import { NotificationPanel } from '../components/NotificationPanel';
import { UserMenu } from '../components/UserMenu';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  DollarSign: <DollarSign className="h-4 w-4" />,
  ShoppingCart: <ShoppingCart className="h-4 w-4" />,
  Truck: <Truck className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  Factory: <Factory className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Building2: <Building2 className="h-4 w-4" />,
  FolderKanban: <FolderKanban className="h-4 w-4" />,
  Bot: <Bot className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Search: <Search className="h-4 w-4" />,
  Calendar: <Calendar className="h-4 w-4" />,
  Ticket: <Ticket className="h-4 w-4" />,
  FileCheck: <FileCheck className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
};

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['dashboard']));
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDemo } = useAppMode();
  const { theme, toggleTheme } = useTheme();

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Build command palette items from modules
  const commandItems: CommandItem[] = MODULES.flatMap((module) => {
    const items: CommandItem[] = [];

    if (module.children.length === 0) {
      items.push({
        id: module.id,
        label: module.label,
        group: 'Pages',
        icon: ICON_MAP[module.icon],
        onSelect: () => navigate(module.basePath),
      });
    }

    module.children.forEach((child) => {
      items.push({
        id: `${module.id}-${child.path}`,
        label: child.label,
        group: module.label,
        icon: ICON_MAP[module.icon],
        onSelect: () => navigate(child.path),
      });
    });

    return items;
  });

  // Breadcrumbs from current path
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">
      {/* Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border bg-surface-1 transition-all duration-200',
          sidebarCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="flex h-12 items-center border-b border-border px-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white text-xs font-bold">
              E
            </div>
            {!sidebarCollapsed && (
              <span className="text-sm font-semibold text-text-primary">ERP Platform</span>
            )}
          </div>
        </div>

        {/* Demo badge */}
        {isDemo && !sidebarCollapsed && (
          <div className="mx-3 mt-2">
            <Badge variant="warning" className="w-full justify-center py-1">
              Demo Mode
            </Badge>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {MODULES.map((module) => (
            <SidebarModule
              key={module.id}
              module={module}
              collapsed={sidebarCollapsed}
              expanded={expandedModules.has(module.id)}
              onToggle={() => toggleModule(module.id)}
              isActive={isPathActive}
              navigate={navigate}
            />
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex h-10 items-center justify-center border-t border-border text-text-muted hover:text-text-primary transition-colors"
        >
          <ChevronRight
            className={cn('h-4 w-4 transition-transform', !sidebarCollapsed && 'rotate-180')}
          />
        </button>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-12 items-center justify-between border-b border-border bg-surface-1 px-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="md:hidden text-text-muted hover:text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-text-muted">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span>/</span>}
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-text-primary transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-text-primary font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Command palette trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-surface-0 px-3 py-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <Search className="h-3 w-3" />
              <span>Search...</span>
              <kbd className="rounded bg-surface-2 px-1 py-0.5 text-2xs font-mono">
                Ctrl+K
              </kbd>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notification Panel */}
            <NotificationPanel />

            {/* User Menu */}
            <UserMenu />
          </div>
        </header>

        {/* Page content with transition */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        items={commandItems}
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-60 border-r border-border bg-surface-1 md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="flex h-12 items-center border-b border-border px-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white text-xs font-bold">
                    E
                  </div>
                  <span className="text-sm font-semibold text-text-primary">ERP Platform</span>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto py-2 px-2">
                {MODULES.map((module) => (
                  <SidebarModule
                    key={module.id}
                    module={module}
                    collapsed={false}
                    expanded={expandedModules.has(module.id)}
                    onToggle={() => toggleModule(module.id)}
                    isActive={isPathActive}
                    navigate={(path) => {
                      navigate(path);
                      setMobileMenuOpen(false);
                    }}
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar Module Component ───

interface SidebarModuleProps {
  module: ModuleDefinition;
  collapsed: boolean;
  expanded: boolean;
  onToggle: () => void;
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
}

function SidebarModule({ module, collapsed, expanded, onToggle, isActive, navigate }: SidebarModuleProps) {
  const hasChildren = module.children.length > 0;
  const moduleActive = isActive(module.basePath);
  const icon = ICON_MAP[module.icon] || <LayoutDashboard className="h-4 w-4" />;

  if (!hasChildren) {
    return (
      <button
        onClick={() => navigate(module.basePath)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors mb-0.5',
          moduleActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
            : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
        )}
        title={collapsed ? module.label : undefined}
      >
        {icon}
        {!collapsed && <span>{module.label}</span>}
      </button>
    );
  }

  return (
    <div className="mb-0.5">
      <button
        onClick={collapsed ? () => navigate(module.children[0]?.path || module.basePath) : onToggle}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
          moduleActive
            ? 'text-brand-700 dark:text-brand-300'
            : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
        )}
        title={collapsed ? module.label : undefined}
      >
        {icon}
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{module.label}</span>
            <ChevronDown
              className={cn('h-3 w-3 transition-transform', !expanded && '-rotate-90')}
            />
          </>
        )}
      </button>

      {!collapsed && (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="ml-4 border-l border-border pl-2 py-0.5">
                {module.children.map((child) => (
                  <button
                    key={child.path}
                    onClick={() => navigate(child.path)}
                    className={cn(
                      'flex w-full items-center rounded-md px-2 py-1 text-xs transition-colors',
                      isActive(child.path)
                        ? 'bg-brand-50 text-brand-700 font-medium dark:bg-brand-950 dark:text-brand-300'
                        : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                    )}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// ─── Breadcrumb helpers ───

function getBreadcrumbs(pathname: string): { label: string; path?: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [{ label: 'Dashboard' }];

  const crumbs: { label: string; path?: string }[] = [];

  // Find matching module
  for (const module of MODULES) {
    const basePath = module.basePath.replace(/^\//, '');
    if (segments[0] === basePath || pathname.startsWith(module.basePath)) {
      crumbs.push({ label: module.label, path: module.basePath });

      // Find matching child
      for (const child of module.children) {
        if (pathname === child.path || pathname.startsWith(child.path + '/')) {
          crumbs.push({ label: child.label });
          return crumbs;
        }
      }

      return crumbs;
    }
  }

  // Fallback: capitalize path segment
  crumbs.push({ label: segments[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) });
  return crumbs;
}
