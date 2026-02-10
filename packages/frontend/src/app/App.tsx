import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <Routes>
      {/* Main app routes wrapped in layout */}
      <Route
        path="/*"
        element={
          <AppLayout>
            <AppRoutes />
          </AppLayout>
        }
      />
    </Routes>
  );
}
