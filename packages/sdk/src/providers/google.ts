import { LLMonitorClient } from "../client";
import { ProviderOptions, LLMEvent } from "../types";

interface GoogleGenerativeModelConfig {
  model: string;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    candidateCount?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

interface GoogleContent {
  role?: string;
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

interface GoogleGenerateContentRequest {
  contents: GoogleContent[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    candidateCount?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

interface GoogleGenerateContentResponse {
  candidates: Array<{
    content: GoogleContent;
    finishReason?: string;
    index: number;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

interface GoogleGenerativeModel {
  generateContent(
    request: GoogleGenerateContentRequest | string
  ): Promise<{ response: GoogleGenerateContentResponse }>;
  generateContentStream(
    request: GoogleGenerateContentRequest | string
  ): Promise<{
    stream: AsyncIterable<{ text(): string }>;
    response: Promise<GoogleGenerateContentResponse>;
  }>;
  countTokens?(input: GoogleGenerateContentRequest | string): Promise<{
    totalTokens: number;
  }>;
}

interface GoogleGenerativeAI {
  getGenerativeModel(
    config: GoogleGenerativeModelConfig
  ): GoogleGenerativeModel;
}

type GenerativeModel = GoogleGenerativeModel;

function safeNumber(value: number | null | undefined): number | undefined {
  return value === null ? undefined : value;
}

export class GoogleWrapper {
  private model: GenerativeModel;
  private monitor: LLMonitorClient;
  private modelName: string;

  constructor(
    model: GenerativeModel,
    monitor: LLMonitorClient,
    modelName?: string
  ) {
    this.model = model;
    this.monitor = monitor;
    this.modelName = modelName || "gemini-pro";
  }

  async generateContent(
    prompt: string,
    options?: ProviderOptions
  ): Promise<any> {
    const startTime = Date.now();
    let status = 200;
    let response: any;
    let error: Error | null = null;

    try {
      const result = await this.model.generateContent(prompt);
      response = result.response;
    } catch (err) {
      error = err as Error;
      status = 500;
    } finally {
      const endTime = Date.now();
      const latency = endTime - startTime;

      const completion = response?.text() || "";
      const usage = response?.usageMetadata;

      const event: LLMEvent = {
        provider: "google",
        model: this.modelName,
        prompt,
        prompt_tokens: safeNumber(usage?.promptTokenCount),
        completion,
        completion_tokens: safeNumber(usage?.candidatesTokenCount),
        latency_ms: latency,
        status,
        cost_usd: this.calculateCost(this.modelName, usage),
        session_id: options?.sessionId,
        request_id: options?.requestId,
        version_tag: options?.versionTag,
        metadata: {
          ...options?.metadata,
          error: error?.message,
          finish_reason: response?.candidates?.[0]?.finishReason,
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

  async generateContentStream(
    prompt: string,
    options?: ProviderOptions
  ): Promise<any> {
    const startTime = Date.now();
    let status = 200;
    let error: Error | null = null;
    let fullText = "";

    try {
      const result = await this.model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
      }

      const response = await result.response;

      const endTime = Date.now();
      const latency = endTime - startTime;
      const usage = response?.usageMetadata;

      const event: LLMEvent = {
        provider: "google",
        model: this.modelName,
        prompt,
        prompt_tokens: safeNumber(usage?.promptTokenCount),
        completion: fullText,
        completion_tokens: safeNumber(usage?.candidatesTokenCount),
        latency_ms: latency,
        status,
        cost_usd: this.calculateCost(this.modelName, usage),
        session_id: options?.sessionId,
        request_id: options?.requestId,
        version_tag: options?.versionTag,
        metadata: {
          ...options?.metadata,
          streaming: true,
          finish_reason: response?.candidates?.[0]?.finishReason,
        },
      };

      try {
        await this.monitor.logEvent(event);
      } catch (monitorError) {
        console.warn("[LLMonitor] Failed to log event:", monitorError);
      }

      return result;
    } catch (err) {
      error = err as Error;
      status = 500;
      throw error;
    }
  }

  private calculateCost(
    model: string,
    usage?: { promptTokenCount?: number; candidatesTokenCount?: number }
  ): number | undefined {
    const inputTokens = safeNumber(usage?.promptTokenCount);
    const outputTokens = safeNumber(usage?.candidatesTokenCount);

    if (!inputTokens || !outputTokens) {
      return undefined;
    }

    const pricing: Record<string, { input: number; output: number }> = {
      "gemini-pro": { input: 0.0005, output: 0.0015 },
      "gemini-pro-vision": { input: 0.00025, output: 0.0005 },
      "gemini-1.5-pro": { input: 0.0035, output: 0.0105 },
      "gemini-1.5-flash": { input: 0.00035, output: 0.00105 },
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
    if (model.includes("gemini-1.5-pro")) return "gemini-1.5-pro";
    if (model.includes("gemini-1.5-flash")) return "gemini-1.5-flash";
    if (model.includes("gemini-pro-vision")) return "gemini-pro-vision";
    if (model.includes("gemini-pro")) return "gemini-pro";
    return model;
  }
}
