import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

import RoleProtectedRoute from './components/RoleProtectedRoute';
import UsersPage from './pages/Users/Users';
import Profile from './pages/Profile/Profile';

// Pages
import ArticlesList from './pages/Articles/ArticlesList';
import ArticleEditor from './pages/Articles/ArticleEditor';
import MediaLibrary from './pages/Media/MediaLibrary';
import SettingsPage from './pages/Settings/Settings';
import AdvertisementsPage from './pages/Advertisements/Advertisements';
import PagesList from './pages/Pages/PagesList';
import PageEditor from './pages/Pages/PageEditor';
import TagsList from './pages/Tags/TagsList';
import Reports from './pages/Reports/Reports';

// Newsletter
import {
  NewsletterDashboard,
  Subscribers,
  Campaigns,
  CampaignEditor,
  NewsletterSettings
} from './pages/Newsletter';

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
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
