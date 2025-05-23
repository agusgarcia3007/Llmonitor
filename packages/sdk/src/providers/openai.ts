import OpenAI from "openai";
import { LLMonitorClient } from "../client";
import { ProviderOptions, LLMEvent } from "../types";

type OpenAIClient = OpenAI;
type ChatCompletionParams = OpenAI.Chat.Completions.ChatCompletionCreateParams;
type ChatCompletion = OpenAI.Chat.Completions.ChatCompletion;
type ChatCompletionMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

function safeNumber(value: number | null | undefined): number | undefined {
  return value === null ? undefined : value;
}

export class OpenAIWrapper {
  private client: OpenAIClient;
  private monitor: LLMonitorClient;

  constructor(client: OpenAIClient, monitor: LLMonitorClient) {
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
              provider: "openai",
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
            throw new Error("No response received from OpenAI");
          }

          return response;
        },
      },
    };
  }

  private formatMessages(messages: ChatCompletionMessage[]): string {
    return messages
      .map((msg) => {
        if (typeof msg.content === "string") {
          return `${msg.role}: ${msg.content}`;
        } else if (Array.isArray(msg.content)) {
          const textContent = msg.content
            .filter((part) => part.type === "text")
            .map((part) => (part as any).text)
            .join(" ");
          return `${msg.role}: ${textContent}`;
        }
        return `${msg.role}: [complex content]`;
      })
      .join("\n");
  }

  private calculateCost(
    model: string,
    usage?: OpenAI.Completions.CompletionUsage
  ): number | undefined {
    const promptTokens = safeNumber(usage?.prompt_tokens);
    const completionTokens = safeNumber(usage?.completion_tokens);

    if (!promptTokens || !completionTokens) {
      return undefined;
    }

    const pricing: Record<string, { input: number; output: number }> = {
      "gpt-4": { input: 0.03, output: 0.06 },
      "gpt-4-turbo": { input: 0.01, output: 0.03 },
      "gpt-3.5-turbo": { input: 0.001, output: 0.002 },
      "gpt-4o": { input: 0.005, output: 0.015 },
      "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
    };

    const modelKey = this.normalizeModelName(model);
    const modelPricing = pricing[modelKey];

    if (!modelPricing) {
      return undefined;
    }

    const inputCost = (promptTokens / 1000) * modelPricing.input;
    const outputCost = (completionTokens / 1000) * modelPricing.output;

    return Number((inputCost + outputCost).toFixed(6));
  }

  private normalizeModelName(model: string): string {
    if (model.startsWith("gpt-4o-mini")) return "gpt-4o-mini";
    if (model.startsWith("gpt-4o")) return "gpt-4o";
    if (model.startsWith("gpt-4-turbo")) return "gpt-4-turbo";
    if (model.startsWith("gpt-4")) return "gpt-4";
    if (model.startsWith("gpt-3.5-turbo")) return "gpt-3.5-turbo";
    return model;
  }
}
