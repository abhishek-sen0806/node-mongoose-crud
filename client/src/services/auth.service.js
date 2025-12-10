import api from './api';
import { TOKEN_KEYS } from '../config/constants';

/**
 * Authentication Service
 * Handles all auth-related API calls
 */

const authService = {
  /**
   * Register new user
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { user, tokens } = response.data.data;
    
    // Store tokens
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
    
    return response.data;
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { user, tokens } = response.data.data;
    
    // Store tokens
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear storage regardless of API response
      localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(TOKEN_KEYS.USER);
    }
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwordData) => {
    const response = await api.patch('/auth/change-password', passwordData);
    return response.data;
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser: () => {
    const user = localStorage.getItem(TOKEN_KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  /**
   * Update stored user
   */
  updateStoredUser: (user) => {
    localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(user));
  },
};

export default authService;

