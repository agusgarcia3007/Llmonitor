import { http } from "@/lib/http";
import type {
  AlertConfig,
  AlertTrigger,
  WebhookConfig,
  CreateAlertRequest,
  UpdateAlertRequest,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  AlertEvaluationResult,
  AlertMetric,
} from "@/types/alerts";

interface AlertSectionConfig {
  id: string;
  enabled: boolean;
  threshold?: number;
  frequency?: "daily" | "weekly" | "monthly";
}

interface AlertSectionsRequest {
  sections: AlertSectionConfig[];
}

export class AlertService {
  public static async getAlerts(): Promise<{ alerts: AlertConfig[] }> {
    const { data } = await http.get("/alerts");
    return data;
  }

  public static async createAlert(
    alert: CreateAlertRequest
  ): Promise<{ alert: AlertConfig }> {
    const { data } = await http.post("/alerts", { json: alert });
    return data;
  }

  public static async updateAlert(
    id: string,
    alert: UpdateAlertRequest
  ): Promise<{ alert: AlertConfig }> {
    const { data } = await http.put(`/alerts/${id}`, { json: alert });
    return data;
  }

  public static async deleteAlert(id: string): Promise<{ success: boolean }> {
    const { data } = await http.delete(`/alerts/${id}`);
    return data;
  }

  public static async getAlert(id: string): Promise<{ alert: AlertConfig }> {
    const { data } = await http.get(`/alerts/${id}`);
    return data;
  }

  public static async getAlertTriggers(
    id: string
  ): Promise<{ triggers: AlertTrigger[] }> {
    const { data } = await http.get(`/alerts/${id}/triggers`);
    return data;
  }

  public static async evaluateAlert(
    id: string
  ): Promise<{ result: AlertEvaluationResult }> {
    const { data } = await http.post(`/alerts/${id}/evaluate`);
    return data;
  }

  public static async getWebhooks(): Promise<{ webhooks: WebhookConfig[] }> {
    const { data } = await http.get("/alerts/webhooks");
    return data;
  }

  public static async createWebhook(
    webhook: CreateWebhookRequest
  ): Promise<{ webhook: WebhookConfig }> {
    const { data } = await http.post("/alerts/webhooks", { json: webhook });
    return data;
  }

  public static async updateWebhook(
    id: string,
    webhook: UpdateWebhookRequest
  ): Promise<{ webhook: WebhookConfig }> {
    const { data } = await http.put(`/alerts/webhooks/${id}`, {
      json: webhook,
    });
    return data;
  }

  public static async deleteWebhook(id: string): Promise<{ success: boolean }> {
    const { data } = await http.delete(`/alerts/webhooks/${id}`);
    return data;
  }

  // New methods for simplified alert sections
  public static async getAlertSections(): Promise<{
    sections: AlertSectionConfig[];
  }> {
    const { alerts } = await this.getAlerts();

    // Map existing alerts to our simplified sections
    const sections: AlertSectionConfig[] = [
      { id: "errors", enabled: false, threshold: 5 },
      { id: "latency", enabled: false, threshold: 5000 },
      { id: "cost", enabled: false, threshold: 0.1 },
      { id: "summary", enabled: false, frequency: "daily" },
    ];

    // Check if we have existing alerts and map them to sections
    alerts.forEach((alert) => {
      if (alert.metric === "error_rate") {
        sections[0] = {
          id: "errors",
          enabled: alert.is_active,
          threshold: alert.threshold_value,
        };
      } else if (alert.metric === "latency_p95") {
        sections[1] = {
          id: "latency",
          enabled: alert.is_active,
          threshold: alert.threshold_value,
        };
      } else if (alert.metric === "cost_per_hour") {
        sections[2] = {
          id: "cost",
          enabled: alert.is_active,
          threshold: alert.threshold_value,
        };
      }
    });

    return { sections };
  }

  public static async saveAlertSections(
    request: AlertSectionsRequest
  ): Promise<{ success: boolean }> {
    const { alerts } = await this.getAlerts();

    // Map section configs to alert metrics (using valid AlertMetric types)
    const sectionToMetric: Record<string, AlertMetric> = {
      errors: "error_rate",
      latency: "latency_p95",
      cost: "cost_per_hour",
    };

    // Update or create alerts for each section
    for (const section of request.sections) {
      // Skip summary section as it doesn't map to traditional alerts
      if (section.id === "summary") {
        // TODO: Handle summary configuration separately
        continue;
      }

      const metric = sectionToMetric[section.id];
      if (!metric || section.threshold === undefined) continue;

      const existingAlert = alerts.find((alert) => alert.metric === metric);

      if (existingAlert) {
        const updateData: UpdateAlertRequest = {
          threshold_value: section.threshold,
          is_active: section.enabled,
        };
        await this.updateAlert(existingAlert.id, updateData);
      } else if (section.enabled) {
        const createData: CreateAlertRequest = {
          name: this.getSectionName(section.id),
          description: this.getSectionDescription(section.id),
          type: "threshold",
          metric,
          threshold_value: section.threshold,
          threshold_operator: "gt",
          time_window: 60,
          notification_channels: [
            { type: "email", target: "admin@example.com" },
          ],
        };
        await this.createAlert(createData);
      }
    }

    return { success: true };
  }

  private static getSectionName(sectionId: string): string {
    const names = {
      errors: "Error Rate Alert",
      latency: "High Latency Alert",
      cost: "Cost Per Hour Alert",
    };
    return names[sectionId as keyof typeof names] || sectionId;
  }

  private static getSectionDescription(sectionId: string): string {
    const descriptions = {
      errors: "Alert when error rate exceeds threshold",
      latency: "Alert when request latency is too high",
      cost: "Alert when hourly cost exceeds budget",
    };
    return descriptions[sectionId as keyof typeof descriptions] || sectionId;
  }
}
