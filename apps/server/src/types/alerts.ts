export interface AlertMetrics {
  COST_PER_HOUR: "cost_per_hour";
  COST_PER_DAY: "cost_per_day";
  COST_PER_WEEK: "cost_per_week";
  COST_PER_MONTH: "cost_per_month";
  REQUESTS_PER_MINUTE: "requests_per_minute";
  REQUESTS_PER_HOUR: "requests_per_hour";
  ERROR_RATE: "error_rate";
  LATENCY_P95: "latency_p95";
  LATENCY_P99: "latency_p99";
  TOKEN_USAGE_PER_HOUR: "token_usage_per_hour";
  TOKEN_USAGE_PER_DAY: "token_usage_per_day";
}

export interface ThresholdOperators {
  GREATER_THAN: "gt";
  LESS_THAN: "lt";
  GREATER_THAN_OR_EQUAL: "gte";
  LESS_THAN_OR_EQUAL: "lte";
  EQUAL: "eq";
  NOT_EQUAL: "ne";
}

export interface AlertTypes {
  THRESHOLD: "threshold";
  ANOMALY: "anomaly";
  BUDGET: "budget";
}

export interface NotificationChannel {
  type: "email" | "webhook" | "slack";
  target: string;
  config?: Record<string, any>;
}

export interface AlertFilters {
  provider?: string[];
  model?: string[];
  version_tag?: string[];
  session_id?: string[];
}

export interface AlertConfigCreate {
  name: string;
  description?: string;
  type: keyof AlertTypes;
  metric: keyof AlertMetrics;
  threshold_value: number;
  threshold_operator: keyof ThresholdOperators;
  time_window: number;
  notification_channels: NotificationChannel[];
  filters?: AlertFilters;
}

export interface AlertConfigUpdate extends Partial<AlertConfigCreate> {
  is_active?: boolean;
}

export interface AlertTriggerContext {
  metric_value: number;
  threshold_value: number;
  time_window: number;
  filters_applied?: AlertFilters;
  samples_count?: number;
  query_data?: Record<string, any>;
}

export interface WebhookConfigCreate {
  name: string;
  url: string;
  secret?: string;
  headers?: Record<string, string>;
  events: string[];
}

export interface WebhookConfigUpdate extends Partial<WebhookConfigCreate> {
  is_active?: boolean;
}

export interface WebhookPayload {
  event_type: string;
  timestamp: string;
  organization_id: string;
  alert?: {
    id: string;
    name: string;
    metric: string;
    threshold_value: number;
    actual_value: number;
    trigger_id: string;
  };
  context?: Record<string, any>;
}

export interface AlertEvaluationResult {
  alert_config_id: string;
  is_triggered: boolean;
  metric_value: number;
  context: AlertTriggerContext;
}
