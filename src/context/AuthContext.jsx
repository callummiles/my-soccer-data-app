import { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const login = async (username, password) => {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
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
      // Don't intercept auth requests to prevent infinite loop
      if (url.startsWith('/auth/')) {
        return originalFetch(url, options);
      }

      // Only add token for API requests
      if (token && url.startsWith('/api/')) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
