import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle authentication errors
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (email: string, password: string) => {
    // Convert FormData to URLSearchParams for proper x-www-form-urlencoded format
    const formData = new URLSearchParams();
    formData.append('username', email); // Using email as username
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  register: async (userData: { email: string; password: string; full_name: string }) => {
    const response = await api.post('/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
};

// Charts API
export const chartsAPI = {
  getCharts: async (skip = 0, limit = 100) => {
    const response = await api.get(`/charts/?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  getPublicCharts: async (skip = 0, limit = 100) => {
    const response = await api.get(`/charts/public?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  getChart: async (chartId: number) => {
    const response = await api.get(`/charts/${chartId}`);
    return response.data;
  },
  
  createChart: async (chartData: any) => {
    const response = await api.post('/charts/', chartData);
    return response.data;
  },
  
  updateChart: async (chartId: number, chartData: any) => {
    const response = await api.put(`/charts/${chartId}`, chartData);
    return response.data;
  },
  
  deleteChart: async (chartId: number) => {
    const response = await api.delete(`/charts/${chartId}`);
    return response.data;
  },
};

// Query API
export const queryAPI = {
  processQuery: async (queryData: { query: string; provider: string }) => {
    const response = await api.post('/query/', queryData);
    return response.data;
  },
};

// Debug API
export const debugAPI = {
  getLogs: async (lines: number = 100) => {
    const response = await api.get(`/debug/logs/recent?lines=${lines}`);
    return response.data;
  },
  
  getSystemInfo: async () => {
    const response = await api.get('/debug/system/info');
    return response.data;
  }
};

export default api;
