import { z } from "zod";

const BaseLlmEventSchema = z.object({
  provider: z.string(),
  model: z.string(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  latency_ms: z.number().optional(),
  status: z.number(),
  cost_usd: z.number().optional(),
  score: z.number().optional(),
  version_tag: z.string().optional(),
  session_id: z.string().optional(),
  request_id: z.string().optional(),
  metadata: z
    .record(z.string(), z.unknown())
    .and(z.object({ apiKey: z.string().optional() }))
    .optional(),
});

const ChatEventSchema = BaseLlmEventSchema.extend({
  prompt: z.string(),
  prompt_tokens: z.number().optional(),
  completion: z.string(),
  completion_tokens: z.number().optional(),
});

const EmbeddingEventSchema = BaseLlmEventSchema.extend({
  input: z.string(),
  input_tokens: z.number().optional(),
  embedding_dimensions: z.number().optional(),
});

export const LogLlmEventSchema = z.union([
  ChatEventSchema,
  EmbeddingEventSchema,
]);

export type LogLlmEvent = z.infer<typeof LogLlmEventSchema>;
