export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface LLMEvent {
  id: number;
  organization_id: string;
  session_id?: string;
  request_id?: string;
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
  metadata?: unknown;
  created_at: string;
  updated_at: string;
}

export interface GetEventsParams {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
  apiKey?: string;
  id?: string;
  model?: string;
  provider?: string | string[];
  status?: number;
  version_tag?: string;
  session_id?: string;
  latencyMin?: number;
  latencyMax?: number;
  costMin?: number;
  costMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

export type Locale = "en" | "es";

type Variant = "default" | "outline";

export interface Plan {
  slug: string;
  name: string;
  monthlyPrice: number | null;
  events: string;
  retention: string;
  extra: string;
  note: string;
  isPopular: boolean;
  ctaKey: string;
  variant: Variant;
}

export * from "./alerts";
export * from "./analytics";
