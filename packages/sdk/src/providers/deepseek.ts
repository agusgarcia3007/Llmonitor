import { LLMonitorClient } from "../client";
import { ProviderOptions, LLMEvent } from "../types";

interface DeepSeekChatCompletionParams {
  model: string;
  messages: Array<{
    role: string;
    content: string | Array<{ type: string; text?: string }>;
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface DeepSeekChatCompletion {
  choices: Array<{ message: { content: string }; finish_reason?: string }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
}

interface DeepSeekClient {
  chat: {
    completions: {
      create: (
        params: DeepSeekChatCompletionParams
      ) => Promise<DeepSeekChatCompletion>;
    };
  };
}

type ChatCompletionParams = DeepSeekChatCompletionParams;
type ChatCompletion = DeepSeekChatCompletion;

declare function safeNumber(
  value: number | null | undefined
): number | undefined;

export class DeepSeekWrapper {
  private client: DeepSeekClient;
  private monitor: LLMonitorClient;

  constructor(client: DeepSeekClient, monitor: LLMonitorClient) {
    this.client = client;
    this.monitor = monitor;
  }

  get chat() {
    return {
      completions: {
        create: async (
          params: ChatCompletionParams,
          options?: ProviderOptions
        ): Promise<ChatCompletion> => {
          const startTime = Date.now();
          let status = 200;
          let response: ChatCompletion | undefined;
          let error: Error | null = null;

          try {
            const result = await this.client.chat.completions.create(params);
            if ("choices" in result && !("controller" in result)) {
              response = result as ChatCompletion;
            } else {
              throw new Error(
                "Streaming responses are not supported by LLMonitor wrapper"
              );
            }
          } catch (err) {
            error = err as Error;
            status = 500;
          } finally {
            const endTime = Date.now();
            const latency = endTime - startTime;

            const prompt = this.formatMessages(params.messages);
            const completion = response?.choices?.[0]?.message?.content || "";
            const usage = response?.usage;

            const event: LLMEvent = {
              provider: "deepseek",
              model: params.model,
              temperature: safeNumber(params.temperature),
              max_tokens: safeNumber(params.max_tokens),
              prompt,
              prompt_tokens: safeNumber(usage?.prompt_tokens),
              completion,
              completion_tokens: safeNumber(usage?.completion_tokens),
              latency_ms: latency,
              status,
              cost_usd: this.calculateCost(params.model, usage),
              session_id: options?.sessionId,
              request_id: options?.requestId,
              version_tag: options?.versionTag,
              metadata: {
                ...options?.metadata,
                error: error?.message,
                finish_reason: response?.choices?.[0]?.finish_reason,
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
            throw new Error("No response received from DeepSeek");
          }

          return response;
        },
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
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  ): number | undefined {
    const promptTokens = safeNumber(usage?.prompt_tokens);
    const completionTokens = safeNumber(usage?.completion_tokens);

    if (!promptTokens || !completionTokens) {
      return undefined;
    }

    const pricing: Record<string, { input: number; output: number }> = {
      "deepseek-chat": { input: 0.07, output: 1.1 },
      "deepseek-reasoner": { input: 0.14, output: 2.19 },
    };

    const modelKey = model;
    const modelPricing = pricing[modelKey];

    if (!modelPricing) {
      return undefined;
    }

    const inputCost = (promptTokens / 1000) * modelPricing.input;
    const outputCost = (completionTokens / 1000) * modelPricing.output;

    return Number((inputCost + outputCost).toFixed(6));
  }
}
