import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiPost } from '../utils/api';

/**
 * Auth Context
 * Handles authentication state and API communication with backend
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing saved user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

// --- CHỈ GIỮ LẠI CÁC HÀM NÀY, XÓA CÁC BẢN TRÙNG LẶP CŨ ---

  /**
   * Register new user - Bản chuẩn đã fix token
   */
  const register = async (name, email, password, phone = '', address = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost('/auth/register', { name, email, password, phone, address });
      let userData = null;
      let newToken = null;

      if (response.status === 'success' && response.data) {
        userData = response.data.user;
        newToken = response.data.token;
      } else if (response.user && response.token) {
        userData = response.user;
        newToken = response.token;
      }

      if (newToken) {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, message: 'Registration successful!', user: userData };
      }
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally { setLoading(false); }
  };

  /**
   * Login user - Bản chuẩn đã fix token
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost('/auth/login', { email, password });
      let userData = null;
      let newToken = null;

      if (response.status === 'success' && response.data) {
        userData = response.data.user;
        newToken = response.data.token;
      } else if (response.user && response.token) {
        userData = response.user;
        newToken = response.token;
      }

      if (newToken) {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, message: 'Login successful!', user: userData };
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally { setLoading(false); }
  };



  /**
   * Get current user profile
   */
  const getProfile = async () => {
    if (!token) {
      return null;
    }

    try {
      const response = await apiPost('/auth/profile', {});

      if (response.status === 'success') {
        const userData = response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }

      return null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = !!token && !!user;

  /**
   * Check if user is admin
   */
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    getProfile,
    isAuthenticated,
    isAdmin,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use Auth Context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

export default AuthContext;
