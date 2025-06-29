// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // First get CSRF token
      await authAPI.getCSRFToken();
      
      // Then check if user is authenticated
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Get CSRF token first
      await authAPI.getCSRFToken();
      
      // Attempt login
      const response = await authAPI.login(credentials);
      
      // Get user info after successful login
      const userResponse = await authAPI.getCurrentUser();
      setUser(userResponse.data);
      setIsAuthenticated(true);
      
      return { 
        success: true, 
        user: userResponse.data 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      // Get CSRF token first to ensure we have a fresh one
      await authAPI.getCSRFToken();
      
      // Then attempt logout
      const response = await authAPI.logout();
      
      // Clear user state regardless of response
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if there's an error, we should clear the user state on the frontend
      setUser(null);
      setIsAuthenticated(false);
      
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to logout' 
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};