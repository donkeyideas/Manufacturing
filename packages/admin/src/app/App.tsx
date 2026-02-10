import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminDashboard } from '../pages/AdminDashboard';
import { DemoCodeManagement } from '../pages/DemoCodeManagement';
import { UserManagement } from '../pages/UserManagement';
import { Subscriptions } from '../pages/Subscriptions';
import { Pricing } from '../pages/Pricing';
import { AdminSecurity } from '../pages/Security';
import { SystemSettings } from '../pages/SystemSettings';
import { SEODashboard } from '../pages/SEODashboard';
import { Inbox } from '../pages/Inbox';
import { BlogManagement } from '../pages/blog/BlogManagement';
import { BlogEditor } from '../pages/blog/BlogEditor';

export default function App() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="demo-codes" element={<DemoCodeManagement />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="settings" element={<SystemSettings />} />
              <Route path="seo" element={<SEODashboard />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="blog" element={<BlogManagement />} />
              <Route path="blog/new" element={<BlogEditor />} />
              <Route path="blog/:id/edit" element={<BlogEditor />} />
              <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
          </AdminLayout>
        }
      />
    </Routes>
  );
}
