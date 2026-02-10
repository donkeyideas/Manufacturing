import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Skeleton } from '@erp/ui';

// Lazy-loaded module pages
const Dashboard = lazy(() => import('../modules/dashboard/DashboardPage'));

// Page loading fallback
function PageLoader() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

// Placeholder for modules not yet built
function ComingSoon({ module }: { module: string }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-text-primary">{module}</h2>
        <p className="mt-1 text-sm text-text-muted">This module is coming soon.</p>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />

        {/* Financial */}
        <Route path="financial/*" element={<ComingSoon module="Financial" />} />

        {/* Sales */}
        <Route path="sales/*" element={<ComingSoon module="Sales" />} />

        {/* Procurement */}
        <Route path="procurement/*" element={<ComingSoon module="Procurement" />} />

        {/* Inventory */}
        <Route path="inventory/*" element={<ComingSoon module="Inventory" />} />

        {/* Manufacturing */}
        <Route path="manufacturing/*" element={<ComingSoon module="Manufacturing" />} />

        {/* HR & Payroll */}
        <Route path="hr/*" element={<ComingSoon module="HR & Payroll" />} />

        {/* Assets */}
        <Route path="assets/*" element={<ComingSoon module="Assets" />} />

        {/* Projects */}
        <Route path="projects/*" element={<ComingSoon module="Projects" />} />

        {/* AI */}
        <Route path="ai/*" element={<ComingSoon module="AI Assistant" />} />

        {/* Reports */}
        <Route path="reports/*" element={<ComingSoon module="Reports" />} />

        {/* Settings */}
        <Route path="settings/*" element={<ComingSoon module="Settings" />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
