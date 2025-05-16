import { create } from 'zustand';
import { queryAPI, conversationsAPI } from '@/utils/api';

export interface QueryResult {
  data: Record<string, unknown>[];
  query: string;
  vega_spec: Record<string, unknown>;
  assistant_message?: string;
  thread_id?: string;
  requires_clarification?: boolean;
}

export interface ConversationMessage {
  id?: number;
  thread_id: string;
  role: string;
  content: string;
  created_at?: string;
}

export interface ConversationThread {
  id: number;
  user_id: number;
  thread_id: string;
  title: string | null;
  created_at: string;
  last_activity_at: string;
  messages: ConversationMessage[];
}

interface QueryState {
  naturalLanguageQuery: string;
  provider: string;
  result: QueryResult | null;
  isLoading: boolean;
  error: string | null;
  threadId: string | null;
  conversationHistory: ConversationMessage[];
  activeThreads: ConversationThread[];
  setQuery: (query: string) => void;
  setProvider: (provider: string) => void;
  setThreadId: (threadId: string | null) => void;
  executeQuery: () => Promise<QueryResult>;
  clearConversation: () => void;
  fetchConversationThreads: () => Promise<ConversationThread[]>;
  fetchConversationMessages: (threadId: string) => Promise<ConversationMessage[]>;
  deleteConversationThread: (threadId: string) => Promise<void>;
  updateConversationThread: (threadId: string, threadData: { title?: string }) => Promise<void>;
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    }
  };
  message: string;
}

export const useQueryStore = create<QueryState>((set, get) => ({
  naturalLanguageQuery: '',
  provider: 'flipside',
  result: null,
  isLoading: false,
  error: null,
  threadId: null,
  conversationHistory: [],
  activeThreads: [],
  
  setQuery: (query: string) => {
    set({ naturalLanguageQuery: query });
  },
  
  setProvider: (provider: string) => {
    set({ provider });
  },
  
  setThreadId: (threadId: string | null) => {
    set({ 
      threadId,
      // Clear the result when switching threads to focus on the conversation
      result: threadId ? null : get().result
    });
    
    // If we have a valid threadId, load its conversation history
    if (threadId) {
      (async () => {
        try {
          const messages = await conversationsAPI.getConversationMessages(threadId);
          set({ conversationHistory: messages });
          console.log(`Loaded ${messages.length} messages for thread ${threadId}`);
        } catch (error) {
          console.error(`Failed to load conversation history for thread ${threadId}:`, error);
        }
      })();
    } else {
      // Clear conversation history if no thread is selected
      set({ conversationHistory: [] });
    }
  },
  
  executeQuery: async () => {
    const { naturalLanguageQuery, provider, threadId } = get();
    
    if (!naturalLanguageQuery) {
      set({ error: 'Please enter a query' });
      throw new Error('Please enter a query');
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Add the user message to local conversation history
      // (actual persistence happens on the backend)
      const userMessage = { 
        thread_id: threadId || 'new-thread',
        role: 'user', 
        content: naturalLanguageQuery 
      };
      
      set((state) => ({
        conversationHistory: [
          ...state.conversationHistory, 
          userMessage
        ]
      }));
      
      const result = await queryAPI.processQuery({
        query: naturalLanguageQuery,
        provider,
        thread_id: threadId || undefined // Convert null to undefined for API
      });
      
      // Add the assistant response to local conversation history
      if (result.assistant_message && result.thread_id) {
        const assistantMessage = { 
          thread_id: result.thread_id,
          role: 'assistant', 
          content: result.assistant_message 
        };
        
        set((state) => ({
          conversationHistory: [
            ...state.conversationHistory,
            assistantMessage
          ]
        }));
      }
      
      // If threadId changed (new conversation was created), update it
      if (result.thread_id && threadId !== result.thread_id) {
        set({ threadId: result.thread_id });
        
        // Also update thread list to show the new thread
        // Don't await this to prevent blocking
        get().fetchConversationThreads().catch(error => {
          console.error("Failed to fetch updated conversation threads:", error);
        });
      }
      
      set({ result, isLoading: false });
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({ 
        isLoading: false, 
        error: apiError.response?.data?.detail || apiError.message || 'Failed to process query' 
      });
      throw error;
    }
  },
  
  clearConversation: () => {
    set({ 
      threadId: null,
      conversationHistory: [],
      result: null
    });
  },
  
  fetchConversationThreads: async () => {
    try {
      const threads = await conversationsAPI.getConversationThreads();
      set({ activeThreads: threads });
      return threads;
    } catch (error) {
      console.error('Failed to fetch conversation threads:', error);
      return [];
    }
  },
  
  fetchConversationMessages: async (threadId: string) => {
    try {
      const messages = await conversationsAPI.getConversationMessages(threadId);
      return messages;
    } catch (error) {
      console.error(`Failed to fetch messages for thread ${threadId}:`, error);
      return [];
    }
  },
  
  deleteConversationThread: async (threadId: string) => {
    try {
      await conversationsAPI.deleteConversationThread(threadId);
      // Remove the thread from activeThreads
      set((state) => ({
        activeThreads: state.activeThreads.filter(thread => thread.thread_id !== threadId)
      }));
      // Clear current thread if it was the active one
      if (get().threadId === threadId) {
        set({ threadId: null, conversationHistory: [] });
      }
    } catch (error) {
      console.error(`Failed to delete thread ${threadId}:`, error);
      throw error;
    }
  },
  
  updateConversationThread: async (threadId: string, threadData: { title?: string }) => {
    try {
      await conversationsAPI.updateConversationThread(threadId, threadData);
      
      // Update the thread title in the active threads list
      set((state) => ({
        activeThreads: state.activeThreads.map(thread => 
          thread.thread_id === threadId 
            ? { ...thread, ...(threadData.title ? { title: threadData.title } : {}) } 
            : thread
        )
      }));
      
    } catch (error) {
      console.error(`Failed to update thread ${threadId}:`, error);
      throw error;
    }
  }
}));
