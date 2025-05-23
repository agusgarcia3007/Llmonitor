import { LLMonitorClient } from "../client";
import { ProviderOptions, LLMEvent } from "../types";

interface CohereMessage {
  role: "USER" | "CHATBOT" | "SYSTEM";
  message: string;
}

interface CohereChatRequest {
  model?: string;
  message: string;
  conversation_id?: string;
  chat_history?: CohereMessage[];
  temperature?: number;
  max_tokens?: number;
  p?: number;
  k?: number;
  preamble?: string;
  prompt_truncation?: string;
  frequency_penalty?: number;
  presence_penalty?: number;
  end_sequences?: string[];
  stop_sequences?: string[];
  stream?: boolean;
}

interface CohereChatResponse {
  text: string;
  meta?: {
    tokens?: {
      input_tokens?: number;
      output_tokens?: number;
    };
  };
  generation_id?: string;
}

interface CohereGenerateRequest {
  model?: string;
  prompt: string;
  temperature?: number;
  max_tokens?: number;
  p?: number;
  k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  end_sequences?: string[];
  stop_sequences?: string[];
  return_likelihoods?: string;
  logit_bias?: Record<string, number>;
  truncate?: string;
}

interface CohereGenerateResponse {
  generations: Array<{
    text: string;
    likelihood?: number;
  }>;
  meta?: {
    tokens?: {
      input_tokens?: number;
      output_tokens?: number;
    };
  };
}

interface CohereClientInterface {
  chat: (request: CohereChatRequest) => Promise<CohereChatResponse>;
  generate: (request: CohereGenerateRequest) => Promise<CohereGenerateResponse>;
}

type CohereClient = CohereClientInterface;
type ChatRequest = CohereChatRequest;
type ChatResponse = CohereChatResponse;
type GenerateRequest = CohereGenerateRequest;
type GenerateResponse = CohereGenerateResponse;

function safeNumber(value: number | null | undefined): number | undefined {
  return value === null ? undefined : value;
}

export class CohereWrapper {
  private client: CohereClient;
  private monitor: LLMonitorClient;

  constructor(client: CohereClient, monitor: LLMonitorClient) {
    this.client = client;
    this.monitor = monitor;
  }

  async generate(
    params: {
      prompt: string;
      model?: string;
      max_tokens?: number;
      temperature?: number;
      p?: number;
      k?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      end_sequences?: string[];
      stop_sequences?: string[];
      return_likelihoods?: string;
      logit_bias?: Record<string, number>;
      truncate?: string;
    },
    options?: ProviderOptions
  ): Promise<any> {
    const startTime = Date.now();
    let status = 200;
    let response: any;
    let error: Error | null = null;

    try {
      const result = await this.client.generate({
        prompt: params.prompt,
        model: params.model || "command",
        max_tokens: params.max_tokens,
        temperature: params.temperature,
        p: params.p,
        k: params.k,
        frequency_penalty: params.frequency_penalty,
        presence_penalty: params.presence_penalty,
        end_sequences: params.end_sequences,
        stop_sequences: params.stop_sequences,
        return_likelihoods: params.return_likelihoods as any,
        logit_bias: params.logit_bias,
        truncate: params.truncate as any,
      });
      response = result;
    } catch (err) {
      error = err as Error;
      status = 500;
    } finally {
      const endTime = Date.now();
      const latency = endTime - startTime;

      const completion = response?.generations?.[0]?.text || "";
      const usage = response?.meta?.billed_units;

      const event: LLMEvent = {
        provider: "cohere",
        model: params.model || "command",
        temperature: safeNumber(params.temperature),
        max_tokens: safeNumber(params.max_tokens),
        prompt: params.prompt,
        prompt_tokens: safeNumber(usage?.input_tokens),
        completion,
        completion_tokens: safeNumber(usage?.output_tokens),
        latency_ms: latency,
        status,
        cost_usd: this.calculateCost(params.model || "command", usage),
        session_id: options?.sessionId,
        request_id: options?.requestId,
        version_tag: options?.versionTag,
        metadata: {
          ...options?.metadata,
          error: error?.message,
          finish_reason: response?.generations?.[0]?.finish_reason,
          likelihood: response?.generations?.[0]?.likelihood,
        },
      };

      try {
        await this.monitor.logEvent(event);
      } catch (monitorError) {
        console.warn("[LLMonitor] Failed to log event:", monitorError);
      }
    }

    if (error) {
      throw error;
    }

    return response;
  }

