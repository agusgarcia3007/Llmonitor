import { http } from "@/lib/http";
import type {
  AlertConfig,
  AlertEvaluationResult,
  AlertTrigger,
  CreateAlertRequest,
  CreateWebhookRequest,
  UpdateAlertRequest,
  UpdateWebhookRequest,
  WebhookConfig,
} from "@/types/alerts";

interface AlertSectionConfig {
  id: string;
  enabled: boolean;
  threshold?: number;
  frequency?: "daily" | "weekly" | "monthly";
  projectIds?: string[];
}

interface AlertSectionsRequest {
  sections: AlertSectionConfig[];
}

interface AlertSectionsResponse {
  sections: AlertSectionConfig[];
}

export class AlertService {
  public static async getAlerts(): Promise<{ alerts: AlertConfig[] }> {
    return http.get("/alerts");
  }

  public static async createAlert(
    request: CreateAlertRequest
  ): Promise<AlertConfig> {
    return http.post("/alerts", request);
  }

  public static async updateAlert(
    id: string,
    request: UpdateAlertRequest
  ): Promise<AlertConfig> {
    return http.put(`/alerts/${id}`, request);
  }

  public static async deleteAlert(id: string): Promise<void> {
    return http.delete(`/alerts/${id}`);
  }

  public static async getAlertTriggers(): Promise<{
    triggers: AlertTrigger[];
  }> {
    return http.get("/alerts/triggers");
  }

  public static async evaluateAlert(
    alertId: string
  ): Promise<AlertEvaluationResult> {
    return http.post(`/alerts/${alertId}/evaluate`);
  }

  public static async getWebhooks(): Promise<{ webhooks: WebhookConfig[] }> {
    return http.get("/webhooks");
  }

  public static async createWebhook(
    request: CreateWebhookRequest
  ): Promise<WebhookConfig> {
    return http.post("/webhooks", request);
  }

  public static async updateWebhook(
    id: string,
    request: UpdateWebhookRequest
  ): Promise<WebhookConfig> {
    return http.put(`/webhooks/${id}`, request);
  }

  public static async deleteWebhook(id: string): Promise<void> {
    return http.delete(`/webhooks/${id}`);
  }

  // Simplified alert sections methods
  public static async getAlertSections(): Promise<AlertSectionsResponse> {
    return http.get("/alerts/sections");
  }

  public static async saveAlertSections(
    request: AlertSectionsRequest
  ): Promise<{ success: boolean }> {
    return http.post("/alerts/sections", request);
  }
}
