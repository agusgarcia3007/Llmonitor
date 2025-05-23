import { LLMEvent, LLMonitorConfig } from "./types";

export class LLMonitorClient {
  public config: LLMonitorConfig;
  private queue: LLMEvent[] = [];
  private isProcessing = false;

  constructor(config: LLMonitorConfig) {
    this.config = {
      baseURL: "http://localhost:3001",
      debug: false,
      enabled: true,
      ...config,
    };
  }

  getConfig(): LLMonitorConfig {
    return { ...this.config };
  }

  async logEvent(event: LLMEvent): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const enrichedEvent = {
      ...event,
      session_id: event.session_id || this.config.sessionId,
      version_tag: event.version_tag || this.config.versionTag,
      metadata: {
        ...this.config.metadata,
        ...event.metadata,
      },
    };

    this.queue.push(enrichedEvent);

    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const event = this.queue.shift()!;
      await this.sendEvent(event);
    }

    this.isProcessing = false;
  }

  private async sendEvent(event: LLMEvent): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/llm-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (this.config.debug) {
        console.log("[LLMonitor] Event sent successfully:", event);
      }
    } catch (error) {
      if (this.config.debug) {
        console.error("[LLMonitor] Failed to send event:", error);
      }
    }
  }

  async flush(): Promise<void> {
    await this.processQueue();
  }

  updateConfig(updates: Partial<LLMonitorConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
