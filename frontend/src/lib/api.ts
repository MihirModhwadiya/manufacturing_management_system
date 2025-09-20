// Axios library import for making HTTP requests to backend API
import axios from 'axios';

// Create configured axios instance: centralizes API communication settings
const API = axios.create({
  // Base URL: uses environment variable or localhost fallback for API server
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  headers: {
    // Default Content-Type: tells server to expect JSON data in requests
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically modifies outgoing requests before sending
API.interceptors.request.use(
  (config) => {
    // JWT Token injection: adds authentication token to every API request
    const token = localStorage.getItem('token');
    if (token) {
      // Bearer token format: standard authorization header format
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Return modified request configuration
  },
  (error) => {
    // Request error handler: catches errors before request is sent
    return Promise.reject(error);
  }
);

// Response interceptor: handles responses and errors globally
API.interceptors.response.use(
  (response) => response, // Success case: pass response through unchanged
  (error) => {
    // Global error handler: manages authentication failures across entire app
    if (error.response?.status === 401) {
      // 401 Unauthorized: token expired or invalid, clear stored auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error); // Re-throw error for component handling
  }
);

// Authentication API object: groups all auth-related API calls
export const authAPI = {
  // Login function: authenticates user with email and password
  login: async (email: string, password: string) => {
    const response = await API.post('/api/auth/login', { email, password });
    return response.data; // Return API response data (user and token)
  },

  // Signup function: creates new user account with validation
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

  updateProfile: async (profileData: { 
    name?: string; 
    department?: string; 
    employeeId?: string; 
    notifications?: {
      email: boolean;
      workOrders: boolean;
      stockAlerts: boolean;
      systemUpdates: boolean;
    };
  }) => {
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

// Manufacturing Orders API calls
export const manufacturingOrderAPI = {
  // Get all manufacturing orders
  getAll: async () => {
    const response = await API.get('/api/manufacturing-orders');
    return response.data;
  },

  // Create new manufacturing order
  create: async (orderData: {
    product: string;
    quantity: number;
    priority?: string;
    dueDate: string;
    notes?: string;
  }) => {
    const response = await API.post('/api/manufacturing-orders', orderData);
    return response.data;
  },

  // Update manufacturing order
  update: async (id: string, orderData: {
    quantity?: number;
    priority?: string;
    dueDate?: string;
    notes?: string;
    status?: string;
  }) => {
    const response = await API.put(`/api/manufacturing-orders/${id}`, orderData);
    return response.data;
  },

  // Delete manufacturing order
  delete: async (id: string) => {
    const response = await API.delete(`/api/manufacturing-orders/${id}`);
    return response.data;
  },

  // Get single manufacturing order
  getById: async (id: string) => {
    const response = await API.get(`/api/manufacturing-orders/${id}`);
    return response.data;
  }
};

// Work Orders API calls  
export const workOrderAPI = {
  // Get all work orders
  getAll: async () => {
    const response = await API.get('/api/work-orders');
    return response.data;
  },

  // Create new work order
  create: async (workOrderData: {
    manufacturingOrder: string;
    machine: string;
    assignedTo?: string;
    startDate: string;
    estimatedHours?: number;
    instructions?: string;
  }) => {
    const response = await API.post('/api/work-orders', workOrderData);
    return response.data;
  },

  // Update work order
  update: async (id: string, workOrderData: {
    assignedTo?: string;
    startDate?: string;
    estimatedHours?: number;
    instructions?: string;
    status?: string;
    actualHours?: number;
  }) => {
    const response = await API.put(`/api/work-orders/${id}`, workOrderData);
    return response.data;
  },

  // Delete work order
  delete: async (id: string) => {
    const response = await API.delete(`/api/work-orders/${id}`);
    return response.data;
  },

  // Get single work order
  getById: async (id: string) => {
    const response = await API.get(`/api/work-orders/${id}`);
    return response.data;
  }
};

// Bill of Materials API calls
export const bomAPI = {
  // Get all BOMs
  getAll: async () => {
    const response = await API.get('/api/bom');
    return response.data;
  },

  // Create new BOM
  create: async (bomData: {
    product: string;
    materials: Array<{ material: string; quantity: number; }>;
    version?: string;
    notes?: string;
  }) => {
    const response = await API.post('/api/bom', bomData);
    return response.data;
  },

  // Update BOM
  update: async (id: string, bomData: {
    materials?: Array<{ material: string; quantity: number; }>;
    version?: string;
    notes?: string;
    isActive?: boolean;
  }) => {
    const response = await API.put(`/api/bom/${id}`, bomData);
    return response.data;
  },

  // Delete BOM
  delete: async (id: string) => {
    const response = await API.delete(`/api/bom/${id}`);
    return response.data;
  },

  // Get single BOM
  getById: async (id: string) => {
    const response = await API.get(`/api/bom/${id}`);
    return response.data;
  },

  // Get BOMs for specific product
  getByProduct: async (productId: string) => {
    const response = await API.get(`/api/bom/product/${productId}`);
    return response.data;
  }
};

// Stock Ledger API calls
export const stockLedgerAPI = {
  // Get all stock movements
  getAll: async (params?: {
    material?: string;
    movementType?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await API.get('/api/stock-ledger', { params });
    return response.data;
  },

  // Record new stock movement
  recordMovement: async (movementData: {
    material: string;
    movementType: 'in' | 'out' | 'adjustment' | 'transfer';
    quantity: number;
    reason: string;
    reference?: string;
    notes?: string;
  }) => {
    const response = await API.post('/api/stock-ledger', movementData);
    return response.data;
  },

  // Get movements for specific material
  getByMaterial: async (materialId: string, params?: { page?: number; limit?: number; }) => {
    const response = await API.get(`/api/stock-ledger/material/${materialId}`, { params });
    return response.data;
  },

  // Get stock movement summary
  getSummary: async () => {
    const response = await API.get('/api/stock-ledger/summary');
    return response.data;
  },

  // Delete stock movement (admin only)
  delete: async (id: string) => {
    const response = await API.delete(`/api/stock-ledger/${id}`);
    return response.data;
  }
};

// Material API calls
export const materialAPI = {
  // Get all materials
  getAll: async (params?: {
    category?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await API.get('/api/materials', { params });
    return response.data;
  },

  // Create new material
  create: async (materialData: {
    code: string;
    name: string;
    category: 'raw-material' | 'component';
    unit: 'pcs' | 'kg' | 'liters';
    stockQuantity?: number;
    unitCost: number;
  }) => {
    const response = await API.post('/api/materials', materialData);
    return response.data;
  },

  // Get single material
  getById: async (id: string) => {
    const response = await API.get(`/api/materials/${id}`);
    return response.data;
  },

  // Update material
  update: async (id: string, materialData: {
    code?: string;
    name?: string;
    category?: 'raw-material' | 'component';
    unit?: 'pcs' | 'kg' | 'liters';
    stockQuantity?: number;
    unitCost?: number;
  }) => {
    const response = await API.put(`/api/materials/${id}`, materialData);
    return response.data;
  },

  // Delete material (admin only)
  delete: async (id: string) => {
    const response = await API.delete(`/api/materials/${id}`);
    return response.data;
  }
};

// Export API calls
export const exportAPI = {
  // Export users to CSV
  exportUsers: async () => {
    const response = await API.get('/api/export/users', {
      responseType: 'blob' // Important for file downloads
    });
    return response.data;
  },

  // Export manufacturing orders to CSV
  exportManufacturingOrders: async () => {
    const response = await API.get('/api/export/manufacturing-orders', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export work orders to CSV
  exportWorkOrders: async () => {
    const response = await API.get('/api/export/work-orders', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export BOMs to CSV
  exportBOMs: async () => {
    const response = await API.get('/api/export/bom', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export stock movements to CSV
  exportStockMovements: async () => {
    const response = await API.get('/api/export/stock-movements', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export materials to CSV
  exportMaterials: async () => {
    const response = await API.get('/api/export/materials', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Export all data
  exportAll: async () => {
    const response = await API.get('/api/export/all', {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Department API calls
export const departmentAPI = {
  // Get all departments
  getAll: async () => {
    const response = await API.get('/api/departments');
    return response.data.departments;
  },

  // Create new department
  create: async (departmentData: {
    departmentCode: string;
    departmentName: string;
    managerId?: string;
  }) => {
    const response = await API.post('/api/departments', departmentData);
    return response.data.department;
  },

  // Update department
  update: async (id: string, departmentData: {
    departmentName?: string;
    managerId?: string;
  }) => {
    const response = await API.put(`/api/departments/${id}`, departmentData);
    return response.data.department;
  },

  // Delete department
  delete: async (id: string) => {
    const response = await API.delete(`/api/departments/${id}`);
    return response.data;
  },

  // Get single department
  getById: async (id: string) => {
    const response = await API.get(`/api/departments/${id}`);
    return response.data.department;
  },

  // Get work centers in department
  getWorkCenters: async (id: string) => {
    const response = await API.get(`/api/departments/${id}/work-centers`);
    return response.data.workCenters;
  }
};

// Work Center API calls
export const workCenterAPI = {
  // Get all work centers
  getAll: async () => {
    const response = await API.get('/api/work-centers');
    return response.data.workCenters;
  },

  // Create new work center
  create: async (workCenterData: {
    code: string;
    name: string;
    description?: string;
    type: string;
    location: string;
    capacity?: number;
    hourlyRate?: number;
    departmentId: string;
    managerId?: string;
    specifications?: object;
    maintenanceSchedule?: object;
  }) => {
    const response = await API.post('/api/work-centers', workCenterData);
    return response.data.workCenter;
  },

  // Update work center
  update: async (id: string, workCenterData: {
    name?: string;
    description?: string;
    type?: string;
    location?: string;
    capacity?: number;
    hourlyRate?: number;
    status?: string;
    managerId?: string;
    specifications?: object;
    maintenanceSchedule?: object;
  }) => {
    const response = await API.put(`/api/work-centers/${id}`, workCenterData);
    return response.data.workCenter;
  },

  // Delete work center
  delete: async (id: string) => {
    const response = await API.delete(`/api/work-centers/${id}`);
    return response.data;
  },

  // Get single work center
  getById: async (id: string) => {
    const response = await API.get(`/api/work-centers/${id}`);
    return response.data.workCenter;
  },

  // Get work centers by type
  getByType: async (type: string) => {
    const response = await API.get(`/api/work-centers/by-type/${type}`);
    return response.data.workCenters;
  },

  // Get capacity summary
  getCapacitySummary: async () => {
    const response = await API.get('/api/work-centers/capacity/summary');
    return response.data;
  }
};

// Profile Reports API calls
export const profileReportAPI = {
  // Get all profile reports with filtering
  getAll: async (params?: {
    reportType?: string;
    operatorId?: string;
    workCenterId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await API.get('/api/profile-reports', { params });
    return response.data;
  },

  // Create new profile report
  create: async (reportData: {
    reportType: string;
    periodStart: string;
    periodEnd: string;
    operatorId?: string;
    workCenterId?: string;
    manufacturingOrderId?: string;
    metrics?: object;
    activities?: Array<object>;
    issues?: Array<object>;
    recommendations?: Array<object>;
  }) => {
    const response = await API.post('/api/profile-reports', reportData);
    return response.data.report;
  },

  // Get single profile report
  getById: async (id: string) => {
    const response = await API.get(`/api/profile-reports/${id}`);
    return response.data.report;
  },

  // Update profile report
  update: async (id: string, reportData: {
    metrics?: object;
    activities?: Array<object>;
    issues?: Array<object>;
    recommendations?: Array<object>;
    status?: string;
  }) => {
    const response = await API.put(`/api/profile-reports/${id}`, reportData);
    return response.data.report;
  },

  // Delete profile report
  delete: async (id: string) => {
    const response = await API.delete(`/api/profile-reports/${id}`);
    return response.data;
  },

  // Approve profile report
  approve: async (id: string) => {
    const response = await API.post(`/api/profile-reports/${id}/approve`);
    return response.data.report;
  },

  // Add comment to report
  addComment: async (id: string, comment: string) => {
    const response = await API.post(`/api/profile-reports/${id}/comments`, { comment });
    return response.data.report;
  },

  // Get performance analytics
  getPerformanceAnalytics: async (params?: {
    operatorId?: string;
    workCenterId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await API.get('/api/profile-reports/analytics/performance', { params });
    return response.data.analytics;
  },

  // Get operator performance comparison
  getOperatorAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await API.get('/api/profile-reports/analytics/operators', { params });
    return response.data.operatorPerformance;
  }
};

// Dashboard API calls
export const dashboardAPI = {
  // Get dashboard analytics and KPIs with trend data
  getAnalytics: async (timeframe?: string) => {
    const response = await API.get('/api/dashboard/analytics', { 
      params: { timeframe } 
    });
    return response.data;
  },

  // Get recent activity feed
  getActivity: async (limit?: number) => {
    const response = await API.get('/api/dashboard/activity', { 
      params: { limit } 
    });
    return response.data;
  }
};

// Quality Control API: manages quality inspections and metrics
export const qualityControlAPI = {
  // Get all quality inspections with filtering and pagination
  getInspections: async (filters?: any) => {
    const response = await API.get('/api/quality-control', { params: filters });
    return response.data;
  },

  // Get specific quality inspection by ID
  getInspection: async (id: string) => {
    const response = await API.get(`/api/quality-control/${id}`);
    return response.data;
  },

  // Create new quality inspection
  createInspection: async (inspectionData: any) => {
    const response = await API.post('/api/quality-control', inspectionData);
    return response.data;
  },

  // Update quality inspection
  updateInspection: async (id: string, inspectionData: any) => {
    const response = await API.put(`/api/quality-control/${id}`, inspectionData);
    return response.data;
  },

  // Delete quality inspection
  deleteInspection: async (id: string) => {
    const response = await API.delete(`/api/quality-control/${id}`);
    return response.data;
  },

  // Get quality metrics and statistics
  getMetrics: async (dateRange?: any) => {
    const response = await API.get('/api/quality-control/metrics/overview', {
      params: dateRange
    });
    return response.data;
  }
};

// Maintenance API: manages equipment and maintenance schedules
export const maintenanceAPI = {
  // Get all equipment with filtering
  getEquipment: async (filters?: any) => {
    const response = await API.get('/api/maintenance/equipment', { params: filters });
    return response.data;
  },

  // Get specific equipment by ID
  getEquipmentById: async (id: string) => {
    const response = await API.get(`/api/maintenance/equipment/${id}`);
    return response.data;
  },

  // Create new equipment
  createEquipment: async (equipmentData: any) => {
    const response = await API.post('/api/maintenance/equipment', equipmentData);
    return response.data;
  },

  // Update equipment
  updateEquipment: async (id: string, equipmentData: any) => {
    const response = await API.put(`/api/maintenance/equipment/${id}`, equipmentData);
    return response.data;
  },

  // Delete equipment
  deleteEquipment: async (id: string) => {
    const response = await API.delete(`/api/maintenance/equipment/${id}`);
    return response.data;
  },

  // Get all maintenance schedules
  getSchedules: async (filters?: any) => {
    const response = await API.get('/api/maintenance/schedules', { params: filters });
    return response.data;
  },

  // Create new maintenance schedule
  createSchedule: async (scheduleData: any) => {
    const response = await API.post('/api/maintenance/schedules', scheduleData);
    return response.data;
  },

  // Update maintenance schedule
  updateSchedule: async (id: string, scheduleData: any) => {
    const response = await API.put(`/api/maintenance/schedules/${id}`, scheduleData);
    return response.data;
  },

  // Get maintenance metrics
  getMetrics: async (dateRange?: any) => {
    const response = await API.get('/api/maintenance/metrics/overview', {
      params: dateRange
    });
    return response.data;
  }
};

// Admin API: administrative functions and user management
export const adminAPI = {
  // Get all users with advanced filtering
  getAllUsers: async (filters?: any) => {
    const response = await API.get('/api/admin/users', { params: filters });
    return response.data;
  },

  // Create new user
  createUser: async (userData: any) => {
    const response = await API.post('/api/admin/users', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId: string, userData: any) => {
    const response = await API.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const response = await API.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Get user activities/audit log
  getUserActivities: async (filters?: any) => {
    const response = await API.get('/api/admin/activities', { params: filters });
    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await API.get('/api/admin/stats');
    return response.data;
  },

  // Get system health metrics
  getSystemHealth: async () => {
    const response = await API.get('/api/admin/system-health');
    return response.data;
  }
};

// Advanced Inventory Management API functions
export const inventoryAPI = {
  // Get all inventory items with advanced filtering
  getItems: async (params = {}) => {
    const response = await API.get('/api/inventory/items', { params });
    return response.data;
  },

  // Get single inventory item with movement history
  getItem: async (id: string) => {
    const response = await API.get(`/api/inventory/items/${id}`);
    return response.data;
  },

  // Create new inventory item
  createItem: async (itemData: any) => {
    const response = await API.post('/api/inventory/items', itemData);
    return response.data;
  },

  // Update inventory item
  updateItem: async (id: string, itemData: any) => {
    const response = await API.put(`/api/inventory/items/${id}`, itemData);
    return response.data;
  },

  // Delete inventory item
  deleteItem: async (id: string) => {
    const response = await API.delete(`/api/inventory/items/${id}`);
    return response.data;
  },

  // Get all suppliers
  getSuppliers: async (params = {}) => {
    const response = await API.get('/api/inventory/suppliers', { params });
    return response.data;
  },

  // Create new supplier
  createSupplier: async (supplierData: any) => {
    const response = await API.post('/api/inventory/suppliers', supplierData);
    return response.data;
  },

  // Update supplier
  updateSupplier: async (id: string, supplierData: any) => {
    const response = await API.put(`/api/inventory/suppliers/${id}`, supplierData);
    return response.data;
  },

  // Get reorder alerts
  getReorderAlerts: async (params = {}) => {
    const response = await API.get('/api/inventory/reorder-alerts', { params });
    return response.data;
  },

  // Create reorder alert
  createReorderAlert: async (alertData: any) => {
    const response = await API.post('/api/inventory/reorder-alerts', alertData);
    return response.data;
  },

  // Get inventory forecasts
  getForecasts: async (params = {}) => {
    const response = await API.get('/api/inventory/forecasts', { params });
    return response.data;
  },

  // Generate new forecasts
  generateForecasts: async () => {
    const response = await API.post('/api/inventory/forecasts/generate');
    return response.data;
  },

  // Get inventory analytics
  getAnalytics: async (params = {}) => {
    const response = await API.get('/api/inventory/analytics', { params });
    return response.data;
  },

  // Stock movement operations
  recordMovement: async (movementData: any) => {
    const response = await API.post('/api/inventory/movements', movementData);
    return response.data;
  },

  // Get movement history
  getMovements: async (params = {}) => {
    const response = await API.get('/api/inventory/movements', { params });
    return response.data;
  },

  // Bulk operations
  bulkUpdateItems: async (updates: any[]) => {
    const response = await API.post('/api/inventory/items/bulk-update', { updates });
    return response.data;
  },

  // Export inventory data
  exportInventory: async (format = 'csv', filters = {}) => {
    const response = await API.get('/api/inventory/export', {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default API;