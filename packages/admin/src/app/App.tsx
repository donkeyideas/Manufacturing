import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminDashboard } from '../pages/AdminDashboard';

export default function App() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="" element={<AdminDashboard />} />
              <Route path="users" element={<ComingSoon title="User Management" />} />
              <Route path="demo-codes" element={<ComingSoon title="Demo Code Management" />} />
              <Route path="subscriptions" element={<ComingSoon title="Subscriptions" />} />
              <Route path="pricing" element={<ComingSoon title="Pricing" />} />
              <Route path="security" element={<ComingSoon title="Security" />} />
              <Route path="settings" element={<ComingSoon title="System Settings" />} />
              <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
          </AdminLayout>
        }
      />
    </Routes>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-1 text-sm text-text-muted">This page is coming soon.</p>
      </div>
    </div>
  );
}
