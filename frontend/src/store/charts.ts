import { create } from 'zustand';
import { chartsAPI } from '@/utils/api';

export interface Chart {
  id: number;
  title: string;
  description?: string;
  query: string;
  natural_language_query: string;
  provider: string;
  data: any;
  vega_spec: any;
  is_public: boolean;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

interface ChartsState {
  charts: Chart[];
  publicCharts: Chart[];
  currentChart: Chart | null;
  isLoading: boolean;
  error: string | null;
  fetchCharts: () => Promise<void>;
  fetchPublicCharts: () => Promise<void>;
  fetchChart: (id: number) => Promise<Chart>;
  createChart: (chartData: Partial<Chart>) => Promise<Chart>;
  updateChart: (id: number, chartData: Partial<Chart>) => Promise<Chart>;
  deleteChart: (id: number) => Promise<void>;
}

export const useChartsStore = create<ChartsState>((set, get) => ({
  charts: [],
  publicCharts: [],
  currentChart: null,
  isLoading: false,
  error: null,
  
  fetchCharts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const charts = await chartsAPI.getCharts();
      set({ charts, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to fetch charts' 
      });
    }
  },
  
  fetchPublicCharts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const publicCharts = await chartsAPI.getPublicCharts();
      set({ publicCharts, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to fetch public charts' 
      });
    }
  },
  
  fetchChart: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const chart = await chartsAPI.getChart(id);
      set({ currentChart: chart, isLoading: false });
      return chart;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to fetch chart' 
      });
      throw error;
    }
  },
  
  createChart: async (chartData: Partial<Chart>) => {
    set({ isLoading: true, error: null });
    
    try {
      const newChart = await chartsAPI.createChart(chartData);
      set({ 
        charts: [...get().charts, newChart],
        isLoading: false 
      });
      return newChart;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to create chart' 
      });
      throw error;
    }
  },
  
  updateChart: async (id: number, chartData: Partial<Chart>) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedChart = await chartsAPI.updateChart(id, chartData);
      set({ 
        charts: get().charts.map(chart => 
          chart.id === id ? updatedChart : chart
        ),
        currentChart: updatedChart,
        isLoading: false 
      });
      return updatedChart;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to update chart' 
      });
      throw error;
    }
  },
  
  deleteChart: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      await chartsAPI.deleteChart(id);
      set({ 
        charts: get().charts.filter(chart => chart.id !== id),
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to delete chart' 
      });
      throw error;
    }
  },
}))
