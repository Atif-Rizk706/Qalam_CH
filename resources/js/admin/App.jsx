import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BooksList from './pages/Books/BooksList';
import AuthorsList from './pages/Authors/AuthorsList';
import CategoriesList from './pages/Categories/CategoriesList';
import ArticlesList from './pages/Articles/ArticlesList';
import ArticleTypesList from './pages/ArticleTypes/ArticleTypesList';
import AdvertisementsList from './pages/Advertisements/AdvertisementsList';
import VisitorsAnalytics from './pages/Analytics/VisitorsAnalytics';
import SettingsPage from './pages/Settings/SettingsPage';
import UsersList from './pages/Users/UsersList';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
};

const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }
    return children;
};

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Login Route */}
                        <Route
                            path="/admin/login"
                            element={
                                <PublicOnlyRoute>
                                    <Login />
                                </PublicOnlyRoute>
                            }
                        />

                        {/* Protected Admin Routes */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Dashboard />} />
                            <Route path="books" element={<BooksList />} />
                            <Route path="authors" element={<AuthorsList />} />
                            <Route path="categories" element={<CategoriesList />} />
                            <Route path="articles" element={<ArticlesList />} />
                            <Route path="article-types" element={<ArticleTypesList />} />
                            <Route path="advertisements" element={<AdvertisementsList />} />
                            <Route path="analytics" element={<VisitorsAnalytics />} />
                            <Route path="settings" element={<SettingsPage />} />
                            <Route path="users" element={<UsersList />} />
                        </Route>

                        {/* Catch all fallback */}
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ErrorBoundary>
    );
}

