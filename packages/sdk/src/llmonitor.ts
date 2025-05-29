import { LLMonitorClient } from "./client";
import { OpenAIWrapper } from "./providers/openai";
import { AnthropicWrapper } from "./providers/anthropic";
import { GoogleWrapper } from "./providers/google";
import { CohereWrapper } from "./providers/cohere";
import {
  createExpressMiddleware,
  ExpressMiddlewareOptions,
} from "./middleware/express";
import { LLMonitorConfig as BaseLLMonitorConfig, LLMEvent } from "./types";
import OpenAI from "openai";

export interface LLMonitorConfig extends BaseLLMonitorConfig {
  baseURL?: string;
  applicationId?: string;
}

export class LLMonitor {
  private client: LLMonitorClient;

  constructor(config: LLMonitorConfig) {
    if (
      !config.apiKey ||
      typeof config.apiKey !== "string" ||
      !config.apiKey.trim()
    ) {
      throw new Error(
        "LLMonitor: Missing API key. Please provide a valid apiKey in the LLMonitor config. You can get your API key from the LLMonitor dashboard."
      );
    }
    this.client = new LLMonitorClient(config);
  }

  async logEvent(event: LLMEvent): Promise<void> {
    return this.client.logEvent(event);
  }

  openai(openaiClient: OpenAI): OpenAIWrapper {
    return new OpenAIWrapper(openaiClient, this.client);
  }

  anthropic(anthropicClient: any): AnthropicWrapper {
    return new AnthropicWrapper(anthropicClient, this.client);
  }

  google(model: any, modelName?: string): GoogleWrapper {
    return new GoogleWrapper(model, this.client, modelName);
  }

  cohere(cohereClient: any): CohereWrapper {
    return new CohereWrapper(cohereClient, this.client);
  }

  express(options: Omit<ExpressMiddlewareOptions, keyof LLMonitorConfig> = {}) {
    return createExpressMiddleware({
      apiKey: this.client.getConfig().apiKey,
      baseURL: this.client.getConfig().baseURL,
      debug: this.client.getConfig().debug,
      enabled: this.client.getConfig().enabled,
      sessionId: this.client.getConfig().sessionId,
      versionTag: this.client.getConfig().versionTag,
      metadata: this.client.getConfig().metadata,
      ...options,
    });
  }

  async flush(): Promise<void> {
    return this.client.flush();
  }

  updateConfig(updates: Partial<LLMonitorConfig>): void {
    this.client.updateConfig(updates);
  }
}
