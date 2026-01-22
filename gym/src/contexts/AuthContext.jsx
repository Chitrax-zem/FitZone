// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authService.getCurrentUser();
        if (response?.data) {
          setUser(response.data);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('token');
        setError(err.response?.data?.message || 'Failed to authenticate');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      const data = response.data || response;
      const token = data.token || data.accessToken;
      const u = data.user || data.userData || data;
      if (token) localStorage.setItem('token', token);
      if (u && u._id) setUser(u);
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      const data = response.data || response;
      const token = data.token || data.accessToken || data.authToken;
      const u = data.user || data.userData || (data._id ? data : null);
      if (!token && !u) throw new Error('Invalid response format from server');
      if (token) localStorage.setItem('token', token);
      if (u && (u._id || u.id)) {
        setUser(u);
        return u;
      } else if (data._id || data.id) {
        setUser(data);
        return data;
      } else {
        throw new Error('No user data received from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
