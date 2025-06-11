import { siteData } from "./constants";
import { sendEmail } from "./send-email";
import * as fs from "fs";
import * as path from "path";

export class EmailService {
  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }
  }

  private loadEmailTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, "../emails", templateName);
    return fs.readFileSync(templatePath, "utf-8");
  }

  private replaceTemplatePlaceholders(
    template: string,
    replacements: Record<string, string>
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, "g"), value);
    }
    return result;
  }

  async sendAlertEmail(
    to: string,
    alertName: string,
    metric: string,
    actualValue: number,
    thresholdValue: number,
    organizationName?: string
  ): Promise<boolean> {
    try {
      const subject = `🚨 Alert Triggered: ${alertName}`;

      const metricDisplayName = this.getMetricDisplayName(metric);
      const formattedActualValue = this.formatMetricValue(metric, actualValue);
      const formattedThresholdValue = this.formatMetricValue(
        metric,
        thresholdValue
      );
      const orgName = organizationName || "Your Organization";

      const template = this.loadEmailTemplate("alert-email.html");
      const htmlContent = this.replaceTemplatePlaceholders(template, {
        alertName,
        metricDisplayName,
        formattedActualValue,
        formattedThresholdValue,
        organizationName: orgName,
        metricDisplayNameLower: metricDisplayName.toLowerCase(),
        timestamp: new Date().toLocaleString(),
        dashboardUrl: `${siteData.url}/alerts`,
        settingsUrl: `${siteData.url}/settings/alerts`,
      });

      const result = await sendEmail(to, subject, htmlContent);
      console.log(`Alert email sent successfully to ${to}:`, result?.id);
      return true;
    } catch (error) {
      console.error("Error sending alert email:", error);
      return false;
    }
  }

  async sendInvitationEmail(
    to: string,
    organizationName: string,
    inviterName: string,
    role: string,
    invitationId: string
  ): Promise<boolean> {
    try {
      const subject = `You're invited to join ${organizationName} on LLMonitor`;

      const acceptUrl = `${siteData.url}/accept-invitation?token=${invitationId}`;

      const template = this.loadEmailTemplate("invitation-email.html");
      const htmlContent = this.replaceTemplatePlaceholders(template, {
        organizationName,
        inviterName,
        role,
        acceptUrl,
        timestamp: new Date().toLocaleString(),
        siteUrl: siteData.url,
        settingsUrl: `${siteData.url}/settings/invitations`,
      });

      const result = await sendEmail(to, subject, htmlContent);
      console.log(`Invitation email sent successfully to ${to}:`, result?.id);
      return true;
    } catch (error) {
      console.error("Error sending invitation email:", error);
      return false;
    }
  }

  async sendResetPasswordEmail(
    to: string,
    userName: string,
    resetUrl: string
  ): Promise<boolean> {
    try {
      const subject = "Reset your password - LLMonitor";

      const template = this.loadEmailTemplate("reset-password-email.html");
      const htmlContent = this.replaceTemplatePlaceholders(template, {
        userName: userName || "User",
        resetUrl,
        timestamp: new Date().toLocaleString(),
        siteUrl: siteData.url,
        supportEmail: "support@llmonitor.com",
      });

      const result = await sendEmail(to, subject, htmlContent);
      console.log(
        `Reset password email sent successfully to ${to}:`,
        result?.id
      );
      return true;
    } catch (error) {
      console.error("Error sending reset password email:", error);
      return false;
    }
  }

  async sendDailySummaryEmail(
    to: string,
    organizationName: string,
    stats: {
      totalRequests: number;
      totalErrors: number;
      avgLatency: number;
      totalCost: number;
    }
  ): Promise<boolean> {
    try {
      const subject = `📊 Daily Summary for ${organizationName}`;

      const template = this.loadEmailTemplate("daily-summary-email.html");
      const htmlContent = this.replaceTemplatePlaceholders(template, {
        organizationName,
        date: new Date().toLocaleDateString(),
        totalRequests: stats.totalRequests.toLocaleString(),
        totalErrors: stats.totalErrors.toLocaleString(),
        avgLatency: `${Math.round(stats.avgLatency)}ms`,
        totalCost: `$${stats.totalCost.toFixed(4)}`,
        dashboardUrl: `${siteData.url}/dashboard`,
        settingsUrl: `${siteData.url}/settings/alerts`,
      });

      const result = await sendEmail(to, subject, htmlContent);
      console.log(
        `Daily summary email sent successfully to ${to}:`,
        result?.id
      );
      return true;
    } catch (error) {
      console.error("Error sending daily summary email:", error);
      return false;
    }
  }

  private getMetricDisplayName(metric: string): string {
    const displayNames: Record<string, string> = {
      // Alert sections
      errors: "Errors",
      latency: "Average Latency",
      cost: "Average Cost",
      summary: "Summary",
      // Legacy metrics
      cost_per_hour: "Cost per Hour",
      cost_per_day: "Cost per Day",
      cost_per_week: "Cost per Week",
      cost_per_month: "Cost per Month",
      requests_per_minute: "Requests per Minute",
      requests_per_hour: "Requests per Hour",
      error_rate: "Error Rate",
      latency_p95: "Latency P95",
      latency_p99: "Latency P99",
      token_usage_per_hour: "Token Usage per Hour",
      token_usage_per_day: "Token Usage per Day",
    };
    return displayNames[metric] || metric;
  }

  private formatMetricValue(metric: string, value: number): string {
    // Alert sections formatting
    if (metric === "errors") {
      return `${Math.round(value)} errors`;
    }
    if (metric === "latency") {
      return `${Math.round(value)}ms`;
    }
    if (metric === "cost") {
      return `$${value.toFixed(4)}`;
    }
    if (metric === "summary") {
      return value.toString();
    }

    // Legacy formatting
    if (metric.startsWith("cost_")) {
      return `$${value.toFixed(2)}`;
    }
    if (metric === "error_rate") {
      return `${value.toFixed(1)}%`;
    }
    if (metric.startsWith("latency_")) {
      return `${value.toFixed(0)}ms`;
    }
    if (metric.startsWith("token_usage_")) {
      return value.toLocaleString() + " tokens";
    }
    if (metric.startsWith("requests_")) {
      return value.toLocaleString() + " requests";
    }
    return value.toString();
  }
}
