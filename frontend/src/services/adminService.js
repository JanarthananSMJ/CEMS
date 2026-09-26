import axios from 'axios';

// Base URL for auth service (since user management is part of auth service), via API gateway
const API_URL = `${import.meta.env.VITE_API_URL}/admin`;

// Create axios instance with default config
const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Admin service functions
const adminService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await adminApi.get('/users');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Create a new user
  createUser: async (userData) => {
    try {
      const response = await adminApi.post('/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const response = await adminApi.put(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user role');
    }
  },

  // Get user details
  getUserDetails: async (userId) => {
    try {
      const response = await adminApi.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user details');
    }
  }
};

export default adminService;