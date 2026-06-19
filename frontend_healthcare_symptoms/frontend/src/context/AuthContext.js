import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, doctorAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');

            if (!token) {
                setUser(null);
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                const response = await authAPI.getProfile();
                setUser(response.data);
                setIsAuthenticated(true);
            } catch (err) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const register = async (data) => {
        try {
            setError(null);
            const response = await authAPI.register(data);
            const { access, refresh, user: userData } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            setUser(userData);
            setIsAuthenticated(true);

            return response.data;
        } catch (err) {
            const errorMessage =
                err.response?.data?.detail ||
                Object.values(err.response?.data || {}).flat().join(', ') ||
                'Registration failed';
            setError(errorMessage);
            throw err;
        }
    };

    const login = async (username, password) => {
        try {
            setError(null);
            const response = await authAPI.login({ username, password });

            const { access, refresh, user: userData } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            setUser(userData);
            setIsAuthenticated(true);

            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Login failed';
            setError(errorMessage);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            setIsAuthenticated(false);
            setError(null);
        }
    };

    const updateProfile = async (data) => {
        try {
            setError(null);
            const response = await authAPI.updateProfile(data);
            setUser(response.data.user);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Update failed';
            setError(errorMessage);
            throw err;
        }
    };

    const changePassword = async (data) => {
        try {
            setError(null);
            const response = await authAPI.changePassword(data);
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Change password failed';
            setError(errorMessage);
            throw err;
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        setError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;