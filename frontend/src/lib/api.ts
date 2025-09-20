import axios from 'axios';

// Create axios instance with base configuration for API communication
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically add JWT token to all requests
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage and add to Authorization header
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await API.post('/api/auth/login', { email, password });
    return response.data;
  },

  signup: async (name: string, email: string, password: string, confirmPassword: string, role: string = 'operator') => {
    const response = await API.post('/api/auth/signup', { 
      name, 
      email, 
      password, 
      confirmPassword, 
      role 
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await API.get('/api/auth/profile');
    return response.data;
  },

  updateProfile: async (profileData: { name?: string; department?: string; employeeId?: string }) => {
    const response = await API.put('/api/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    const response = await API.put('/api/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await API.post('/api/auth/forgot', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string, confirmPassword: string) => {
    const response = await API.post(`/api/auth/reset/${token}`, { password, confirmPassword });
    return response.data;
  }
};

// User management API (Admin only)
export const userAPI = {
  getAllUsers: async () => {
    const response = await API.get('/api/auth/users');
    return response.data;
  },

  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    employeeId?: string;
  }) => {
    const response = await API.post('/api/auth/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: {
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
  }) => {
    const response = await API.put(`/api/auth/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await API.delete(`/api/auth/users/${id}`);
    return response.data;
  },

  getSystemStats: async () => {
    const response = await API.get('/api/auth/admin/stats');
    return response.data;
  }
};

export default API;