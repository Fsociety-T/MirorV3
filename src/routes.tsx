// Routes Configuration
import { createElement, Suspense, lazy } from 'react';
import { Routes as Router, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';

// Lazy load pages for code splitting
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const DailyPage = lazy(() => import('./pages/DailyPage').then(m => ({ default: m.DailyPage })));
const TreePage = lazy(() => import('./pages/TreePage').then(m => ({ default: m.TreePage })));
const VisionPage = lazy(() => import('./pages/VisionPage').then(m => ({ default: m.VisionPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Loading fallback
function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="h-10 w-10 animate-spin rounded-full border-3 border-[var(--color-border-light)] border-t-[var(--color-pillar-prayer)]" />
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

// Public route (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/daily" replace />;
  return <>{children}</>;
}

export function Routes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Router>
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/tree" element={<TreePage />} />
          <Route path="/vision" element={<VisionPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<Navigate to="/daily" replace />} />
          <Route path="*" element={<Navigate to="/daily" replace />} />
        </Route>
      </Router>
    </Suspense>
  );
}