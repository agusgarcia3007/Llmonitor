import { and, eq, gte, lte, desc, between, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import { alert_config, llm_event, user } from "@/db/schema";
import { EmailService } from "./email-service";

export class SimpleAlertsEvaluator {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async evaluateAlertsForAllUsers(): Promise<void> {
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
      await this.sendDailySummary(section, whereConditions);
      return;
    }

    const metricValue = await this.calculateMetric(
      section.metric,
      whereConditions
    );
    const isTriggered = metricValue > section.threshold_value;

    if (isTriggered) {
      console.log(`🚨 Alert triggered for ${section.name}:`, {
        metric: section.metric,
        value: metricValue,
        threshold: section.threshold_value,
        userId: section.created_by,
      });

      await this.sendNotification(section, metricValue);
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
}
