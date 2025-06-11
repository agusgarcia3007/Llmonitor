import { and, eq, gte, lte, desc, between, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  alert_config,
  llm_event,
  user,
  member,
  organization,
} from "@/db/schema";
import { EmailService } from "./email-service";

export class SimpleAlertsEvaluator {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async evaluateAlertsForOrganization(organizationId: string): Promise<void> {
    console.log(`Evaluating alerts for organization: ${organizationId}`);

    // Get all active alert sections for this organization
    const alertSections = await db
      .select()
      .from(alert_config)
      .where(
        and(
          eq(alert_config.organization_id, organizationId),
          eq(alert_config.type, "section"),
          eq(alert_config.is_active, true)
        )
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
    let whereConditions = [
      eq(llm_event.organization_id, section.organization_id),
      gte(llm_event.created_at, timeWindowStart),
    ];

    // Add project filter if specific projects are selected
    if (projectIds.length > 0 && !projectIds.includes("all")) {
      // For now, we'll skip project filtering since we don't have that field in llm_event
      // This would need to be implemented based on how projects are stored
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
        organizationId: section.organization_id,
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

      // Get organization details
      const orgResult = await db
        .select({ name: organization.name })
        .from(organization)
        .where(eq(organization.id, section.organization_id))
        .limit(1);

      const organizationName = orgResult[0]?.name || "Your Organization";

      // Calculate summary stats
      const stats = await this.calculateSummaryStats(whereConditions);

      // Get admin emails for this organization
      const adminEmails = await db
        .select({ email: user.email })
        .from(user)
        .innerJoin(member, eq(member.userId, user.id))
        .where(
          and(
            eq(member.organizationId, section.organization_id),
            inArray(member.role, ["admin", "owner"])
          )
        );

      if (adminEmails.length === 0) {
        console.warn(
          `No admin emails found for organization ${section.organization_id}`
        );
        return;
      }

      // Send daily summary to each admin
      for (const admin of adminEmails) {
        const success = await this.emailService.sendDailySummaryEmail(
          admin.email,
          organizationName,
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
      // Get organization details
      const orgResult = await db
        .select({ name: organization.name })
        .from(organization)
        .where(eq(organization.id, section.organization_id))
        .limit(1);

      const organizationName = orgResult[0]?.name || "Your Organization";

      // Get admin emails for this organization
      const adminEmails = await db
        .select({ email: user.email })
        .from(user)
        .innerJoin(member, eq(member.userId, user.id))
        .where(
          and(
            eq(member.organizationId, section.organization_id),
            inArray(member.role, ["admin", "owner"])
          )
        );

      if (adminEmails.length === 0) {
        console.warn(
          `No admin emails found for organization ${section.organization_id}`
        );
        return;
      }

      // Send email to each admin
      for (const admin of adminEmails) {
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
