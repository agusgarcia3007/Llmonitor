import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  serial,
  uuid,
  real,
  json,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  lastActiveOrganizationId: text("last_active_organization_id"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const llm_event = pgTable("llm_event", {
  id: serial("id").primaryKey(),
  organization_id: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  session_id: text("session_id"),
  request_id: text("request_id"),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  temperature: real("temperature"),
  max_tokens: integer("max_tokens"),
  prompt: text("prompt").notNull(),
  prompt_tokens: integer("prompt_tokens"),
  completion: text("completion").notNull(),
  completion_tokens: integer("completion_tokens"),
  latency_ms: integer("latency_ms"),
  status: integer("status"),
  cost_usd: real("cost_usd"),
  score: integer("score"),
  version_tag: text("version_tag"),
  metadata: json("metadata"),
  created_at: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updated_at: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const alert_config = pgTable("alert_config", {
  id: text("id").primaryKey(),
  organization_id: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  metric: text("metric").notNull(),
  threshold_value: real("threshold_value").notNull(),
  threshold_operator: text("threshold_operator").notNull(),
  time_window: integer("time_window").notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  notification_channels: json("notification_channels").notNull(),
  filters: json("filters"),
  created_by: text("created_by")
    .notNull()
    .references(() => user.id),
  created_at: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updated_at: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const alert_trigger = pgTable("alert_trigger", {
  id: text("id").primaryKey(),
  alert_config_id: text("alert_config_id")
    .notNull()
    .references(() => alert_config.id, { onDelete: "cascade" }),
  triggered_at: timestamp("triggered_at")
    .$defaultFn(() => new Date())
    .notNull(),
  metric_value: real("metric_value").notNull(),
  context: json("context"),
  status: text("status").default("triggered").notNull(),
  resolved_at: timestamp("resolved_at"),
});

export const webhook_config = pgTable("webhook_config", {
  id: text("id").primaryKey(),
  organization_id: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  secret: text("secret"),
  headers: json("headers"),
  is_active: boolean("is_active").default(true).notNull(),
  events: json("events").notNull(),
  created_at: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updated_at: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const webhook_delivery = pgTable("webhook_delivery", {
  id: text("id").primaryKey(),
  webhook_config_id: text("webhook_config_id")
    .notNull()
    .references(() => webhook_config.id, { onDelete: "cascade" }),
  alert_trigger_id: text("alert_trigger_id").references(() => alert_trigger.id),
  event_type: text("event_type").notNull(),
  payload: json("payload").notNull(),
  status: text("status").default("pending").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  last_attempt_at: timestamp("last_attempt_at"),
  response_status: integer("response_status"),
  response_body: text("response_body"),
  error_message: text("error_message"),
  delivered_at: timestamp("delivered_at"),
  created_at: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const apikey = pgTable("apikey", {
  id: text("id").primaryKey(),
  name: text("name"),
  start: text("start"),
  prefix: text("prefix"),
  key: text("key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  refillInterval: integer("refill_interval"),
  refillAmount: integer("refill_amount"),
  lastRefillAt: timestamp("last_refill_at"),
  enabled: boolean("enabled").default(true),
  rateLimitEnabled: boolean("rate_limit_enabled").default(true),
  rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
  rateLimitMax: integer("rate_limit_max").default(10),
  requestCount: integer("request_count"),
  remaining: integer("remaining"),
  lastRequest: timestamp("last_request"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  permissions: text("permissions"),
  metadata: text("metadata"),
});
