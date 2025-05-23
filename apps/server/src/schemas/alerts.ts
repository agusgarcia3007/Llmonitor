import { z } from "zod";

export const createAlertSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(["threshold", "anomaly", "budget"]),
  metric: z.enum([
    "cost_per_hour",
    "cost_per_day",
    "cost_per_week",
    "cost_per_month",
    "requests_per_minute",
    "requests_per_hour",
    "error_rate",
    "latency_p95",
    "latency_p99",
    "token_usage_per_hour",
    "token_usage_per_day",
  ]),
  threshold_value: z.number().positive(),
  threshold_operator: z.enum(["gt", "lt", "gte", "lte", "eq", "ne"]),
  time_window: z.number().int().min(1).max(10080),
  notification_channels: z.array(
    z.object({
      type: z.enum(["email", "webhook", "slack"]),
      target: z.string(),
      config: z.record(z.unknown()).optional(),
    })
  ),
  filters: z
    .object({
      provider: z.array(z.string()).optional(),
      model: z.array(z.string()).optional(),
      version_tag: z.array(z.string()).optional(),
      session_id: z.array(z.string()).optional(),
    })
    .optional(),
});

export const updateAlertSchema = createAlertSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  secret: z.string().optional(),
  headers: z.record(z.string()).optional(),
  events: z.array(z.string()).min(1),
});

export const updateWebhookSchema = createWebhookSchema.partial().extend({
  is_active: z.boolean().optional(),
});
