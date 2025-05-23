import { AlertsEvaluator } from "./alerts-evaluator";
import { WebhookService } from "./webhook-service";
import { db } from "@/db";
import { organization, alert_trigger } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export class AlertScheduler {
  private alertsEvaluator: AlertsEvaluator;
  private webhookService: WebhookService;
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.alertsEvaluator = new AlertsEvaluator();
    this.webhookService = new WebhookService();
  }

  start(intervalMinutes: number = 5): void {
    if (this.intervalId) {
      console.log("Alert scheduler is already running");
      return;
    }

    console.log(
      `Starting alert scheduler with ${intervalMinutes} minute intervals`
    );

    this.intervalId = setInterval(async () => {
      await this.runEvaluation();
    }, intervalMinutes * 60 * 1000);

    this.runEvaluation();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log("Alert scheduler stopped");
    }
  }

  private async runEvaluation(): Promise<void> {
    try {
      console.log("Running alert evaluation...");

      const organizations = await db
        .select({ id: organization.id })
        .from(organization);

      for (const org of organizations) {
        const results = await this.alertsEvaluator.evaluateAlerts(org.id);

        for (const result of results) {
          if (result.is_triggered) {
            const triggers = await db
              .select()
              .from(alert_trigger)
              .where(eq(alert_trigger.alert_config_id, result.alert_config_id))
              .orderBy(desc(alert_trigger.triggered_at))
              .limit(1);

            if (triggers.length > 0) {
              await this.webhookService.sendAlertWebhook(triggers[0].id);
            }
          }
        }
      }

      await this.webhookService.retryFailedDeliveries();

      console.log("Alert evaluation completed");
    } catch (error) {
      console.error("Error during alert evaluation:", error);
    }
  }
}
