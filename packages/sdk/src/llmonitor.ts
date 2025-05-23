import { LLMonitorClient } from "./client";
import { OpenAIWrapper } from "./providers/openai";
import { LLMonitorConfig, LLMEvent } from "./types";
import OpenAI from "openai";

export class LLMonitor {
  private client: LLMonitorClient;

  constructor(config: LLMonitorConfig) {
    this.client = new LLMonitorClient(config);
  }

  async logEvent(event: LLMEvent): Promise<void> {
    return this.client.logEvent(event);
  }

  openai(openaiClient: OpenAI): OpenAIWrapper {
    return new OpenAIWrapper(openaiClient, this.client);
  }

  async flush(): Promise<void> {
    return this.client.flush();
  }

  updateConfig(updates: Partial<LLMonitorConfig>): void {
    this.client.updateConfig(updates);
  }
}
