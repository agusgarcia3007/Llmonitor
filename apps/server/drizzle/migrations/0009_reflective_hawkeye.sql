ALTER TABLE "llm_event" ALTER COLUMN "prompt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "llm_event" ALTER COLUMN "completion" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "llm_event" ADD COLUMN "input" text;--> statement-breakpoint
ALTER TABLE "llm_event" ADD COLUMN "input_tokens" integer;--> statement-breakpoint
ALTER TABLE "llm_event" ADD COLUMN "embedding_dimensions" integer;