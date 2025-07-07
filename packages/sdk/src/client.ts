import { LLMEvent, EmbeddingEvent, LLMonitorConfig } from "./types";

type MonitorEvent = LLMEvent | EmbeddingEvent;

export class LLMonitorClient {
  public config: LLMonitorConfig;
  private queue: MonitorEvent[] = [];
  private isProcessing = false;
  private maxQueueSize = 1000;

  constructor(config: LLMonitorConfig) {
    this.config = {
      baseURL: "https://api.llmonitor.io",
      debug: false,
      enabled: true,
      ...config,
    };
  }

  getConfig(): LLMonitorConfig {
    return { ...this.config };
  }

  async logEvent(event: MonitorEvent): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      const enrichedEvent = {
        ...event,
        session_id: event.session_id || this.config.sessionId,
        version_tag: event.version_tag || this.config.versionTag,
        metadata: {
          ...this.config.metadata,
          ...event.metadata,
        },
        projectId: event.projectId || this.config.projectId,
      };

      if (this.queue.length >= this.maxQueueSize) {
        this.queue.shift();
        if (this.config.debug) {
          console.warn("[LLMonitor] Queue full, dropping oldest event");
        }
      }

      this.queue.push(enrichedEvent);

      this.processQueueInBackground();
    } catch (error) {
      if (this.config.debug) {
        console.error("[LLMonitor] Failed to queue event:", error);
      }
    }
  }

  async logEmbeddingEvent(event: EmbeddingEvent): Promise<void> {
    return this.logEvent(event);
  }

  private processQueueInBackground(): void {
    if (this.isProcessing) {
      return;
    }

    setTimeout(async () => {
      await this.processQueue();
    }, 0);
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    const batchSize = Math.min(10, this.queue.length);
    const batch = this.queue.splice(0, batchSize);

    const promises = batch.map((event) => this.sendEventSafely(event));

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      if (this.config.debug) {
        console.error("[LLMonitor] Batch processing error:", error);
      }
    }

    this.isProcessing = false;

    if (this.queue.length > 0) {
      this.processQueueInBackground();
    }
  }

  private async sendEventSafely(event: MonitorEvent): Promise<void> {
    try {
      await this.sendEvent(event);
    } catch (error) {
      if (this.config.debug) {
        console.error("[LLMonitor] Failed to send event:", error);
      }
    }
  }

  private async sendEvent(event: MonitorEvent): Promise<void> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${this.config.baseURL}/llm-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey,
        },
        body: JSON.stringify(event),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (this.config.debug) {
        console.log("[LLMonitor] Event sent successfully");
      }
    } catch (error) {
      clearTimeout(timeout);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  async flush(): Promise<void> {
    try {
      await this.processQueue();
    } catch (error) {
      if (this.config.debug) {
        console.error("[LLMonitor] Flush error:", error);
      }
    }
  }

  updateConfig(updates: Partial<LLMonitorConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
