import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import RoleProtectedRoute from './components/RoleProtectedRoute';

// Eagerly loaded (small/critical)
import Profile from './pages/Profile/Profile';
import ArticlesList from './pages/Articles/ArticlesList';

// Lazy loaded (heavy pages)
const ArticleEditor = lazy(() => import('./pages/Articles/ArticleEditor'));
const MediaLibrary = lazy(() => import('./pages/Media/MediaLibrary'));
const UsersPage = lazy(() => import('./pages/Users/Users'));
const SettingsPage = lazy(() => import('./pages/Settings/Settings'));
const AdvertisementsPage = lazy(() => import('./pages/Advertisements/Advertisements'));
const PagesList = lazy(() => import('./pages/Pages/PagesList'));
const PageEditor = lazy(() => import('./pages/Pages/PageEditor'));
const TagsList = lazy(() => import('./pages/Tags/TagsList'));
const Reports = lazy(() => import('./pages/Reports/Reports'));

// Newsletter (lazy loaded as a group)
const NewsletterDashboard = lazy(() => import('./pages/Newsletter').then(m => ({ default: m.NewsletterDashboard })));
const Subscribers = lazy(() => import('./pages/Newsletter').then(m => ({ default: m.Subscribers })));
const Campaigns = lazy(() => import('./pages/Newsletter').then(m => ({ default: m.Campaigns })));
const CampaignEditor = lazy(() => import('./pages/Newsletter').then(m => ({ default: m.CampaignEditor })));
const NewsletterSettings = lazy(() => import('./pages/Newsletter').then(m => ({ default: m.NewsletterSettings })));

const LazyFallback = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
  </div>
);

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading)
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />

                {/* Available to all authenticated */}
                <Route path="profile" element={<Profile />} />
                <Route path="articles" element={<ArticlesList />} />
                <Route path="articles/new" element={<ArticleEditor />} />
                <Route path="articles/:id" element={<ArticleEditor />} />
                <Route path="media" element={<MediaLibrary />} />

                {/* Admins and Editors */}
                <Route element={<RoleProtectedRoute allowedRoles={['admin', 'editor']} />}>
                  <Route path="pages" element={<PagesList />} />
                  <Route path="pages/new" element={<PageEditor />} />
                  <Route path="pages/:id" element={<PageEditor />} />
                  <Route path="tags" element={<TagsList />} />
                  <Route path="advertisements" element={<AdvertisementsPage />} />
                  <Route path="reports" element={<Reports />} />

                  {/* Newsletter */}
                  <Route path="newsletter" element={<NewsletterDashboard />} />
                  <Route path="newsletter/subscribers" element={<Subscribers />} />
                  <Route path="newsletter/campaigns" element={<Campaigns />} />
                  <Route path="newsletter/campaigns/new" element={<CampaignEditor />} />
                  <Route path="newsletter/campaigns/:id" element={<CampaignEditor />} />
                  <Route path="newsletter/settings" element={<NewsletterSettings />} />
                </Route>

                {/* Admins Only */}
                <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="users" element={<UsersPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
