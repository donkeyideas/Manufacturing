import { lazy, Suspense, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Clock, DollarSign, Calendar, Star,
  CalendarDays, GraduationCap, FileCheck, Megaphone,
  UserCircle, Sun, Moon, Bell, Menu, X,
} from 'lucide-react';
import { cn } from '@erp/ui';
import { useTheme } from '../app/ThemeProvider';

const PortalDashboard = lazy(() => import('../modules/portal/PortalDashboard'));
const TimeClockPage = lazy(() => import('../modules/portal/TimeClockPage'));
const MyPayPage = lazy(() => import('../modules/portal/MyPayPage'));
const LeavePage = lazy(() => import('../modules/portal/LeavePage'));
const ReviewsPage = lazy(() => import('../modules/portal/ReviewsPage'));
const SchedulePage = lazy(() => import('../modules/portal/SchedulePage'));
const TrainingPage = lazy(() => import('../modules/portal/TrainingPage'));
const SOPsPage = lazy(() => import('../modules/portal/SOPsPage'));
const AnnouncementsPage = lazy(() => import('../modules/portal/AnnouncementsPage'));
const MyInfoPage = lazy(() => import('../modules/portal/MyInfoPage'));

const NAV_ITEMS = [
  { label: 'Dashboard', path: '', icon: LayoutDashboard },
  { label: 'Time Clock', path: 'time-clock', icon: Clock },
  { label: 'My Pay', path: 'pay', icon: DollarSign },
  { label: 'Leave', path: 'leave', icon: Calendar },
  { label: 'Reviews', path: 'reviews', icon: Star },
  { label: 'Schedule', path: 'schedule', icon: CalendarDays },
  { label: 'Training', path: 'training', icon: GraduationCap },
  { label: 'SOPs', path: 'sops', icon: FileCheck },
  { label: 'Announcements', path: 'announcements', icon: Megaphone },
  { label: 'My Info', path: 'my-info', icon: UserCircle },
];

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  );
}

export default function PortalLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clockedIn] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const basePath = '/portal';
  const isActive = (path: string) => {
    const fullPath = path ? `${basePath}/${path}` : basePath;
    if (path === '') return location.pathname === basePath || location.pathname === basePath + '/';
    return location.pathname.startsWith(fullPath);
  };

  const handleNav = (path: string) => {
    navigate(path ? `${basePath}/${path}` : basePath);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">
      {/* Sidebar */}
      <aside className="hidden md:flex w-52 flex-col border-r border-border bg-surface-1">
        {/* Logo */}
        <div className="flex h-12 items-center border-b border-border px-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
              EP
            </div>
            <span className="text-sm font-semibold text-text-primary">Employee Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors mb-0.5',
                  active
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
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

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-12 items-center justify-between border-b border-border bg-surface-1 px-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-text-muted hover:text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">James Mitchell</span>
              <div className="flex items-center gap-1">
                <div className={cn(
                  'h-2 w-2 rounded-full',
                  clockedIn ? 'bg-emerald-500' : 'bg-gray-400'
                )} />
                <span className="text-xs text-text-muted">
                  {clockedIn ? 'Clocked In' : 'Off Clock'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="" element={<PortalDashboard />} />
              <Route path="time-clock" element={<TimeClockPage />} />
              <Route path="pay" element={<MyPayPage />} />
              <Route path="leave" element={<LeavePage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="training" element={<TrainingPage />} />
              <Route path="sops" element={<SOPsPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="my-info" element={<MyInfoPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-52 border-r border-border bg-surface-1 md:hidden">
            <div className="flex h-12 items-center border-b border-border px-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  EP
                </div>
                <span className="text-sm font-semibold text-text-primary">Employee Portal</span>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 px-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors mb-0.5',
                      active
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
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
        </>
      )}
    </div>
  );
}
