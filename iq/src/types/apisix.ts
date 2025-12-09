/**
 * APISIX Types and Interfaces
 * Based on Apache APISIX Admin API and AI Gateway documentation
 */

// ============================================================================
// APISIX Instance Management
// ============================================================================

export type EnvironmentType = 'uat' | 'production' | 'development';

export interface APISIXInstance {
  id: string;
  name: string;
  environment: EnvironmentType;
  admin_api_url: string;
  admin_api_key: string;
  gateway_url: string;
  status: 'active' | 'inactive' | 'error';
  health_status?: {
    last_check: string;
    response_time: number;
    routes_count: number;
    plugins_count: number;
  };
  created_at: string;
  updated_at: string;
}

// ============================================================================
// APISIX Route Configuration
// ============================================================================

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
export type LoadBalancerType = 'roundrobin' | 'chash' | 'ewma' | 'least_conn';
export type HashOn = 'vars' | 'header' | 'cookie' | 'consumer';

export interface APISIXUpstream {
  type: LoadBalancerType;
  nodes: Record<string, number>; // hostname:port -> weight
  timeout?: {
    connect?: number;
    send?: number;
    read?: number;
  };
  retries?: number;
  retry_timeout?: number;
  scheme?: 'http' | 'https' | 'grpc' | 'grpcs' | 'tcp' | 'udp';
  hash_on?: HashOn;
  checks?: {
    active?: {
      http_path?: string;
      healthy?: {
        interval?: number;
        successes?: number;
      };
      unhealthy?: {
        interval?: number;
        http_failures?: number;
      };
    };
  };
}

export interface APISIXRoute {
  id?: string;
  uri?: string;
  uris?: string[];
  name?: string;
  desc?: string;
  methods?: HTTPMethod[];
  hosts?: string[];
  remote_addrs?: string[];
  priority?: number;
  upstream?: APISIXUpstream;
  upstream_id?: string;
  service_id?: string;
  plugins?: Record<string, any>;
  enable_websocket?: boolean;
  timeout?: {
    connect?: number;
    send?: number;
    read?: number;
  };
  status?: 1 | 0; // 1 = enabled, 0 = disabled
  labels?: Record<string, string>;
  // Custom fields for our app
  environment?: EnvironmentType;
  created_by?: string;
  is_ai_route?: boolean;
}

// ============================================================================
// AI Gateway - AI Proxy Plugin
// ============================================================================

export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'deepseek'
  | 'azure-openai'
  | 'aimlapi'
  | 'openai-compatible';

export interface AIAuth {
  type: 'header' | 'query';
  header?: {
    name: string;
    value: string;
  };
  query?: {
    name: string;
    value: string;
  };
}

export interface AIOptions {
  model: string;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  // OpenAI specific
  frequency_penalty?: number;
  presence_penalty?: number;
  // Additional parameters
  [key: string]: any;
}

export interface AIProxyPlugin {
  provider: AIProvider;
  auth: AIAuth;
  options: AIOptions;
  override?: {
    endpoint?: string; // For openai-compatible providers
  };
  logging?: {
    enable?: boolean;
    log_request?: boolean;
    log_response?: boolean;
  };
  timeout?: number;
  keepalive?: boolean;
  ssl_verify?: boolean;
}

// ============================================================================
// Common Plugins
// ============================================================================

export interface RateLimitPlugin {
  count: number;
  time_window: number;
  key_type?: 'var' | 'var_combination' | 'constant';
  key?: string;
  rejected_code?: number;
  rejected_msg?: string;
  policy?: 'local' | 'redis' | 'redis-cluster';
  allow_degradation?: boolean;
  show_limit_quota_header?: boolean;
}

export interface CORSPlugin {
  allow_origins?: string;
  allow_methods?: string;
  allow_headers?: string;
  expose_headers?: string;
  max_age?: number;
  allow_credential?: boolean;
}

export interface KeyAuthPlugin {
  key?: string;
  hide_credentials?: boolean;
  query?: string;
  header?: string;
}

export interface PrometheusPlugin {
  prefer_name?: boolean;
}

// ============================================================================
// Route Templates & Presets
// ============================================================================

export interface RouteTemplate {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'ai' | 'websocket' | 'grpc';
  icon: string;
  color: string;
  default_config: Partial<APISIXRoute>;
  required_fields: string[];
  recommended_plugins: string[];
}

// ============================================================================
// Route Deployment & Promotion
// ============================================================================

export interface RouteDeployment {
  id: string;
  route_id: string;
  route_name: string;
  source_environment: EnvironmentType;
  target_environment: EnvironmentType;
  status: 'pending' | 'testing' | 'approved' | 'deployed' | 'failed' | 'rolled_back';
  deployed_by: string;
  deployed_at?: string;
  test_results?: {
    total_tests: number;
    passed: number;
    failed: number;
    status_checks: Array<{
      test_name: string;
      status: 'pass' | 'fail';
      response_time?: number;
      error_message?: string;
    }>;
  };
  approval?: {
    required: boolean;
    approved_by?: string;
    approved_at?: string;
    comments?: string;
  };
  rollback_available: boolean;
  version: number;
}

// ============================================================================
// Route Testing
// ============================================================================

export interface RouteTestCase {
  id: string;
  name: string;
  route_id: string;
  method: HTTPMethod;
  path: string;
  headers?: Record<string, string>;
  body?: any;
  expected_status: number;
  expected_response?: any;
  assertions?: Array<{
    type: 'status' | 'header' | 'body' | 'response_time';
    operator: 'equals' | 'contains' | 'less_than' | 'greater_than' | 'matches';
    expected: any;
  }>;
}

export interface RouteTestResult {
  test_case_id: string;
  status: 'pass' | 'fail' | 'error';
  actual_status: number;
  response_time: number;
  response_body?: any;
  error_message?: string;
  assertions_results?: Array<{
    passed: boolean;
    message: string;
  }>;
  executed_at: string;
}

// ============================================================================
// AI-Specific Types
// ============================================================================

export interface AIModelConfig {
  provider: AIProvider;
  model_name: string;
  display_name: string;
  description?: string;
  capabilities: Array<'chat' | 'completion' | 'embedding' | 'vision' | 'function_calling'>;
  context_window: number;
  max_output_tokens: number;
  cost_per_1k_input_tokens: number;
  cost_per_1k_output_tokens: number;
  supports_streaming: boolean;
  supports_functions: boolean;
}

export interface AILoadBalancing {
  enabled: boolean;
  strategy: 'weighted' | 'latency' | 'cost' | 'round_robin';
  providers: Array<{
    provider: AIProvider;
    model: string;
    weight: number;
    priority: number;
    fallback_order: number;
  }>;
  health_check: {
    enabled: boolean;
    interval: number;
    timeout: number;
    unhealthy_threshold: number;
  };
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array';
    required: boolean;
    default?: any;
  }>;
  system_prompt?: string;
}

// ============================================================================
// Analytics & Monitoring
// ============================================================================

export interface RouteMetrics {
  route_id: string;
  environment: EnvironmentType;
  time_range: {
    start: string;
    end: string;
  };
  requests: {
    total: number;
    success: number;
    failed: number;
    error_rate: number;
  };
  performance: {
    avg_response_time: number;
    p50_response_time: number;
    p95_response_time: number;
    p99_response_time: number;
  };
  ai_metrics?: {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    estimated_cost: number;
    avg_tokens_per_request: number;
  };
  status_codes: Record<number, number>;
  top_errors: Array<{
    error_message: string;
    count: number;
  }>;
}

// All types are exported inline above
