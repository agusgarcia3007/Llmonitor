CREATE TABLE "alert_config" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"metric" text NOT NULL,
	"threshold_value" real NOT NULL,
	"threshold_operator" text NOT NULL,
	"time_window" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notification_channels" json NOT NULL,
	"filters" json,
	"created_by" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_trigger" (
	"id" text PRIMARY KEY NOT NULL,
	"alert_config_id" text NOT NULL,
	"triggered_at" timestamp NOT NULL,
	"metric_value" real NOT NULL,
	"context" json,
	"status" text DEFAULT 'triggered' NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "webhook_config" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"secret" text,
	"headers" json,
	"is_active" boolean DEFAULT true NOT NULL,
	"events" json NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"webhook_config_id" text NOT NULL,
	"alert_trigger_id" text,
	"event_type" text NOT NULL,
	"payload" json NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp,
	"response_status" integer,
	"response_body" text,
	"error_message" text,
	"delivered_at" timestamp,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_config" ADD CONSTRAINT "alert_config_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_config" ADD CONSTRAINT "alert_config_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_trigger" ADD CONSTRAINT "alert_trigger_alert_config_id_alert_config_id_fk" FOREIGN KEY ("alert_config_id") REFERENCES "public"."alert_config"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_config" ADD CONSTRAINT "webhook_config_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_webhook_config_id_webhook_config_id_fk" FOREIGN KEY ("webhook_config_id") REFERENCES "public"."webhook_config"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_alert_trigger_id_alert_trigger_id_fk" FOREIGN KEY ("alert_trigger_id") REFERENCES "public"."alert_trigger"("id") ON DELETE no action ON UPDATE no action;