  async chat(
    params: {
      message: string;
      model?: string;
      conversation_id?: string;
      chat_history?: Array<{ role: string; message: string }>;
      temperature?: number;
      max_tokens?: number;
      p?: number;
      k?: number;
      preamble?: string;
      prompt_truncation?: string;
      frequency_penalty?: number;
      presence_penalty?: number;
      end_sequences?: string[];
      stop_sequences?: string[];
    },
    options?: ProviderOptions
  ): Promise<any> {
    const startTime = Date.now();
    let status = 200;
    let response: any;
    let error: Error | null = null;

    try {
      const result = await this.client.chat({
        message: params.message,
        model: params.model,
        conversation_id: params.conversation_id,
        chat_history: params.chat_history as any,
        temperature: params.temperature,
        max_tokens: params.max_tokens,
        p: params.p,
        k: params.k,
        preamble: params.preamble,
        prompt_truncation: params.prompt_truncation as any,
        frequency_penalty: params.frequency_penalty,
        presence_penalty: params.presence_penalty,
        end_sequences: params.end_sequences,
        stop_sequences: params.stop_sequences,
      });
      response = result;
    } catch (err) {
      error = err as Error;
      status = 500;
    } finally {
      const endTime = Date.now();
      const latency = endTime - startTime;

      const prompt = this.formatChatHistory(
        params.chat_history || [],
        params.message
      );
      const completion = response?.text || "";
      const usage = response?.meta?.billed_units;

      const event: LLMEvent = {
        provider: "cohere",
        model: params.model || "command",
        temperature: safeNumber(params.temperature),
        max_tokens: safeNumber(params.max_tokens),
        prompt,
        prompt_tokens: safeNumber(usage?.input_tokens),
        completion,
        completion_tokens: safeNumber(usage?.output_tokens),
        latency_ms: latency,
        status,
        cost_usd: this.calculateCost(params.model || "command", usage),
        session_id: options?.sessionId,
        request_id: options?.requestId,
        version_tag: options?.versionTag,
        metadata: {
          ...options?.metadata,
          error: error?.message,
          conversation_id: params.conversation_id,
          finish_reason: response?.finish_reason,
        },
      };

      try {
        await this.monitor.logEvent(event);
      } catch (monitorError) {
        console.warn("[LLMonitor] Failed to log event:", monitorError);
      }
    }

    if (error) {
      throw error;
    }

    return response;
  }

  private formatChatHistory(
    chatHistory: Array<{ role: string; message: string }>,
    currentMessage: string
  ): string {
    const messages = [
      ...chatHistory,
      { role: "user", message: currentMessage },
    ];
    return messages.map((msg) => `${msg.role}: ${msg.message}`).join("\n");
  }

  private calculateCost(
    model: string,
    usage?: { input_tokens?: number; output_tokens?: number }
  ): number | undefined {
    const inputTokens = safeNumber(usage?.input_tokens);
    const outputTokens = safeNumber(usage?.output_tokens);

    if (!inputTokens || !outputTokens) {
      return undefined;
    }

    const pricing: Record<string, { input: number; output: number }> = {
      command: { input: 0.015, output: 0.015 },
      "command-light": { input: 0.003, output: 0.006 },
      "command-nightly": { input: 0.015, output: 0.015 },
      "command-r": { input: 0.0005, output: 0.0015 },
      "command-r-plus": { input: 0.003, output: 0.015 },
    };

    const modelKey = this.normalizeModelName(model);
    const modelPricing = pricing[modelKey];

    if (!modelPricing) {
      return undefined;
    }

    const inputCost = (inputTokens / 1000000) * modelPricing.input;
    const outputCost = (outputTokens / 1000000) * modelPricing.output;

    return Number((inputCost + outputCost).toFixed(6));
  }

  private normalizeModelName(model: string): string {
    if (model.includes("command-r-plus")) return "command-r-plus";
    if (model.includes("command-r")) return "command-r";
    if (model.includes("command-light")) return "command-light";
    if (model.includes("command-nightly")) return "command-nightly";
    if (model.includes("command")) return "command";
    return model;
  }
}
