import api from './api';

/**
 * User Service
 * Handles all user-related API calls
 */

const userService = {
  /**
   * Get all users with pagination
   */
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   */
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   */
  create: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  /**
   * Update user
   */
  update: async (id, userData) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  /**
   * Delete user (soft delete)
   */
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Permanently delete user
   */
  permanentDelete: async (id) => {
    const response = await api.delete(`/users/${id}/permanent`);
    return response.data;
  },

  /**
   * Restore user
   */
  restore: async (id) => {
    const response = await api.patch(`/users/${id}/restore`);
    return response.data;
  },

  /**
   * Update avatar
   */
  updateAvatar: async (id, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.patch(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Search users
   */
  search: async (query, params = {}) => {
    const response = await api.get('/users/search', {
      params: { q: query, ...params },
    });
    return response.data;
  },
};

export default userService;

