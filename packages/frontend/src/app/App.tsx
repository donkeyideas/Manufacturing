import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AppRoutes } from './routes';
import { ProtectedRoute } from '../components/ProtectedRoute';

const HomePage = lazy(() => import('../pages/homepage/HomePage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const BlogListPage = lazy(() => import('../modules/blog/BlogListPage'));
const BlogPostPage = lazy(() => import('../modules/blog/BlogPostPage'));
const PortalLayout = lazy(() => import('../layouts/PortalLayout'));

const PageFallback = () => <div className="min-h-screen bg-surface-0" />;

export default function App() {
  return (
    <Routes>
      {/* Public homepage */}
      <Route
        path="/"
        element={
          <Suspense fallback={<PageFallback />}>
            <HomePage />
          </Suspense>
        }
      />

      {/* Auth pages (public) */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<PageFallback />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path="/register"
        element={
          <Suspense fallback={<PageFallback />}>
            <RegisterPage />
          </Suspense>
        }
      />

      {/* Redirect old landing page */}
      <Route path="/welcome" element={<Navigate to="/" replace />} />

      {/* Public blog */}
      <Route
        path="/blog"
        element={
          <Suspense fallback={<PageFallback />}>
            <BlogListPage />
          </Suspense>
        }
      />
      <Route
        path="/blog/:slug"
        element={
          <Suspense fallback={<PageFallback />}>
            <BlogPostPage />
          </Suspense>
        }
      />

      {/* Employee portal */}
      <Route
        path="/portal/*"
        element={
          <Suspense fallback={<PageFallback />}>
            <PortalLayout />
          </Suspense>
        }
      />

      {/* Main app routes — protected in live mode */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AppRoutes />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
