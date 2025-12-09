import { create } from 'zustand';
import type { APISIXInstance, EnvironmentType } from '../types/apisix';

interface InstanceState {
  instances: APISIXInstance[];
  selectedInstance: APISIXInstance | null;
  currentEnvironment: EnvironmentType;
  loading: boolean;
  error: string | null;

  // Actions
  fetchInstances: () => Promise<void>;
  createInstance: (data: Partial<APISIXInstance>) => Promise<void>;
  updateInstance: (id: string, data: Partial<APISIXInstance>) => Promise<void>;
  deleteInstance: (id: string) => Promise<void>;
  selectInstance: (id: string | null) => void;
  switchEnvironment: (env: EnvironmentType) => void;
  checkInstanceHealth: (id: string) => Promise<void>;
}

// Mock instances for development
const MOCK_INSTANCES: APISIXInstance[] = [
  {
    id: 'inst-uat-001',
    name: 'AfyaIQ UAT Gateway',
    environment: 'uat',
    admin_api_url: 'https://uat-gateway.afyaiq.internal:9180/apisix/admin',
    admin_api_key: 'uat_admin_key_***************',
    gateway_url: 'https://uat-api.afyaiq.com',
    status: 'active',
    health_status: {
      last_check: new Date().toISOString(),
      response_time: 45,
      routes_count: 12,
      plugins_count: 8,
    },
    created_at: '2025-01-10T10:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inst-prod-001',
    name: 'AfyaIQ Production Gateway',
    environment: 'production',
    admin_api_url: 'https://gateway.afyaiq.internal:9180/apisix/admin',
    admin_api_key: 'prod_admin_key_***************',
    gateway_url: 'https://api.afyaiq.com',
    status: 'active',
    health_status: {
      last_check: new Date().toISOString(),
      response_time: 32,
      routes_count: 28,
      plugins_count: 12,
    },
    created_at: '2025-01-05T08:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: 'inst-dev-001',
    name: 'Local Development Gateway',
    environment: 'development',
    admin_api_url: 'http://localhost:9180/apisix/admin',
    admin_api_key: 'dev_admin_key_***************',
    gateway_url: 'http://localhost:9080',
    status: 'active',
    health_status: {
      last_check: new Date().toISOString(),
      response_time: 12,
      routes_count: 5,
      plugins_count: 4,
    },
    created_at: '2025-01-25T14:30:00Z',
    updated_at: new Date().toISOString(),
  },
];

export const useInstanceStore = create<InstanceState>((set, get) => ({
  instances: [],
  selectedInstance: null,
  currentEnvironment: 'uat',
  loading: false,
  error: null,

  fetchInstances: async () => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // TODO: Replace with real API call
      // const response = await apiClient.get('/api/method/afyaiq.api.instances.get_instances');
      // set({ instances: response.data, loading: false });

      set({ instances: MOCK_INSTANCES, loading: false });

      // Auto-select first instance if none selected
      const { selectedInstance } = get();
      if (!selectedInstance && MOCK_INSTANCES.length > 0) {
        set({ selectedInstance: MOCK_INSTANCES[0] });
      }
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch instances',
        loading: false,
      });
    }
  },

  createInstance: async (data: Partial<APISIXInstance>) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newInstance: APISIXInstance = {
        id: `inst-${data.environment}-${Date.now()}`,
        name: data.name || 'New Instance',
        environment: data.environment || 'development',
        admin_api_url: data.admin_api_url || '',
        admin_api_key: data.admin_api_key || '',
        gateway_url: data.gateway_url || '',
        status: 'inactive',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // TODO: Replace with real API call
      // await apiClient.post('/api/method/afyaiq.api.instances.create_instance', newInstance);

      set((state) => ({
        instances: [...state.instances, newInstance],
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create instance',
        loading: false,
      });
    }
  },

  updateInstance: async (id: string, data: Partial<APISIXInstance>) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));

      // TODO: Replace with real API call
      // await apiClient.put(`/api/method/afyaiq.api.instances.update_instance`, { id, ...data });

      set((state) => ({
        instances: state.instances.map((inst) =>
          inst.id === id
            ? { ...inst, ...data, updated_at: new Date().toISOString() }
            : inst
        ),
        selectedInstance:
          state.selectedInstance?.id === id
            ? { ...state.selectedInstance, ...data, updated_at: new Date().toISOString() }
            : state.selectedInstance,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update instance',
        loading: false,
      });
    }
  },

  deleteInstance: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // TODO: Replace with real API call
      // await apiClient.delete(`/api/method/afyaiq.api.instances.delete_instance`, { params: { id } });

      set((state) => ({
        instances: state.instances.filter((inst) => inst.id !== id),
        selectedInstance: state.selectedInstance?.id === id ? null : state.selectedInstance,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete instance',
        loading: false,
      });
    }
  },

  selectInstance: (id: string | null) => {
    const { instances } = get();
    const instance = id ? instances.find((inst) => inst.id === id) || null : null;
    set({ selectedInstance: instance });
  },

  switchEnvironment: (env: EnvironmentType) => {
    set({ currentEnvironment: env });

    // Auto-select first instance of the new environment
    const { instances } = get();
    const envInstance = instances.find((inst) => inst.environment === env);
    if (envInstance) {
      set({ selectedInstance: envInstance });
    }
  },

  checkInstanceHealth: async (id: string) => {
    try {
      const startTime = Date.now();

      // Simulate health check API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // TODO: Replace with real health check API call
      // const response = await apiClient.get(`${instance.admin_api_url}/routes`);

      const responseTime = Date.now() - startTime;

      set((state) => ({
        instances: state.instances.map((inst) =>
          inst.id === id
            ? {
                ...inst,
                status: 'active',
                health_status: {
                  last_check: new Date().toISOString(),
                  response_time: responseTime,
                  routes_count: inst.health_status?.routes_count || 0,
                  plugins_count: inst.health_status?.plugins_count || 0,
                },
              }
            : inst
        ),
      }));
    } catch (error: any) {
      set((state) => ({
        instances: state.instances.map((inst) =>
          inst.id === id ? { ...inst, status: 'error' } : inst
        ),
      }));
    }
  },
}));
