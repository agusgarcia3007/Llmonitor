import { and, eq, gte, lte, desc, between, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import { alert_config, alert_trigger, llm_event, user } from "@/db/schema";
import { EmailService } from "./email-service";
import { randomUUID } from "crypto";

export class SimpleAlertsEvaluator {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async evaluateAlertsForAllUsers(): Promise<void> {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[AlertScheduler] Skipping alert evaluation: not in production environment"
      );
      return;
    }
    console.log(`Evaluating alerts for all users`);

    // Get all active alert sections
    const alertSections = await db
      .select()
      .from(alert_config)
      .where(
        and(eq(alert_config.type, "section"), eq(alert_config.is_active, true))
      );

    for (const section of alertSections) {
      try {
        await this.evaluateSection(section);
      } catch (error) {
        console.error(`Error evaluating section ${section.name}:`, error);
      }
    }
  }

  private async evaluateSection(
    section: typeof alert_config.$inferSelect
  ): Promise<void> {
    const timeWindowStart = new Date(Date.now() - section.time_window * 1000);
    const projectIds = (section.filters as any)?.projectIds || [];

    // Build base query conditions
    let whereConditions = [gte(llm_event.created_at, timeWindowStart)];

    // Add project filter if specific projects are selected
    if (projectIds.length > 0) {
      whereConditions.push(inArray(llm_event.organization_id, projectIds));
    }

    // Handle summary section differently - send daily summary
    if (section.metric === "summary") {
      const shouldSendSummary = await this.shouldSendSummaryNotification(
        section
      );
      if (shouldSendSummary) {
        await this.sendDailySummary(section, whereConditions);
        // Record the summary trigger
        await this.recordAlertTrigger(section, 1);
      }
      return;
    }

    const metricValue = await this.calculateMetric(
      section.metric,
      whereConditions
    );
    const isTriggered = metricValue > section.threshold_value;

    if (isTriggered) {
      // Check if we should send notification (cooldown logic)
      const shouldNotify = await this.shouldSendNotification(
        section,
        metricValue
      );

      if (shouldNotify) {
        console.log(`🚨 Alert triggered for ${section.name}:`, {
          metric: section.metric,
          value: metricValue,
          threshold: section.threshold_value,
          userId: section.created_by,
        });

        await this.sendNotification(section, metricValue);

        // Record the trigger
        await this.recordAlertTrigger(section, metricValue);
      } else {
        console.log(
          `⏰ Alert for ${section.name} is in cooldown period, skipping notification`
        );
      }
    }
  }

  private async sendDailySummary(
    section: typeof alert_config.$inferSelect,
    whereConditions: any[]
  ): Promise<void> {
    try {
      // Check if we should send summary based on frequency
      if (!this.shouldSendSummary(section)) {
        return;
      }

      // Get user details
      const userResult = await db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.id, section.created_by))
        .limit(1);

      if (!userResult[0]) {
        console.warn(`User not found for alert section ${section.name}`);
        return;
      }

      const userEmail = userResult[0].email;

      // Calculate summary stats
      const stats = await this.calculateSummaryStats(whereConditions);

      // Send to the user who created the alert
      const adminEmails = [{ email: userEmail }];

      if (adminEmails.length === 0) {
        console.warn(`No email found for user ${section.created_by}`);
        return;
      }

      // Send daily summary to the user
      for (const admin of adminEmails) {
        const success = await this.emailService.sendDailySummaryEmail(
          admin.email,
          "Your Projects",
          stats
        );

        if (success) {
          console.log(`✅ Daily summary sent to ${admin.email}`);
        } else {
          console.error(`❌ Failed to send daily summary to ${admin.email}`);
        }
      }
    } catch (error) {
      console.error(`Error sending daily summary:`, error);
    }
  }

  private shouldSendSummary(
    section: typeof alert_config.$inferSelect
  ): boolean {
    // For now, send summary once per day at most
    // TODO: Add logic to track when last summary was sent
    const now = new Date();
    const hour = now.getHours();

    // Send daily summary at 9 AM
    if (section.time_window === 86400 && hour === 9) {
      return true;
    }

    // Send weekly summary on Monday at 9 AM
    if (section.time_window === 604800 && now.getDay() === 1 && hour === 9) {
      return true;
    }

    // Send monthly summary on the 1st at 9 AM
    if (section.time_window === 2592000 && now.getDate() === 1 && hour === 9) {
      return true;
    }

    return false;
  }

  private async calculateSummaryStats(whereConditions: any[]): Promise<{
    totalRequests: number;
    totalErrors: number;
    avgLatency: number;
    totalCost: number;
  }> {
    const result = await db
      .select({
        totalRequests: sql<number>`count(*)`,
        totalErrors: sql<number>`count(*) filter (where ${llm_event.status} >= 400)`,
        avgLatency: sql<number>`avg(${llm_event.latency_ms})`,
        totalCost: sql<number>`sum(${llm_event.cost_usd})`,
      })
      .from(llm_event)
      .where(and(...whereConditions));

    const stats = result[0];
    return {
      totalRequests: stats?.totalRequests || 0,
      totalErrors: stats?.totalErrors || 0,
      avgLatency: stats?.avgLatency || 0,
      totalCost: stats?.totalCost || 0,
    };
  }

  private async calculateMetric(
    metric: string,
    whereConditions: any[]
  ): Promise<number> {
    switch (metric) {
      case "errors":
        return this.calculateErrorsInTimeWindow(whereConditions);

      case "latency":
        return this.calculateAverageLatency(whereConditions);

      case "cost":
        return this.calculateCostPerCall(whereConditions);

      case "summary":
        return 0; // Summary doesn't have thresholds

      default:
        console.warn(`Unknown metric: ${metric}`);
        return 0;
    }
  }

  private async calculateErrorsInTimeWindow(
    whereConditions: any[]
  ): Promise<number> {
    const result = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(llm_event)
      .where(and(...whereConditions, gte(llm_event.status, 400)));

    const errorCount = result[0]?.count || 0;

    return errorCount;
  }

  private async calculateAverageLatency(
    whereConditions: any[]
  ): Promise<number> {
    const result = await db
      .select({
        avgLatency: sql<number>`avg(${llm_event.latency_ms})`,
      })
      .from(llm_event)
      .where(and(...whereConditions));

    return result[0]?.avgLatency || 0;
  }

  private async calculateCostPerCall(whereConditions: any[]): Promise<number> {
    const result = await db
      .select({
        avgCost: sql<number>`avg(${llm_event.cost_usd})`,
        count: sql<number>`count(*)`,
      })
      .from(llm_event)
      .where(and(...whereConditions));

    return result[0]?.avgCost || 0;
  }

  private async sendNotification(
    section: typeof alert_config.$inferSelect,
    metricValue: number
  ): Promise<void> {
    try {
      // Get user email
      const userResult = await db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.id, section.created_by))
        .limit(1);

      if (!userResult[0]) {
        console.warn(`User not found for alert section ${section.name}`);
        return;
      }

      const organizationName = "Your Projects";

      const adminEmails = [{ email: userResult[0].email }];

      if (adminEmails.length === 0) {
        console.warn(`No email found for user ${section.created_by}`);
        return;
      }

      // Send email to each admin
      for (const admin of adminEmails) {
        if (process.env.NODE_ENV === "production") {
          const success = await this.emailService.sendAlertEmail(
            admin.email,
            this.getAlertDisplayName(section.name),
            section.metric,
            metricValue,
            section.threshold_value,
            organizationName
          );

          if (success) {
            console.log(
              `✅ Alert email sent to ${admin.email} for ${section.name}`
            );
          } else {
            console.error(
              `❌ Failed to send alert email to ${admin.email} for ${section.name}`
            );
          }
        }
      }
    } catch (error) {
      console.error(`Error sending notification for ${section.name}:`, error);
    }
  }

  private getAlertDisplayName(sectionId: string): string {
    const displayNames: Record<string, string> = {
      errors: "High Error Rate",
      latency: "High Latency",
      cost: "High Cost",
      summary: "Daily Summary",
    };
    return displayNames[sectionId] || sectionId;
  }

  private async shouldSendNotification(
    section: typeof alert_config.$inferSelect,
    currentValue: number
  ): Promise<boolean> {
    // Get the most recent trigger for this alert
    const lastTrigger = await db
      .select()
      .from(alert_trigger)
      .where(eq(alert_trigger.alert_config_id, section.id))
      .orderBy(desc(alert_trigger.triggered_at))
      .limit(1);

    // If no previous trigger, this is a new alert
    if (lastTrigger.length === 0) {
      return true;
    }

    const lastTriggerData = lastTrigger[0];
    const lastValue = lastTriggerData.metric_value;
    const lastTriggerTime = lastTriggerData.triggered_at;

    // Check if enough time has passed for a minimum cooldown (30 minutes)
    const minCooldownMinutes = 30;
    const minCooldownThreshold = new Date(
      Date.now() - minCooldownMinutes * 60 * 1000
    );

    if (lastTriggerTime > minCooldownThreshold) {
      return false; // Still in minimum cooldown period
    }

    // If the current value is below threshold, the problem might be resolved
    if (currentValue <= section.threshold_value) {
      // Mark the last trigger as resolved if it hasn't been already
      if (lastTriggerData.status === "triggered") {
        await db
          .update(alert_trigger)
          .set({
            status: "resolved",
            resolved_at: new Date(),
          })
          .where(eq(alert_trigger.id, lastTriggerData.id));
      }
      return false; // Don't send alert for resolved condition
    }

    // Calculate percentage change from last alert
    const percentageChange =
      Math.abs((currentValue - lastValue) / lastValue) * 100;

    // Send alert if the value has increased significantly (25% worse)
    const significantChangeThreshold = 25;

    if (
      percentageChange >= significantChangeThreshold &&
      currentValue > lastValue
    ) {
      return true; // Significant worsening
    }

    // For ongoing issues, only send alert after longer cooldown (4 hours)
    const longCooldownMinutes = 240; // 4 hours
    const longCooldownThreshold = new Date(
      Date.now() - longCooldownMinutes * 60 * 1000
    );

    return lastTriggerTime < longCooldownThreshold;
  }

  private async recordAlertTrigger(
    section: typeof alert_config.$inferSelect,
    metricValue: number
  ): Promise<void> {
    await db.insert(alert_trigger).values({
      id: randomUUID(),
      alert_config_id: section.id,
      metric_value: metricValue,
      context: {
        threshold: section.threshold_value,
        metric: section.metric,
        projectIds: (section.filters as any)?.projectIds || [],
      },
      status: "triggered",
    });
  }

  private async shouldSendSummaryNotification(
    section: typeof alert_config.$inferSelect
  ): Promise<boolean> {
    // For summary, check if we sent one in the configured frequency period
    const now = new Date();
    let cooldownThreshold: Date;

    switch (section.time_window) {
      case 86400: // daily
        cooldownThreshold = new Date(now.getTime() - 20 * 60 * 60 * 1000); // 20 hours ago
        break;
      case 604800: // weekly
        cooldownThreshold = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 days ago
        break;
      case 2592000: // monthly
        cooldownThreshold = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000); // 25 days ago
        break;
      default:
        cooldownThreshold = new Date(now.getTime() - 20 * 60 * 60 * 1000); // Default to 20 hours
    }

    const recentTrigger = await db
      .select()
      .from(alert_trigger)
      .where(
        and(
          eq(alert_trigger.alert_config_id, section.id),
          gte(alert_trigger.triggered_at, cooldownThreshold)
        )
      )
      .limit(1);

    return recentTrigger.length === 0;
  }
}
