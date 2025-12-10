import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.service';
import { ROUTES } from '../config/constants';

/**
 * Authentication Context
 * Provides auth state and methods throughout the app
 */

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
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const hasToken = authService.isAuthenticated();

        if (storedUser && hasToken) {
          // Verify token is still valid by fetching current user
          try {
            const response = await authService.getCurrentUser();
            setUser(response.data.user);
            setIsAuthenticated(true);
          } catch (error) {
            // Token is invalid, clear storage
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await authService.register(userData);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = ROUTES.LOGIN;
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    authService.updateStoredUser(updatedUser);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.data.user);
      authService.updateStoredUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator',
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

