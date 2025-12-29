import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/common/Navbar';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { LoadingScreen } from './components/common/LoadingScreen';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const RequireAuth = ({ children }: { children: JSX.Element }) => {
    if (!user) {
      return <Navigate to="/auth" replace state={{ from: location }} />;
    }
    return children;
  };

  const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between gap-4 mb-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl tracking-wide text-neon-blue">
            {title}
          </h1>
        </div>
      </header>
      <div className="card-neon p-6 text-sm text-muted">Coming soon.</div>
    </div>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen gym-gradient text-foreground">
        {user && <Navbar />}
        <main
          className={
            isHome
              ? 'max-w-7xl mx-auto px-4 pb-28 pt-4'
              : 'max-w-5xl mx-auto px-4 pb-10 pt-4'
          }
        >
          <Routes>
          <Route
            path="/auth"
            element={
              user ? (
                <Navigate to={(location.state as any)?.from?.pathname ?? '/'} replace />
              ) : (
                <AuthPage />
              )
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route
            path="/programs"
            element={
              <RequireAuth>
                <PlaceholderPage title="Programs" />
              </RequireAuth>
            }
          />
          <Route
            path="/messages"
            element={
              <RequireAuth>
                <PlaceholderPage title="Messages" />
              </RequireAuth>
            }
          />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <NotificationsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile/:uid"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to={user ? '/' : '/auth'} replace />} />
        </Routes>
      </main>
    </div>
    </ErrorBoundary>
  );
}