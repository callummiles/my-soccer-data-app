import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from './authUtils';

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token')
  );

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async function (url, options = {}) {
      // Don't add API_URL for absolute URLs
      if (url.startsWith('http')) {
        return originalFetch(url, options);
      }

      // Don't add API_URL prefix for auth routes
      if (url.startsWith('/auth/')) {
        return originalFetch(url, options);
      }

      // Add API_URL for other relative URLs
      const fullUrl = url.startsWith('/')
        ? `${API_URL}${url}`
        : `${API_URL}/${url}`;

      // Add token for authenticated requests
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      return originalFetch(fullUrl, options);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [token]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
