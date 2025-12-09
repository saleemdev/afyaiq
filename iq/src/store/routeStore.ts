import { create } from 'zustand';

export type RouteType = 'standard' | 'ai_model' | 'static';
export type RouteStatus = 'Draft' | 'Pending' | 'Approved' | 'Published';

export interface AIConfig {
  provider: 'anthropic' | 'openai' | 'ollama' | 'local';
  model: string;
  endpoint: string;
  max_tokens: number;
  temperature: number;
  prompt_template?: string;
}

export interface SecurityConfig {
  authentication_required: boolean;
  rate_limit: {
    requests_per_minute: number;
    tokens_per_minute?: number; // AI routes only
  };
  cors_enabled: boolean;
  ip_whitelist: string[];
}

export interface RouteCreator {
  name: string;
  is_admin: boolean;
}

export interface Route {
  id: string;
  route_path: string;
  route_type: RouteType;
  created_by: RouteCreator;
  upstream_url?: string; // Standard routes
  methods?: string[]; // Standard routes
  ai_config?: AIConfig; // AI Model routes only
  static_path?: string; // Static content routes
  status: RouteStatus;
  security: SecurityConfig;
  requests_24h: number;
  avg_response_time: number;
  tokens_used_24h?: number; // AI routes only
  created_at: string;
  updated_at: string;
}

interface RouteFilters {
  type: RouteType | 'all';
  status: RouteStatus | 'all';
  search: string;
}

