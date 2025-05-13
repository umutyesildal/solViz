import { create } from 'zustand';
import { queryAPI } from '@/utils/api';

export interface QueryResult {
  data: any[];
  query: string;
  vega_spec: any;
}

interface QueryState {
  naturalLanguageQuery: string;
  provider: string;
  result: QueryResult | null;
  isLoading: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  setProvider: (provider: string) => void;
  executeQuery: () => Promise<QueryResult>;
}

export const useQueryStore = create<QueryState>((set, get) => ({
  naturalLanguageQuery: '',
  provider: 'flipside',
  result: null,
  isLoading: false,
  error: null,
  
  setQuery: (query: string) => {
    set({ naturalLanguageQuery: query });
  },
  
  setProvider: (provider: string) => {
    set({ provider });
  },
  
  executeQuery: async () => {
    const { naturalLanguageQuery, provider } = get();
    
    if (!naturalLanguageQuery) {
      set({ error: 'Please enter a query' });
      throw new Error('Please enter a query');
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const result = await queryAPI.processQuery({
        query: naturalLanguageQuery,
        provider
      });
      
      set({ result, isLoading: false });
      return result;
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Failed to process query' 
      });
      throw error;
    }
  }
}));
