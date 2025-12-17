// client/src/contexts/AuthContext.js
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

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      
      // Handle different possible response structures
      const data = response.data || response;
      const token = data.token || data.accessToken;
      const user = data.user || data.userData || data;
      
      if (token) {
        localStorage.setItem('token', token);
      }
      
      if (user && user._id) {
        setUser(user);
      }
      
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      console.log('Sending login request with:', credentials);
      
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      // Handle different possible response structures
      const data = response.data || response;
      
      // Try different possible token field names
      const token = data.token || data.accessToken || data.authToken;
      
      // Try different possible user field names
      const user = data.user || data.userData || (data._id ? data : null);
      
      if (!token && !user) {
        throw new Error('Invalid response format from server');
      }
      
      // Store token if available
      if (token) {
        localStorage.setItem('token', token);
      }
      
      // Set user data
      if (user && (user._id || user.id)) {
        setUser(user);
        return user;
      } else if (data._id || data.id) {
        // If the response itself contains user data
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

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
