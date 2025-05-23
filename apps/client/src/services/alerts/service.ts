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
} from "@/types/alerts";

export class AlertService {
  public static async getAlerts(): Promise<{ alerts: AlertConfig[] }> {
    const { data } = await http.get("/alerts");
    return data;
  }

  public static async createAlert(
    request: CreateAlertRequest
  ): Promise<{ alert: AlertConfig }> {
    const { data } = await http.post("/alerts", request);
    return data;
  }

  public static async getAlert(id: string): Promise<{ alert: AlertConfig }> {
    const { data } = await http.get(`/alerts/${id}`);
    return data;
  }

  public static async updateAlert(
    id: string,
    request: UpdateAlertRequest
  ): Promise<{ alert: AlertConfig }> {
    const { data } = await http.put(`/alerts/${id}`, request);
    return data;
  }

  public static async deleteAlert(id: string): Promise<{ success: boolean }> {
    const { data } = await http.delete(`/alerts/${id}`);
    return data;
  }

  public static async getAlertTriggers(
    id: string
  ): Promise<{ triggers: AlertTrigger[] }> {
    const { data } = await http.get(`/alerts/${id}/triggers`);
    return data;
  }

  public static async evaluateAlerts(): Promise<{
    results: AlertEvaluationResult[];
  }> {
    const { data } = await http.post("/alerts/evaluate");
    return data;
  }

  public static async getWebhooks(): Promise<{ webhooks: WebhookConfig[] }> {
    const { data } = await http.get("/alerts/webhooks");
    return data;
  }

  public static async createWebhook(
    request: CreateWebhookRequest
  ): Promise<{ webhook: WebhookConfig }> {
    const { data } = await http.post("/alerts/webhooks", request);
    return data;
  }

  public static async updateWebhook(
    id: string,
    request: UpdateWebhookRequest
  ): Promise<{ webhook: WebhookConfig }> {
    const { data } = await http.put(`/alerts/webhooks/${id}`, request);
    return data;
  }

  public static async deleteWebhook(id: string): Promise<{ success: boolean }> {
    const { data } = await http.delete(`/alerts/webhooks/${id}`);
    return data;
  }
}
