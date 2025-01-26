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
      console.log('Current window.location.origin:', window.location.origin);
      const loginUrl = API_URL + '/auth/login';
      console.log('Attempting login with URL:', loginUrl);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));

      if (!response.ok) {
        const text = await response.text();
        console.log('Error response text:', text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Login failed');
        } catch (e) {
          throw new Error(`Login failed: ${text}`);
        }
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
      // Use original fetch for absolute URLs
      if (url.startsWith('http')) {
        return originalFetch(url, options);
      }

      // For relative URLs, use as is since vercel.json handles the proxying
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      return originalFetch(url, options);
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
