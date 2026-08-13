import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { PageLoader } from './components/ui/Loading';
import { ADMIN_PATH } from './config';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Blocked = lazy(() => import('./pages/Blocked'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AdminOverview = lazy(() => import('./pages/admin/Overview'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminConnections = lazy(() => import('./pages/admin/Connections'));
const IpManagement = lazy(() => import('./pages/admin/IpManagement'));
const SecurityEvents = lazy(() => import('./pages/admin/SecurityEvents'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));

function RequireAuth({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="VERIFYING SESSION" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role === 'admin' && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoader label="LOADING MODULE" />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/blocked" element={<Blocked />} />

          <Route
            path={ADMIN_PATH}
            element={
              <RequireAuth role="admin">
                <AppLayout>
                  <Routes>
                    <Route index element={<AdminOverview />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="connections" element={<AdminConnections />} />
                    <Route path="ips" element={<IpManagement />} />
                    <Route path="events" element={<SecurityEvents />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="*" element={<Navigate to={ADMIN_PATH} replace />} />
                  </Routes>
                </AppLayout>
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function SessionBootstrap() {
  const { loadMe } = useAuth();
  useEffect(() => {
    loadMe();
  }, [loadMe]);
  return <AnimatedRoutes />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SessionBootstrap />
      </ToastProvider>
    </AuthProvider>
  );
}
