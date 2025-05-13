import { create } from 'zustand';
import { authAPI } from '@/utils/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('access_token', data.access_token);
      
      // User details would need to be fetched from a separate endpoint
      // For now, we'll just mark as authenticated
      set({ 
        isAuthenticated: true,
        isLoading: false,
        // Here we would typically set the user data from a separate API call
        // user: userData,
      });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Login failed' 
      });
      throw error;
    }
  },
  
  register: async (email: string, password: string, fullName: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const userData = await authAPI.register({
        email,
        password,
        full_name: fullName
      });
      
      // After registration, log the user in
      await get().login(email, password);
      
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    set({ isAuthenticated: false, user: null });
  },
  
  checkAuth: () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  }
}));
