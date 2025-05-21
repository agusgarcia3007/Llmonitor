CREATE TABLE "llm_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"session_id" text,
	"request_id" text,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"temperature" real,
	"max_tokens" integer,
	"prompt" text NOT NULL,
	"prompt_tokens" integer,
	"completion" text NOT NULL,
	"completion_tokens" integer,
	"latency_ms" integer,
	"status" integer,
	"cost_usd" real,
	"score" integer,
	"version_tag" text,
	"metadata" json,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "llm_event" ADD CONSTRAINT "llm_event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;