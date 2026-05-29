import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginTime, setLoginTime] = useState(() => {
    const stored = localStorage.getItem('loginTime');
    return stored ? parseInt(stored) : null;
  });

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user);
          
          // Set loginTime if not already set (for existing sessions)
          if (!loginTime) {
            const now = Date.now();
            localStorage.setItem('loginTime', now.toString());
            setLoginTime(now);
          }
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.register(name, email, password);
      localStorage.setItem('token', response.data.token);
      const now = Date.now();
      localStorage.setItem('loginTime', now);
      setToken(response.data.token);
      setLoginTime(now);
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.data.token);
      const now = Date.now();
      localStorage.setItem('loginTime', now);
      setToken(response.data.token);
      setLoginTime(now);
      setUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginTime');
    setToken(null);
    setLoginTime(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (name) => {
    try {
      const response = await authAPI.updateProfile(name);
      setUser({ ...user, name });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    loginTime,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
