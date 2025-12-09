// Route type icons and colors
export const ROUTE_TYPE_CONFIG = {
  standard: {
    icon: '⚡',
    color: '#2563eb',
    label: 'Standard API'
  },
  ai_model: {
    icon: '🤖',
    color: '#8b5cf6',
    label: 'AI Model'
  },
  static: {
    icon: '📁',
    color: '#10b981',
    label: 'Static Content'
  }
};

// HTTP method colors
export const HTTP_METHOD_COLORS: Record<string, string> = {
  GET: '#10b981',
  POST: '#2563eb',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  PATCH: '#8b5cf6',
  OPTIONS: '#6b7280',
  HEAD: '#6b7280'
};

// Status badge colors
export const STATUS_COLORS: Record<string, string> = {
  Draft: '#6b7280',
  Pending: '#f59e0b',
  Approved: '#10b981',
  Published: '#2563eb'
};

// AI Providers
export const AI_PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic API', icon: '🧠' },
  { value: 'openai', label: 'OpenAI', icon: '🤖' },
  { value: 'ollama', label: 'Ollama (Local)', icon: '🏠' },
  { value: 'local', label: 'Local Model', icon: '💻' }
];

// Common AI Models
export const AI_MODELS: Record<string, string[]> = {
  anthropic: [
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307'
  ],
  openai: [
    'gpt-4-turbo-preview',
    'gpt-4-vision-preview',
    'gpt-4',
    'gpt-3.5-turbo'
  ],
  ollama: [
    'llama3-medical',
    'llama2',
    'mixtral',
    'neural-chat'
  ],
  local: [
    'custom-medical-model-v1',
    'custom-diagnostic-model'
  ]
};

// Time ranges for logs
export const TIME_RANGES = [
  { value: 'last_hour', label: 'Last Hour' },
  { value: 'last_24h', label: 'Last 24 Hours' },
  { value: 'last_7d', label: 'Last 7 Days' },
  { value: 'last_30d', label: 'Last 30 Days' }
];

// Security policy templates
export const SECURITY_TEMPLATES = [
  {
    id: '1',
    name: 'Public API',
    description: 'Minimal security for public-facing APIs',
    config: {
      authentication_required: false,
      rate_limit: { requests_per_minute: 1000 },
      cors_enabled: true,
      ip_whitelist: []
    }
  },
  {
    id: '2',
    name: 'Internal API',
    description: 'Standard security for internal services',
    config: {
      authentication_required: true,
      rate_limit: { requests_per_minute: 500 },
      cors_enabled: false,
      ip_whitelist: ['10.0.0.0/8', '192.168.0.0/16']
    }
  },
  {
    id: '3',
    name: 'High Security',
    description: 'Maximum security for sensitive data',
    config: {
      authentication_required: true,
      rate_limit: { requests_per_minute: 100 },
      cors_enabled: false,
      ip_whitelist: ['10.0.1.0/24']
    }
  },
  {
    id: '4',
    name: 'AI Model Default',
    description: 'Optimized for AI model endpoints',
    config: {
      authentication_required: true,
      rate_limit: {
        requests_per_minute: 60,
        tokens_per_minute: 100000
      },
      cors_enabled: true,
      ip_whitelist: []
    }
  }
];
