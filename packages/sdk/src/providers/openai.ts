import OpenAI from "openai";
import { LLMonitorClient } from "../client";
import { ProviderOptions, LLMEvent, EmbeddingEvent } from "../types";

type OpenAIClient = OpenAI;
type ChatCompletionParams = OpenAI.Chat.Completions.ChatCompletionCreateParams;
type ChatCompletion = OpenAI.Chat.Completions.ChatCompletion;
type ChatCompletionMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;
type ChatCompletionChunk = OpenAI.Chat.Completions.ChatCompletionChunk;
type EmbeddingCreateParams = OpenAI.Embeddings.EmbeddingCreateParams;
type CreateEmbeddingResponse = OpenAI.Embeddings.CreateEmbeddingResponse;

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
        ): Promise<any> => {
          // Debug logging for model validation
          console.log("[LLMonitor] Debug - Model received:", {
            model: params.model,
            modelType: typeof params.model,
            modelLength:
              typeof params.model === "string" ? params.model.length : 0,
            modelTrimmed:
              typeof params.model === "string" ? params.model.trim() : null,
            stream: params.stream,
          });

          // Validate model parameter
          if (
            !params.model ||
            typeof params.model !== "string" ||
            params.model.trim() === ""
          ) {
            console.error(
              "[LLMonitor] Error: Invalid model parameter:",
              params.model
            );
            throw new Error(
              `LLMonitor: Invalid model parameter. Received: ${params.model}`
            );
          }

          // Clean model parameter
          const cleanedParams = {
            ...params,
            model: params.model.trim(),
          };

          if (
            typeof cleanedParams.model === "string" &&
            (cleanedParams.model.startsWith("deepseek-chat") ||
              cleanedParams.model.startsWith("deepseek-reasoner"))
          ) {
            console.warn(
              "[LLMonitor] Warning: You are using a DeepSeek model with the OpenAI wrapper. For correct analytics and cost tracking, use monitor.deepseek(...) instead of monitor.openai(...)."
            );
          }

          if (cleanedParams.stream === true) {
            return this.handleStreamingCompletion(cleanedParams, options);
          } else {
            return this.handleNonStreamingCompletion(cleanedParams, options);
          }
        },
      },
    };
  }

  private async handleNonStreamingCompletion(
    params: ChatCompletionParams,
    options?: ProviderOptions
  ): Promise<ChatCompletion> {
    const startTime = Date.now();
    let status = 200;
    let response: ChatCompletion | undefined;
    let error: Error | null = null;

    try {
      const result = await this.client.chat.completions.create(params);
      response = result as ChatCompletion;
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

      this.monitor.logEvent(event).catch((monitorError) => {
        console.warn("[LLMonitor] Failed to log event:", monitorError);
      });
    }

    if (error) {
      throw error;
    }

    if (!response) {
      throw new Error("No response received from OpenAI");
    }

    return response;
  }

  private async handleStreamingCompletion(
    params: ChatCompletionParams,
    options?: ProviderOptions
  ): Promise<AsyncIterable<ChatCompletionChunk>> {
    const startTime = Date.now();
    let status = 200;
    let error: Error | null = null;
    let accumulatedContent = "";
    let finishReason = "";
    let usage: OpenAI.Completions.CompletionUsage | undefined;

    try {
      const stream = await this.client.chat.completions.create(params);

      const monitoredStream = async function* () {
        try {
          for await (const chunk of stream as AsyncIterable<ChatCompletionChunk>) {
            const content = chunk.choices?.[0]?.delta?.content || "";
            if (content) {
              accumulatedContent += content;
            }

            if (chunk.choices?.[0]?.finish_reason) {
              finishReason = chunk.choices[0].finish_reason;
            }

            if (chunk.usage) {
              usage = chunk.usage;
            }

            yield chunk;
          }
        } catch (streamError) {
          error = streamError as Error;
          status = 500;
          throw streamError;
        }
      };

      const iterator = monitoredStream();

      const originalReturn = iterator.return;
      iterator.return = async (value?: any) => {
        const endTime = Date.now();
        const latency = endTime - startTime;

        const prompt = this.formatMessages(params.messages);

        const event: LLMEvent = {
          provider: "openai",
          model: params.model,
          temperature: safeNumber(params.temperature),
          max_tokens: safeNumber(params.max_tokens),
          prompt,
          prompt_tokens: safeNumber(usage?.prompt_tokens),
          completion: accumulatedContent,
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
            finish_reason: finishReason,
            streaming: true,
          },
        };

        this.monitor.logEvent(event).catch((monitorError) => {
          console.warn(
            "[LLMonitor] Failed to log streaming event:",
            monitorError
          );
        });

        return originalReturn
          ? originalReturn.call(iterator, value)
          : { value, done: true };
      };

      return iterator;
    } catch (err) {
      error = err as Error;
      status = 500;

      const endTime = Date.now();
      const latency = endTime - startTime;
      const prompt = this.formatMessages(params.messages);

      const event: LLMEvent = {
        provider: "openai",
        model: params.model,
        temperature: safeNumber(params.temperature),
        max_tokens: safeNumber(params.max_tokens),
        prompt,
        prompt_tokens: 0,
        completion: "",
        completion_tokens: 0,
        latency_ms: latency,
        status,
        cost_usd: 0,
        session_id: options?.sessionId,
        request_id: options?.requestId,
        version_tag: options?.versionTag,
        metadata: {
          ...options?.metadata,
          error: error.message,
          streaming: true,
        },
      };

      this.monitor.logEvent(event).catch((monitorError) => {
        console.warn(
          "[LLMonitor] Failed to log streaming error:",
          monitorError
        );
      });

      throw error;
    }
  }

  get embeddings() {
    return {
      create: async (
        params: EmbeddingCreateParams,
        options?: ProviderOptions
      ): Promise<CreateEmbeddingResponse> => {
        // Debug logging for model validation
        console.log("[LLMonitor] Debug - Embedding model received:", {
          model: params.model,
          modelType: typeof params.model,
          modelLength:
            typeof params.model === "string" ? params.model.length : 0,
          modelTrimmed:
            typeof params.model === "string" ? params.model.trim() : null,
        });

        // Validate model parameter
        if (
          !params.model ||
          typeof params.model !== "string" ||
          params.model.trim() === ""
        ) {
          console.error(
            "[LLMonitor] Error: Invalid embedding model parameter:",
            params.model
          );
          throw new Error(
            `LLMonitor: Invalid embedding model parameter. Received: ${params.model}`
          );
        }

        // Clean model parameter
        const cleanedParams = {
          ...params,
          model: params.model.trim(),
        };

        const startTime = Date.now();
        let status = 200;
        let response: CreateEmbeddingResponse | undefined;
        let error: Error | null = null;

        try {
          response = await this.client.embeddings.create(cleanedParams);
        } catch (err) {
          error = err as Error;
          status = 500;
        } finally {
          const endTime = Date.now();
          const latency = endTime - startTime;

          const input = Array.isArray(params.input)
            ? params.input.join(" ")
            : String(params.input);

          const usage = response?.usage;
          const embeddingDimensions = response?.data?.[0]?.embedding?.length;

          const event: EmbeddingEvent = {
            provider: "openai",
            model: cleanedParams.model,
            input,
            input_tokens: safeNumber(usage?.total_tokens),
            embedding_dimensions: embeddingDimensions,
            latency_ms: latency,
            status,
            cost_usd: this.calculateEmbeddingCost(
              cleanedParams.model,
              usage?.total_tokens
            ),
            session_id: options?.sessionId,
            request_id: options?.requestId,
            version_tag: options?.versionTag,
            metadata: {
              ...options?.metadata,
              error: error?.message,
              encoding_format: params.encoding_format,
              dimensions: params.dimensions,
            },
          };

          this.monitor.logEmbeddingEvent(event).catch((monitorError) => {
            console.warn(
              "[LLMonitor] Failed to log embedding event:",
              monitorError
            );
          });
        }

        if (error) {
          throw error;
        }

        if (!response) {
          throw new Error("No response received from OpenAI embeddings");
        }

        return response;
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

  private calculateEmbeddingCost(
    model: string,
    totalTokens: number | undefined
  ): number | undefined {
    if (!totalTokens) {
      return undefined;
    }

    const embeddingPricing: Record<string, number> = {
      "text-embedding-3-small": 0.00002,
      "text-embedding-3-large": 0.00013,
      "text-embedding-ada-002": 0.0001,
    };

    const modelPricing = embeddingPricing[model];

    if (!modelPricing) {
      return undefined;
    }

    const cost = (totalTokens / 1000) * modelPricing;
    return Number(cost.toFixed(6));
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