interface RouteState {
  routes: Route[];
  selectedRoute: Route | null;
  filters: RouteFilters;
  isLoading: boolean;
  fetchRoutes: () => Promise<void>;
  createRoute: (data: Partial<Route>) => Promise<void>;
  updateRoute: (id: string, data: Partial<Route>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  setFilter: (key: keyof RouteFilters, value: string) => void;
  selectRoute: (id: string | null) => void;
  getFilteredRoutes: () => Route[];
}

// Mock data
const MOCK_ROUTES: Route[] = [
  {
    id: '1',
    route_path: '/api/v1/chat/completions',
    route_type: 'ai_model',
    created_by: { name: 'Sarah Chen', is_admin: true },
    ai_config: {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      endpoint: 'https://api.anthropic.com/v1/messages',
      max_tokens: 4096,
      temperature: 0.7,
      prompt_template: 'You are a helpful medical assistant.'
    },
    status: 'Published',
    security: {
      authentication_required: true,
      rate_limit: {
        requests_per_minute: 60,
        tokens_per_minute: 100000
      },
      cors_enabled: true,
      ip_whitelist: []
    },
    requests_24h: 1247,
    avg_response_time: 842,
    tokens_used_24h: 438920,
    created_at: '2025-01-15T08:30:00Z',
    updated_at: '2025-01-28T14:22:00Z'
  },
  {
    id: '2',
    route_path: '/api/v1/patient/records',
    route_type: 'standard',
    created_by: { name: 'John Mwangi', is_admin: false },
    upstream_url: 'https://ehr.afyaiq.internal/api/patient/records',
    methods: ['GET', 'POST', 'PUT'],
    status: 'Published',
    security: {
      authentication_required: true,
      rate_limit: {
        requests_per_minute: 100
      },
      cors_enabled: false,
      ip_whitelist: ['10.0.0.0/8', '192.168.1.0/24']
    },
    requests_24h: 3456,
    avg_response_time: 234,
    created_at: '2025-01-10T10:15:00Z',
    updated_at: '2025-01-29T09:45:00Z'
  },
  {
    id: '3',
    route_path: '/api/v1/ai/medical-imaging',
    route_type: 'ai_model',
    created_by: { name: 'Sarah Chen', is_admin: true },
    ai_config: {
      provider: 'openai',
      model: 'gpt-4-vision-preview',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      max_tokens: 2048,
      temperature: 0.3,
      prompt_template: 'Analyze this medical image and provide diagnostic insights.'
    },
    status: 'Approved',
    security: {
      authentication_required: true,
      rate_limit: {
        requests_per_minute: 30,
        tokens_per_minute: 50000
      },
      cors_enabled: true,
      ip_whitelist: []
    },
    requests_24h: 567,
    avg_response_time: 1456,
    tokens_used_24h: 125340,
    created_at: '2025-01-20T13:45:00Z',
    updated_at: '2025-01-27T16:30:00Z'
  },
  {
    id: '4',
    route_path: '/api/v1/appointments',
    route_type: 'standard',
    created_by: { name: 'Amara Okafor', is_admin: false },
    upstream_url: 'https://scheduler.afyaiq.internal/api/appointments',
    methods: ['GET', 'POST', 'DELETE'],
    status: 'Pending',
    security: {
      authentication_required: true,
      rate_limit: {
        requests_per_minute: 200
      },
      cors_enabled: true,
      ip_whitelist: []
    },
    requests_24h: 0,
    avg_response_time: 0,
    created_at: '2025-01-29T11:20:00Z',
    updated_at: '2025-01-29T11:20:00Z'
  },
  {
    id: '5',
    route_path: '/static/medical-forms',
    route_type: 'static',
    created_by: { name: 'John Mwangi', is_admin: false },
    static_path: '/var/www/afyaiq/static/medical-forms',
    status: 'Published',
    security: {
      authentication_required: false,
      rate_limit: {
        requests_per_minute: 500
      },
      cors_enabled: true,
      ip_whitelist: []
    },
    requests_24h: 892,
    avg_response_time: 45,
    created_at: '2025-01-12T09:00:00Z',
    updated_at: '2025-01-25T14:15:00Z'
  },
  {
    id: '6',
    route_path: '/api/v1/ai/local-llama',
    route_type: 'ai_model',
    created_by: { name: 'Amara Okafor', is_admin: false },
    ai_config: {
      provider: 'ollama',
      model: 'llama3-medical',
      endpoint: 'http://ollama.afyaiq.internal:11434/api/generate',
      max_tokens: 1024,
      temperature: 0.5
    },
    status: 'Draft',
    security: {
      authentication_required: true,
      rate_limit: {
        requests_per_minute: 50,
        tokens_per_minute: 75000
      },
      cors_enabled: false,
      ip_whitelist: ['10.0.0.0/8']
    },
    requests_24h: 0,
    avg_response_time: 0,
    created_at: '2025-01-29T15:30:00Z',
    updated_at: '2025-01-29T15:30:00Z'
  },
  {
    id: '7',
    route_path: '/api/v1/billing',
    route_type: 'standard',
    created_by: { name: 'Sarah Chen', is_admin: true },
    upstream_url: 'https://billing.afyaiq.internal/api/billing',
    methods: ['GET', 'POST', 'PATCH'],
    status: 'Published',
    security: {
      authentication_required: true,
      rate_limit: {
        requests_per_minute: 150
      },
      cors_enabled: false,
      ip_whitelist: ['10.0.0.0/8']
    },
    requests_24h: 2134,
    avg_response_time: 189,
    created_at: '2025-01-08T12:00:00Z',
    updated_at: '2025-01-28T18:45:00Z'
  },
  {
    id: '8',
    route_path: '/static/patient-portal',
    route_type: 'static',
    created_by: { name: 'John Mwangi', is_admin: false },
    static_path: '/var/www/afyaiq/static/patient-portal',
    status: 'Published',
    security: {
      authentication_required: true,
      rate_limit: {
        requests_per_minute: 300
      },
      cors_enabled: true,
      ip_whitelist: []
    },
    requests_24h: 4567,
    avg_response_time: 67,
    created_at: '2025-01-05T08:30:00Z',
    updated_at: '2025-01-26T10:20:00Z'
  }
];

export const useRouteStore = create<RouteState>((set, get) => ({
  routes: [],
  selectedRoute: null,
  filters: {
    type: 'all',
    status: 'all',
    search: ''
  },
  isLoading: false,

  fetchRoutes: async () => {
    set({ isLoading: true });
    try {
      // Mock API call
      // In production: GET /api/method/afyaiq.api.routes.get_routes
      await new Promise(resolve => setTimeout(resolve, 800));

      set({
        routes: MOCK_ROUTES,
        isLoading: false
      });
    } catch (error) {
      console.error('Fetch routes failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  createRoute: async (data: Partial<Route>) => {
    set({ isLoading: true });
    try {
      // Mock API call
      // In production: POST /api/method/afyaiq.api.routes.create_route
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newRoute: Route = {
        id: String(Date.now()),
        route_path: data.route_path || '',
        route_type: data.route_type || 'standard',
        created_by: data.created_by || { name: 'Unknown', is_admin: false },
        status: 'Draft',
        security: data.security || {
          authentication_required: true,
          rate_limit: { requests_per_minute: 100 },
          cors_enabled: false,
          ip_whitelist: []
        },
        requests_24h: 0,
        avg_response_time: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data
      };

      set(state => ({
        routes: [...state.routes, newRoute],
        isLoading: false
      }));
    } catch (error) {
      console.error('Create route failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateRoute: async (id: string, data: Partial<Route>) => {
    set({ isLoading: true });
    try {
      // Mock API call
      // In production: PUT /api/method/afyaiq.api.routes.update_route
      await new Promise(resolve => setTimeout(resolve, 800));

      set(state => ({
        routes: state.routes.map(route =>
          route.id === id
            ? { ...route, ...data, updated_at: new Date().toISOString() }
            : route
        ),
        selectedRoute:
          state.selectedRoute?.id === id
            ? { ...state.selectedRoute, ...data }
            : state.selectedRoute,
        isLoading: false
      }));
    } catch (error) {
      console.error('Update route failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  deleteRoute: async (id: string) => {
    set({ isLoading: true });
    try {
      // Mock API call
      // In production: DELETE /api/method/afyaiq.api.routes.delete_route
      await new Promise(resolve => setTimeout(resolve, 500));

      set(state => ({
        routes: state.routes.filter(route => route.id !== id),
        selectedRoute: state.selectedRoute?.id === id ? null : state.selectedRoute,
        isLoading: false
      }));
    } catch (error) {
      console.error('Delete route failed:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  setFilter: (key: keyof RouteFilters, value: string) => {
    set(state => ({
      filters: { ...state.filters, [key]: value }
    }));
  },

  selectRoute: (id: string | null) => {
    const { routes } = get();
    const route = id ? routes.find(r => r.id === id) || null : null;
    set({ selectedRoute: route });
  },

  getFilteredRoutes: () => {
    const { routes, filters } = get();

    return routes.filter(route => {
      const matchesType = filters.type === 'all' || route.route_type === filters.type;
      const matchesStatus = filters.status === 'all' || route.status === filters.status;
      const matchesSearch =
        !filters.search ||
        route.route_path.toLowerCase().includes(filters.search.toLowerCase()) ||
        route.created_by.name.toLowerCase().includes(filters.search.toLowerCase());

      return matchesType && matchesStatus && matchesSearch;
    });
  }
}));
