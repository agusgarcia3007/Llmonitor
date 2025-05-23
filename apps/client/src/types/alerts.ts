export type AlertMetric =
  | "cost_per_hour"
  | "cost_per_day"
  | "cost_per_week"
  | "cost_per_month"
  | "requests_per_minute"
  | "requests_per_hour"
  | "error_rate"
  | "latency_p95"
  | "latency_p99"
  | "token_usage_per_hour"
  | "token_usage_per_day";

export type ThresholdOperator = "gt" | "lt" | "gte" | "lte" | "eq" | "ne";

export type AlertType = "threshold" | "anomaly" | "budget";

export type NotificationChannelType = "email" | "webhook" | "slack";

export interface NotificationChannel {
  type: NotificationChannelType;
  target: string;
  config?: Record<string, unknown>;
}

export interface AlertFilters {
  provider?: string[];
  model?: string[];
  version_tag?: string[];
  session_id?: string[];
}

export interface AlertConfig {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: AlertType;
  metric: AlertMetric;
  threshold_value: number;
  threshold_operator: ThresholdOperator;
  time_window: number;
  is_active: boolean;
  notification_channels: NotificationChannel[];
  filters?: AlertFilters;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AlertTrigger {
  id: string;
  alert_config_id: string;
  triggered_at: string;
  metric_value: number;
  context: {
    metric_value: number;
    threshold_value: number;
    time_window: number;
    filters_applied?: AlertFilters;
    samples_count?: number;
    query_data?: Record<string, unknown>;
  };
  status: "triggered" | "resolved";
  resolved_at?: string;
}

export interface WebhookConfig {
  id: string;
  organization_id: string;
  name: string;
  url: string;
  secret?: string;
  headers?: Record<string, string>;
  is_active: boolean;
  events: string[];
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_config_id: string;
  alert_trigger_id?: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: "pending" | "delivered" | "failed";
  attempts: number;
  last_attempt_at?: string;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  delivered_at?: string;
  created_at: string;
}

export interface CreateAlertRequest {
  name: string;
  description?: string;
  type: AlertType;
  metric: AlertMetric;
  threshold_value: number;
  threshold_operator: ThresholdOperator;
  time_window: number;
  notification_channels: NotificationChannel[];
  filters?: AlertFilters;
}

export interface UpdateAlertRequest extends Partial<CreateAlertRequest> {
  is_active?: boolean;
}

export interface CreateWebhookRequest {
  name: string;
  url: string;
  secret?: string;
  headers?: Record<string, string>;
  events: string[];
}

export interface UpdateWebhookRequest extends Partial<CreateWebhookRequest> {
  is_active?: boolean;
}

export interface AlertEvaluationResult {
  alert_config_id: string;
  is_triggered: boolean;
  metric_value: number;
  context: {
    metric_value: number;
    threshold_value: number;
    time_window: number;
    filters_applied?: AlertFilters;
  };
}
