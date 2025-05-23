import { LLMonitorClient } from "../client";
import { ProviderOptions, LLMEvent } from "../types";

interface AnthropicMessage {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: string; text?: string }>;
}

interface AnthropicMessageCreateParams {
  model: string;
  messages: AnthropicMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  stop_reason?: string;
}

interface AnthropicClient {
  messages: {
    create: (
      params: AnthropicMessageCreateParams
    ) => Promise<AnthropicResponse>;
  };
}

type MessageCreateParams = AnthropicMessageCreateParams;
type Message = AnthropicResponse;

function safeNumber(value: number | null | undefined): number | undefined {
  return value === null ? undefined : value;
}

export class AnthropicWrapper {
  private client: AnthropicClient;
  private monitor: LLMonitorClient;

  constructor(client: AnthropicClient, monitor: LLMonitorClient) {
    this.client = client;
    this.monitor = monitor;
  }

  get messages() {
    return {
      create: async (
        params: MessageCreateParams,
        options?: ProviderOptions
      ): Promise<Message> => {
        const startTime = Date.now();
        let status = 200;
        let response: Message | undefined;
        let error: Error | null = null;

        try {
          const result = await this.client.messages.create(params);
          response = result as Message;
        } catch (err) {
          error = err as Error;
          status = 500;
        } finally {
          const endTime = Date.now();
          const latency = endTime - startTime;

          const prompt = this.formatMessages(params.messages);
          const completion =
            response?.content?.[0]?.type === "text"
              ? response.content[0].text
              : "";
          const usage = response?.usage;

          const event: LLMEvent = {
            provider: "anthropic",
            model: params.model,
            temperature: safeNumber(params.temperature),
            max_tokens: safeNumber(params.max_tokens),
            prompt,
            prompt_tokens: safeNumber(usage?.input_tokens),
            completion,
            completion_tokens: safeNumber(usage?.output_tokens),
            latency_ms: latency,
            status,
            cost_usd: this.calculateCost(params.model, usage),
            session_id: options?.sessionId,
            request_id: options?.requestId,
            version_tag: options?.versionTag,
            metadata: {
              ...options?.metadata,
              error: error?.message,
              stop_reason: response?.stop_reason,
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

        if (!response) {
          throw new Error("No response received from Anthropic");
        }

        return response;
      },
    };
  }

  private formatMessages(messages: any[]): string {
    return messages
      .map((msg) => {
        if (typeof msg.content === "string") {
          return `${msg.role}: ${msg.content}`;
        } else if (Array.isArray(msg.content)) {
          const textContent = msg.content
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join(" ");
          return `${msg.role}: ${textContent}`;
        }
        return `${msg.role}: [complex content]`;
      })
      .join("\n");
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
      "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
      "claude-3-sonnet-20240229": { input: 0.003, output: 0.015 },
      "claude-3-haiku-20240307": { input: 0.00025, output: 0.00125 },
      "claude-3-5-sonnet-20241022": { input: 0.003, output: 0.015 },
    };

    const modelPricing = pricing[model];

    if (!modelPricing) {
      return undefined;
    }

    const inputCost = (inputTokens / 1000000) * modelPricing.input;
    const outputCost = (outputTokens / 1000000) * modelPricing.output;

    return Number((inputCost + outputCost).toFixed(6));
  }
}
