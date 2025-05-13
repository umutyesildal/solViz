import { act, renderHook } from '@testing-library/react';
import { useChartsStore, Chart } from '../charts';
import { chartsAPI } from '@/utils/api';

// Mock the API module
jest.mock('@/utils/api', () => ({
  chartsAPI: {
    getCharts: jest.fn(),
    getPublicCharts: jest.fn(),
    getChart: jest.fn(),
    createChart: jest.fn(),
    updateChart: jest.fn(),
    deleteChart: jest.fn(),
  },
}));

const mockCharts: Chart[] = [
  {
    id: 1,
    title: 'Test Chart 1',
    description: 'Test Description 1',
    query: 'SELECT * FROM test_table',
    natural_language_query: 'Show me test data',
    provider: 'flipside',
    data: { values: [{ x: 1, y: 10 }, { x: 2, y: 20 }] },
    vega_spec: { 
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      mark: 'bar',
      encoding: {
        x: { field: 'x', type: 'quantitative' },
        y: { field: 'y', type: 'quantitative' }
      }
    },
    is_public: true,
    user_id: 1,
    created_at: '2024-05-13T12:00:00Z',
  },
  {
    id: 2,
    title: 'Test Chart 2',
    description: 'Test Description 2',
    query: 'SELECT * FROM another_table',
    natural_language_query: 'Show me more test data',
    provider: 'helius',
    data: { values: [{ x: 1, y: 30 }, { x: 2, y: 40 }] },
    vega_spec: {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      mark: 'line',
      encoding: {
        x: { field: 'x', type: 'quantitative' },
        y: { field: 'y', type: 'quantitative' }
      }
    },
    is_public: false,
    user_id: 1,
    created_at: '2024-05-13T12:30:00Z',
  },
];

describe('useChartsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() => useChartsStore());
    
    expect(result.current.charts).toEqual([]);
    expect(result.current.publicCharts).toEqual([]);
    expect(result.current.currentChart).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('fetchCharts should update charts state on success', async () => {
    (chartsAPI.getCharts as jest.Mock).mockResolvedValue(mockCharts);
    
    const { result } = renderHook(() => useChartsStore());
    
    await act(async () => {
      await result.current.fetchCharts();
    });
    
    expect(chartsAPI.getCharts).toHaveBeenCalled();
    expect(result.current.charts).toEqual(mockCharts);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('fetchCharts should set error on failure', async () => {
    const errorMessage = 'Failed to fetch charts';
    (chartsAPI.getCharts as jest.Mock).mockRejectedValue({ 
      response: { data: { detail: errorMessage } } 
    });
    
    const { result } = renderHook(() => useChartsStore());
    
    await act(async () => {
      await result.current.fetchCharts();
    });
    
    expect(chartsAPI.getCharts).toHaveBeenCalled();
    expect(result.current.charts).toEqual(mockCharts);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  test('fetchPublicCharts should update publicCharts state on success', async () => {
    (chartsAPI.getPublicCharts as jest.Mock).mockResolvedValue(mockCharts);
    
    const { result } = renderHook(() => useChartsStore());
    
    await act(async () => {
      await result.current.fetchPublicCharts();
    });
    
    expect(chartsAPI.getPublicCharts).toHaveBeenCalled();
    expect(result.current.publicCharts).toEqual(mockCharts);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('createChart should add new chart to charts array on success', async () => {
    const newChartData = {
      title: 'New Chart',
      query: 'SELECT * FROM new_table',
      natural_language_query: 'Create a new chart',
      provider: 'flipside',
      is_public: true,
    };
    
    const createdChart = {
      ...newChartData,
      id: 3,
      data: { values: [] },
      vega_spec: {},
      user_id: 1,
      created_at: '2024-05-13T13:00:00Z',
    };
    
    (chartsAPI.createChart as jest.Mock).mockResolvedValue(createdChart);
    
    const { result } = renderHook(() => useChartsStore());
    
    // Set initial state with existing charts
    act(() => {
      result.current.charts = [...mockCharts];
    });
    
    await act(async () => {
      await result.current.createChart(newChartData);
    });
    
    expect(chartsAPI.createChart).toHaveBeenCalledWith(newChartData);
    expect(result.current.charts).toContainEqual(createdChart);
    expect(result.current.charts).toHaveLength(mockCharts.length + 1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});