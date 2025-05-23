import { and, eq, lt, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  webhook_config,
  webhook_delivery,
  alert_config,
  alert_trigger,
  organization,
} from "@/db/schema";
import { WebhookPayload } from "@/types/alerts";
import { randomUUID, createHmac } from "crypto";

interface EmailServiceInterface {
  sendAlertEmail(
    to: string,
    alertName: string,
    metric: string,
    actualValue: number,
    thresholdValue: number,
    organizationName?: string
  ): Promise<boolean>;
}

let emailService: EmailServiceInterface | null = null;

try {
  const { EmailService } = require("./email-service");
  emailService = new EmailService();
} catch (error) {
  console.warn(
    "Email service not available. Email notifications will be skipped."
  );
}

export class WebhookService {
  async sendAlertWebhook(triggerId: string): Promise<void> {
    const trigger = await db
      .select()
      .from(alert_trigger)
      .innerJoin(
        alert_config,
        eq(alert_trigger.alert_config_id, alert_config.id)
      )
      .innerJoin(
        organization,
        eq(alert_config.organization_id, organization.id)
      )
      .where(eq(alert_trigger.id, triggerId))
      .limit(1);

    if (!trigger.length) return;

    const {
      alert_trigger: triggerData,
      alert_config: alertData,
      organization: orgData,
    } = trigger[0];

    const webhooks = await db
      .select()
      .from(webhook_config)
      .where(
        and(
          eq(webhook_config.organization_id, alertData.organization_id),
          eq(webhook_config.is_active, true)
        )
      );

    for (const webhook of webhooks) {
      const events = webhook.events as string[];
      if (!events.includes("alert.triggered")) continue;

      const payload: WebhookPayload = {
        event_type: "alert.triggered",
        timestamp: new Date().toISOString(),
        organization_id: alertData.organization_id,
        alert: {
          id: alertData.id,
          name: alertData.name,
          metric: alertData.metric,
          threshold_value: alertData.threshold_value,
          actual_value: triggerData.metric_value,
          trigger_id: triggerData.id,
        },
        context: triggerData.context as any,
      };

      await this.deliverWebhook(webhook.id, payload, triggerId);
    }

    await this.sendEmailNotifications(alertData, triggerData, orgData.name);
  }

  private async sendEmailNotifications(
    alertData: typeof alert_config.$inferSelect,
    triggerData: typeof alert_trigger.$inferSelect,
    organizationName: string
  ): Promise<void> {
    if (!emailService) return;

    const notificationChannels = alertData.notification_channels as any[];
    const emailChannels = notificationChannels.filter(
      (channel) => channel.type === "email"
    );

    for (const channel of emailChannels) {
      try {
        const success = await emailService.sendAlertEmail(
          channel.target,
          alertData.name,
          alertData.metric,
          triggerData.metric_value,
          alertData.threshold_value,
          organizationName
        );

        if (success) {
          console.log(
            `Email notification sent successfully to ${channel.target}`
          );
        } else {
          console.error(
            `Failed to send email notification to ${channel.target}`
          );
        }
      } catch (error) {
        console.error(`Error sending email to ${channel.target}:`, error);
      }
    }
  }

  async deliverWebhook(
    webhookConfigId: string,
    payload: WebhookPayload,
    alertTriggerId?: string
  ): Promise<void> {
    const webhook = await db
      .select()
      .from(webhook_config)
      .where(eq(webhook_config.id, webhookConfigId))
      .limit(1);

    if (!webhook.length) return;

    const webhookConfig = webhook[0];
    const deliveryId = randomUUID();

    await db.insert(webhook_delivery).values({
      id: deliveryId,
      webhook_config_id: webhookConfigId,
      alert_trigger_id: alertTriggerId,
      event_type: payload.event_type,
      payload: payload as any,
      status: "pending",
      attempts: 0,
    });

    await this.attemptDelivery(deliveryId);
  }

  private async attemptDelivery(deliveryId: string): Promise<void> {
    const delivery = await db
      .select()
      .from(webhook_delivery)
      .innerJoin(
        webhook_config,
        eq(webhook_delivery.webhook_config_id, webhook_config.id)
      )
      .where(eq(webhook_delivery.id, deliveryId))
      .limit(1);

    if (!delivery.length) return;

    const { webhook_delivery: deliveryData, webhook_config: webhookData } =
      delivery[0];

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "LLMonitor-Webhook/1.0",
      };

      const customHeaders = webhookData.headers as Record<
        string,
        string
      > | null;
      if (customHeaders) {
        Object.assign(headers, customHeaders);
      }

      if (webhookData.secret) {
        const signature = this.generateSignature(
          JSON.stringify(deliveryData.payload),
          webhookData.secret
        );
        headers["X-LLMonitor-Signature"] = signature;
      }

      const response = await fetch(webhookData.url, {
        method: "POST",
        headers,
        body: JSON.stringify(deliveryData.payload),
        signal: AbortSignal.timeout(30000),
      });

      const responseBody = await response.text().catch(() => "");

      await db
        .update(webhook_delivery)
        .set({
          status: response.ok ? "delivered" : "failed",
          attempts: deliveryData.attempts + 1,
          last_attempt_at: new Date(),
          response_status: response.status,
          response_body: responseBody.slice(0, 1000),
          delivered_at: response.ok ? new Date() : undefined,
        })
        .where(eq(webhook_delivery.id, deliveryId));

      if (!response.ok) {
        await this.scheduleRetry(deliveryId, deliveryData.attempts + 1);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await db
        .update(webhook_delivery)
        .set({
          status: "failed",
          attempts: deliveryData.attempts + 1,
          last_attempt_at: new Date(),
          error_message: errorMessage.slice(0, 500),
        })
        .where(eq(webhook_delivery.id, deliveryId));

      await this.scheduleRetry(deliveryId, deliveryData.attempts + 1);
    }
  }

  private async scheduleRetry(
    deliveryId: string,
    attempt: number
  ): Promise<void> {
    if (attempt >= 5) return;

    const retryDelays = [60, 300, 900, 3600, 7200];
    const delaySeconds = retryDelays[attempt - 1] || 7200;

    setTimeout(async () => {
      await this.attemptDelivery(deliveryId);
    }, delaySeconds * 1000);
  }

  private generateSignature(payload: string, secret: string): string {
    return `sha256=${createHmac("sha256", secret)
      .update(payload)
      .digest("hex")}`;
  }

  async retryFailedDeliveries(): Promise<void> {
    const failedDeliveries = await db
      .select()
      .from(webhook_delivery)
      .where(
        and(
          eq(webhook_delivery.status, "failed"),
          lt(webhook_delivery.attempts, 5),
          lte(
            webhook_delivery.last_attempt_at,
            new Date(Date.now() - 5 * 60 * 1000)
          )
        )
      )
      .limit(50);

    for (const delivery of failedDeliveries) {
      await this.attemptDelivery(delivery.id);
    }
  }
}
