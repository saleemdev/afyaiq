import axios, { type AxiosInstance } from 'axios';

// API Base Configuration
const BASE_URL = window.location.origin;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add CSRF token
apiClient.interceptors.request.use(
  (config) => {
    // Get CSRF token from Frappe
    const csrfToken = (window as any).csrf_token || '';
    if (csrfToken) {
      config.headers['X-Frappe-CSRF-Token'] = csrfToken;
    }

    // Add auth token if exists
    const token = localStorage.getItem('afyaiq_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Handle specific error codes
      if (error.response.status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('afyaiq_token');
        localStorage.removeItem('afyaiq_user');
        window.location.href = '/login';
      }

      if (error.response.status === 403) {
        // Forbidden - show permission error
        console.error('Permission denied');
      }

      if (error.response.status === 429) {
        // Rate limit exceeded
        console.error('Rate limit exceeded');
      }
    }

    return Promise.reject(error);
  }
);

// API Service Methods
export const api = {
  // Authentication
  auth: {
    githubLogin: (code: string) =>
      apiClient.post('/api/method/afyaiq.api.auth.github_login', { code }),

    logout: () =>
      apiClient.post('/api/method/frappe.auth.logout'),

    getCurrentUser: () =>
      apiClient.get('/api/method/frappe.auth.get_logged_user'),

    applyForAdmin: () =>
      apiClient.post('/api/method/afyaiq.api.auth.apply_for_admin')
  },

  // Routes
  routes: {
    getAll: (filters?: any) =>
      apiClient.get('/api/method/afyaiq.api.routes.get_routes', { params: filters }),

    getById: (id: string) =>
      apiClient.get(`/api/method/afyaiq.api.routes.get_route?id=${id}`),

    create: (data: any) =>
      apiClient.post('/api/method/afyaiq.api.routes.create_route', data),

    update: (id: string, data: any) =>
      apiClient.put(`/api/method/afyaiq.api.routes.update_route`, { id, ...data }),

    delete: (id: string) =>
      apiClient.delete(`/api/method/afyaiq.api.routes.delete_route?id=${id}`),

    test: (id: string, testData: any) =>
      apiClient.post('/api/method/afyaiq.api.routes.test_route', { id, ...testData })
  },

  // Logs
  logs: {
    getAll: (filters?: any) =>
      apiClient.get('/api/method/afyaiq.api.logs.get_logs', { params: filters }),

    getStats: (timeRange?: string) =>
      apiClient.get('/api/method/afyaiq.api.logs.get_stats', { params: { time_range: timeRange } })
  },

  // Security
  security: {
    getPolicies: () =>
      apiClient.get('/api/method/afyaiq.api.security.get_policies'),

    createPolicy: (data: any) =>
      apiClient.post('/api/method/afyaiq.api.security.create_policy', data),

    getAPIKeys: () =>
      apiClient.get('/api/method/afyaiq.api.security.get_api_keys'),

    generateAPIKey: (name: string) =>
      apiClient.post('/api/method/afyaiq.api.security.generate_api_key', { name }),

    revokeAPIKey: (key: string) =>
      apiClient.post('/api/method/afyaiq.api.security.revoke_api_key', { key })
  },

  // Admin
  admin: {
    getAdminApplications: () =>
      apiClient.get('/api/method/afyaiq.api.admin.get_applications'),

    approveAdminApplication: (userId: string) =>
      apiClient.post('/api/method/afyaiq.api.admin.approve_application', { user_id: userId }),

    rejectAdminApplication: (userId: string) =>
      apiClient.post('/api/method/afyaiq.api.admin.reject_application', { user_id: userId })
  }
};

export default api;
