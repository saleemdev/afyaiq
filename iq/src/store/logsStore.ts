import { create } from 'zustand';

export interface LogEntry {
  id: string;
  timestamp: string;
  route_path: string;
  route_type: 'standard' | 'ai_model' | 'static';
  method: string;
  status_code: number;
  response_time: number;
  client_ip: string;
  user_agent: string;
  tokens_used?: number; // AI routes only
  model?: string; // AI routes only
  provider?: string; // AI routes only
  error_message?: string;
}

interface LogFilters {
  route: string; // 'all' or specific route path
  status: string; // 'all', '2xx', '4xx', '5xx'
  timeRange: string; // 'last_hour', 'last_24h', 'last_7d', 'last_30d'
}

interface LogStats {
  totalRequests: number;
  avgResponseTime: number;
  tokensUsed: number;
  errorRate: number;
}

interface LogsState {
  logs: LogEntry[];
  filters: LogFilters;
  stats: LogStats;
  isLoading: boolean;
  fetchLogs: () => Promise<void>;
  subscribeToLogs: () => void;
  setFilter: (key: keyof LogFilters, value: string) => void;
  getFilteredLogs: () => LogEntry[];
}

// Mock log data
const MOCK_LOGS: LogEntry[] = [
  {
    id: '1',
    timestamp: '2025-01-29T18:45:23Z',
    route_path: '/api/v1/chat/completions',
    route_type: 'ai_model',
    method: 'POST',
    status_code: 200,
    response_time: 1245,
    client_ip: '203.0.113.42',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1)',
    tokens_used: 1850,
    model: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic'
  },
  {
    id: '2',
    timestamp: '2025-01-29T18:44:56Z',
    route_path: '/api/v1/patient/records',
    route_type: 'standard',
    method: 'GET',
    status_code: 200,
    response_time: 234,
    client_ip: '198.51.100.15',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '3',
    timestamp: '2025-01-29T18:44:12Z',
    route_path: '/api/v1/ai/medical-imaging',
    route_type: 'ai_model',
    method: 'POST',
    status_code: 200,
    response_time: 2456,
    client_ip: '192.0.2.88',
    user_agent: 'PostmanRuntime/7.37.0',
    tokens_used: 3200,
    model: 'gpt-4-vision-preview',
    provider: 'openai'
  },
  {
    id: '4',
    timestamp: '2025-01-29T18:43:45Z',
    route_path: '/api/v1/patient/records',
    route_type: 'standard',
    method: 'POST',
    status_code: 201,
    response_time: 456,
    client_ip: '198.51.100.15',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '5',
    timestamp: '2025-01-29T18:43:01Z',
    route_path: '/static/medical-forms',
    route_type: 'static',
    method: 'GET',
    status_code: 200,
    response_time: 34,
    client_ip: '203.0.113.77',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  },
  {
    id: '6',
    timestamp: '2025-01-29T18:42:33Z',
    route_path: '/api/v1/chat/completions',
    route_type: 'ai_model',
    method: 'POST',
    status_code: 429,
    response_time: 12,
    client_ip: '198.51.100.99',
    user_agent: 'python-requests/2.31.0',
    error_message: 'Rate limit exceeded: 60 requests per minute'
  },
  {
    id: '7',
    timestamp: '2025-01-29T18:41:58Z',
    route_path: '/api/v1/billing',
    route_type: 'standard',
    method: 'GET',
    status_code: 200,
    response_time: 189,
    client_ip: '192.0.2.123',
    user_agent: 'Mozilla/5.0 (X11; Linux x86_64)'
  },
  {
    id: '8',
    timestamp: '2025-01-29T18:41:22Z',
    route_path: '/api/v1/chat/completions',
    route_type: 'ai_model',
    method: 'POST',
    status_code: 200,
    response_time: 987,
    client_ip: '203.0.113.42',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1)',
    tokens_used: 2340,
    model: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic'
  },
  {
    id: '9',
    timestamp: '2025-01-29T18:40:45Z',
    route_path: '/static/patient-portal',
    route_type: 'static',
    method: 'GET',
    status_code: 200,
    response_time: 56,
    client_ip: '198.51.100.200',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: '10',
    timestamp: '2025-01-29T18:40:12Z',
    route_path: '/api/v1/patient/records',
    route_type: 'standard',
    method: 'PUT',
    status_code: 500,
    response_time: 1234,
    client_ip: '192.0.2.88',
    user_agent: 'PostmanRuntime/7.37.0',
    error_message: 'Internal server error: Database connection timeout'
  },
  {
    id: '11',
    timestamp: '2025-01-29T18:39:34Z',
    route_path: '/api/v1/ai/medical-imaging',
    route_type: 'ai_model',
    method: 'POST',
    status_code: 200,
    response_time: 1678,
    client_ip: '203.0.113.150',
    user_agent: 'AfyaIQ-Mobile/2.1.0',
    tokens_used: 2890,
    model: 'gpt-4-vision-preview',
    provider: 'openai'
  },
  {
    id: '12',
    timestamp: '2025-01-29T18:38:56Z',
    route_path: '/api/v1/billing',
    route_type: 'standard',
    method: 'POST',
    status_code: 201,
    response_time: 234,
    client_ip: '198.51.100.15',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: '13',
    timestamp: '2025-01-29T18:38:12Z',
    route_path: '/api/v1/chat/completions',
    route_type: 'ai_model',
    method: 'POST',
    status_code: 200,
    response_time: 1123,
    client_ip: '192.0.2.45',
    user_agent: 'curl/8.0.1',
    tokens_used: 1560,
    model: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic'
  },
  {
    id: '14',
    timestamp: '2025-01-29T18:37:45Z',
    route_path: '/static/medical-forms',
    route_type: 'static',
    method: 'GET',
    status_code: 404,
    response_time: 23,
    client_ip: '203.0.113.222',
    user_agent: 'Mozilla/5.0 (iPad; CPU OS 17_1)',
    error_message: 'File not found: consent-form-2024.pdf'
  },
  {
    id: '15',
    timestamp: '2025-01-29T18:37:01Z',
    route_path: '/api/v1/patient/records',
    route_type: 'standard',
    method: 'GET',
    status_code: 200,
    response_time: 198,
    client_ip: '198.51.100.88',
    user_agent: 'Mozilla/5.0 (Android 14; Mobile)'
  }
];

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: [],
  filters: {
    route: 'all',
    status: 'all',
    timeRange: 'last_24h'
  },
  stats: {
    totalRequests: 0,
    avgResponseTime: 0,
    tokensUsed: 0,
    errorRate: 0
  },
  isLoading: false,

  fetchLogs: async () => {
    set({ isLoading: true });
    try {
      // Mock API call
      // In production: GET /api/method/afyaiq.api.logs.get_logs
      await new Promise(resolve => setTimeout(resolve, 600));

      // Calculate stats
      const totalRequests = MOCK_LOGS.length;
      const avgResponseTime =
        MOCK_LOGS.reduce((sum, log) => sum + log.response_time, 0) / totalRequests;
      const tokensUsed = MOCK_LOGS.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
      const errorCount = MOCK_LOGS.filter(
        log => log.status_code >= 400 && log.status_code < 600
      ).length;
      const errorRate = (errorCount / totalRequests) * 100;

      set({
        logs: MOCK_LOGS,
        stats: {
          totalRequests,
          avgResponseTime: Math.round(avgResponseTime),
          tokensUsed,
          errorRate: Math.round(errorRate * 10) / 10
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Fetch logs failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  subscribeToLogs: () => {
    // In production, this would establish a WebSocket or Server-Sent Events connection
    // to receive real-time log updates
    console.log('Log subscription initialized (mock)');
    // Example: const ws = new WebSocket('wss://api.afyaiq.com/logs/stream');
  },

  setFilter: (key: keyof LogFilters, value: string) => {
    set(state => ({
      filters: { ...state.filters, [key]: value }
    }));
  },

  getFilteredLogs: () => {
    const { logs, filters } = get();

    return logs.filter(log => {
      const matchesRoute = filters.route === 'all' || log.route_path === filters.route;

      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === '2xx' && log.status_code >= 200 && log.status_code < 300) ||
        (filters.status === '4xx' && log.status_code >= 400 && log.status_code < 500) ||
        (filters.status === '5xx' && log.status_code >= 500 && log.status_code < 600);

      // Time range filtering would be implemented here
      // For now, all logs are within the selected time range (mock data)
      const matchesTimeRange = true;

      return matchesRoute && matchesStatus && matchesTimeRange;
    });
  }
}));
