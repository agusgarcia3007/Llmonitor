import { z } from "zod";

export const LogLlmEventSchema = z.object({
  provider: z.string(),
  model: z.string(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  prompt: z.string(),
  prompt_tokens: z.number().optional(),
  completion: z.string(),
  completion_tokens: z.number().optional(),
  latency_ms: z.number().optional(),
  status: z.number(),
  cost_usd: z.number().optional(),
  score: z.number().optional(),
  version_tag: z.string().optional(),
  session_id: z.string().optional(),
  request_id: z.string().optional(),
  metadata: z.any().optional(),
});
