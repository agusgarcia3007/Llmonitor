export interface LLMEvent {
  provider: string;
  model: string;
  temperature?: number;
  max_tokens?: number;
  prompt: string;
  prompt_tokens?: number;
  completion: string;
  completion_tokens?: number;
  latency_ms?: number;
  status: number;
  cost_usd?: number;
  score?: number;
  version_tag?: string;
  session_id?: string;
  request_id?: string;
  metadata?: any;
  projectId?: string;
}

export interface EmbeddingEvent {
  provider: string;
  model: string;
  input: string;
  input_tokens?: number;
  embedding_dimensions?: number;
  latency_ms?: number;
  status: number;
  cost_usd?: number;
  version_tag?: string;
  session_id?: string;
  request_id?: string;
  metadata?: any;
  projectId?: string;
}

export interface LLMonitorConfig {
  apiKey: string;
  baseURL?: string;
  debug?: boolean;
  enabled?: boolean;
  sessionId?: string;
  versionTag?: string;
  metadata?: Record<string, any>;
  projectId?: string;
}

export interface ProviderOptions {
  sessionId?: string;
  versionTag?: string;
  metadata?: Record<string, any>;
  requestId?: string;
}

export type LLMProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "cohere"
  | "custom"
  | "deepseek";

export interface TokenUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface LLMResponse {
  content: string;
  usage?: TokenUsage;
  model?: string;
  finishReason?: string;
}
