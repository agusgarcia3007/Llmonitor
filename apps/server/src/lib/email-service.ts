import { Resend } from "resend";

export class EmailService {
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }
    this.resend = new Resend(apiKey);
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

      const htmlContent = this.generateAlertEmailHTML({
        alertName,
        metric,
        actualValue,
        thresholdValue,
        organizationName: organizationName || "Your Organization",
      });

      const textContent = this.generateAlertEmailText({
        alertName,
        metric,
        actualValue,
        thresholdValue,
        organizationName: organizationName || "Your Organization",
      });

      const result = await this.resend.emails.send({
        from: "LLMonitor Alerts <alerts@llmonitor.com>",
        to: [to],
        subject,
        html: htmlContent,
        text: textContent,
      });

      if (result.error) {
        console.error("Error sending alert email:", result.error);
        return false;
      }

      console.log(`Alert email sent successfully to ${to}:`, result.data?.id);
      return true;
    } catch (error) {
      console.error("Error sending alert email:", error);
      return false;
    }
  }

  private generateAlertEmailHTML({
    alertName,
    metric,
    actualValue,
    thresholdValue,
    organizationName,
  }: {
    alertName: string;
    metric: string;
    actualValue: number;
    thresholdValue: number;
    organizationName: string;
  }): string {
    const metricDisplayName = this.getMetricDisplayName(metric);
    const formattedActualValue = this.formatMetricValue(metric, actualValue);
    const formattedThresholdValue = this.formatMetricValue(
      metric,
      thresholdValue
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Alert Triggered</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Alert Triggered</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">${alertName}</h2>
              
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b; font-weight: 600;">Alert Details:</p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #7f1d1d;">
                  <li><strong>Metric:</strong> ${metricDisplayName}</li>
                  <li><strong>Current Value:</strong> ${formattedActualValue}</li>
                  <li><strong>Threshold:</strong> ${formattedThresholdValue}</li>
                  <li><strong>Organization:</strong> ${organizationName}</li>
                  <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                </ul>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin: 20px 0;">
                This alert was triggered because your ${metricDisplayName.toLowerCase()} has exceeded the configured threshold. 
                Please review your usage and take appropriate action if necessary.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${
                  process.env.FRONTEND_URL || "https://llmonitor.com"
                }/alerts" 
                   style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  View Dashboard
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This email was sent by LLMonitor Alert System.<br>
                <a href="${
                  process.env.FRONTEND_URL || "https://llmonitor.com"
                }/settings/alerts" style="color: #3b82f6;">Manage alert settings</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateAlertEmailText({
    alertName,
    metric,
    actualValue,
    thresholdValue,
    organizationName,
  }: {
    alertName: string;
    metric: string;
    actualValue: number;
    thresholdValue: number;
    organizationName: string;
  }): string {
    const metricDisplayName = this.getMetricDisplayName(metric);
    const formattedActualValue = this.formatMetricValue(metric, actualValue);
    const formattedThresholdValue = this.formatMetricValue(
      metric,
      thresholdValue
    );

    return `
ALERT TRIGGERED: ${alertName}

Alert Details:
- Metric: ${metricDisplayName}
- Current Value: ${formattedActualValue}
- Threshold: ${formattedThresholdValue}
- Organization: ${organizationName}
- Time: ${new Date().toLocaleString()}

This alert was triggered because your ${metricDisplayName.toLowerCase()} has exceeded the configured threshold.
Please review your usage and take appropriate action if necessary.

View Dashboard: ${process.env.FRONTEND_URL || "https://llmonitor.com"}/alerts
Manage Settings: ${
      process.env.FRONTEND_URL || "https://llmonitor.com"
    }/settings/alerts

---
This email was sent by LLMonitor Alert System.
    `.trim();
  }

  private getMetricDisplayName(metric: string): string {
    const displayNames: Record<string, string> = {
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
