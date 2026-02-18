import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import ArticlesList from './pages/Articles/ArticlesList';
import ArticleEditor from './pages/Articles/ArticleEditor';
import MediaLibrary from './pages/Media/MediaLibrary';
import SettingsPage from './pages/Settings/Settings';
import AdvertisementsPage from './pages/Advertisements/Advertisements';

const AuthorsPage = () => <h1 className="text-2xl font-bold">Authors (Coming Soon)</h1>;

const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
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
                            <Route path="articles" element={<ArticlesList />} />
                            <Route path="articles/new" element={<ArticleEditor />} />
                            <Route path="articles/:id" element={<ArticleEditor />} />
                            <Route path="media" element={<MediaLibrary />} />
                            <Route path="authors" element={<AuthorsPage />} />
                            <Route path="advertisements" element={<AdvertisementsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
