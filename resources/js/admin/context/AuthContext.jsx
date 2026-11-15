import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(() => {
        const saved = localStorage.getItem('admin_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/admin/login', { email, password });
            const data = res.data.data;
            const authToken = data.token;
            const user = data.admin || data.user || { name: 'المشرف', email };

            localStorage.setItem('admin_token', authToken);
            localStorage.setItem('admin_user', JSON.stringify(user));

            setToken(authToken);
            setAdminUser(user);
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.message || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.';
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/admin/logout');
        } catch (e) {
            // Ignore error
        } finally {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            setToken(null);
            setAdminUser(null);
            window.location.href = '/admin/login';
        }
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ adminUser, token, isAuthenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

