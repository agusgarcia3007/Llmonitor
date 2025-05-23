import { and, eq, gte, lte, desc, between, sql, inArray } from "drizzle-orm";
import { db } from "@/db";
import { alert_config, alert_trigger, llm_event } from "@/db/schema";
import {
  AlertEvaluationResult,
  AlertTriggerContext,
  AlertFilters,
} from "@/types/alerts";
import { randomUUID } from "crypto";

export class AlertsEvaluator {
  async evaluateAlerts(
    organizationId: string
  ): Promise<AlertEvaluationResult[]> {
    const activeAlerts = await db
      .select()
      .from(alert_config)
      .where(
        and(
          eq(alert_config.organization_id, organizationId),
          eq(alert_config.is_active, true)
        )
      );

    const results: AlertEvaluationResult[] = [];

    for (const alert of activeAlerts) {
      try {
        const result = await this.evaluateAlert(alert);
        results.push(result);

        if (result.is_triggered) {
          await this.triggerAlert(
            alert.id,
            result.metric_value,
            result.context
          );
        }
      } catch (error) {
        console.error(`Error evaluating alert ${alert.id}:`, error);
      }
    }

    return results;
  }

  private async evaluateAlert(
    alert: typeof alert_config.$inferSelect
  ): Promise<AlertEvaluationResult> {
    const timeWindowStart = new Date(
      Date.now() - alert.time_window * 60 * 1000
    );
    const metricValue = await this.calculateMetric(
      alert.organization_id,
      alert.metric,
      timeWindowStart,
      alert.filters as AlertFilters
    );

    const isTriggered = this.checkThreshold(
      metricValue,
      alert.threshold_value,
      alert.threshold_operator
    );

    const context: AlertTriggerContext = {
      metric_value: metricValue,
      threshold_value: alert.threshold_value,
      time_window: alert.time_window,
      filters_applied: alert.filters as AlertFilters,
    };

    return {
      alert_config_id: alert.id,
      is_triggered: isTriggered,
      metric_value: metricValue,
      context,
    };
  }

  private async calculateMetric(
    organizationId: string,
    metric: string,
    timeWindowStart: Date,
    filters?: AlertFilters
  ): Promise<number> {
    let whereConditions = [
      eq(llm_event.organization_id, organizationId),
      gte(llm_event.created_at, timeWindowStart),
    ];

    if (filters?.provider?.length) {
      whereConditions.push(inArray(llm_event.provider, filters.provider));
    }
    if (filters?.model?.length) {
      whereConditions.push(inArray(llm_event.model, filters.model));
    }
    if (filters?.version_tag?.length) {
      whereConditions.push(inArray(llm_event.version_tag, filters.version_tag));
    }

    const query = db
      .select()
      .from(llm_event)
      .where(and(...whereConditions));

    switch (metric) {
      case "cost_per_hour":
      case "cost_per_day":
      case "cost_per_week":
      case "cost_per_month":
        return this.calculateCostMetric(query, metric);

      case "requests_per_minute":
      case "requests_per_hour":
        return this.calculateRequestMetric(query, metric);

      case "error_rate":
        return this.calculateErrorRate(query);

      case "latency_p95":
      case "latency_p99":
        return this.calculateLatencyPercentile(query, metric);

      case "token_usage_per_hour":
      case "token_usage_per_day":
        return this.calculateTokenUsage(query, metric);

      default:
        throw new Error(`Unknown metric: ${metric}`);
    }
  }

  private async calculateCostMetric(
    query: any,
    metric: string
  ): Promise<number> {
    const events = await query;
    const totalCost = events.reduce(
      (sum: number, event: any) => sum + (event.cost_usd || 0),
      0
    );

    const divisors = {
      cost_per_hour: 1,
      cost_per_day: 24,
      cost_per_week: 24 * 7,
      cost_per_month: 24 * 30,
    };

    return totalCost / (divisors[metric as keyof typeof divisors] || 1);
  }

  private async calculateRequestMetric(
    query: any,
    metric: string
  ): Promise<number> {
    const events = await query;
    const requestCount = events.length;

    return metric === "requests_per_minute" ? requestCount / 60 : requestCount;
  }

  private async calculateErrorRate(query: any): Promise<number> {
    const events = await query;
    if (events.length === 0) return 0;

    const errorCount = events.filter(
      (event: any) => event.status >= 400
    ).length;
    return (errorCount / events.length) * 100;
  }

  private async calculateLatencyPercentile(
    query: any,
    metric: string
  ): Promise<number> {
    const events = await query;
    const latencies = events
      .map((event: any) => event.latency_ms)
      .filter((latency: number) => latency != null)
      .sort((a: number, b: number) => a - b);

    if (latencies.length === 0) return 0;

    const percentile = metric === "latency_p95" ? 0.95 : 0.99;
    const index = Math.ceil(latencies.length * percentile) - 1;
    return latencies[index] || 0;
  }

  private async calculateTokenUsage(
    query: any,
    metric: string
  ): Promise<number> {
    const events = await query;
    const totalTokens = events.reduce(
      (sum: number, event: any) =>
        sum + (event.prompt_tokens || 0) + (event.completion_tokens || 0),
      0
    );

    return metric === "token_usage_per_hour" ? totalTokens : totalTokens / 24;
  }

  private checkThreshold(
    value: number,
    threshold: number,
    operator: string
  ): boolean {
    switch (operator) {
      case "gt":
        return value > threshold;
      case "lt":
        return value < threshold;
      case "gte":
        return value >= threshold;
      case "lte":
        return value <= threshold;
      case "eq":
        return value === threshold;
      case "ne":
        return value !== threshold;
      default:
        return false;
    }
  }

  private async triggerAlert(
    alertConfigId: string,
    metricValue: number,
    context: AlertTriggerContext
  ): Promise<void> {
    const existingTrigger = await db
      .select()
      .from(alert_trigger)
      .where(
        and(
          eq(alert_trigger.alert_config_id, alertConfigId),
          eq(alert_trigger.status, "triggered")
        )
      )
      .orderBy(desc(alert_trigger.triggered_at))
      .limit(1);

    if (existingTrigger.length > 0) {
      const timeSinceLastTrigger =
        Date.now() - existingTrigger[0].triggered_at.getTime();
      if (timeSinceLastTrigger < 5 * 60 * 1000) {
        return;
      }
    }

    await db.insert(alert_trigger).values({
      id: randomUUID(),
      alert_config_id: alertConfigId,
      metric_value: metricValue,
      context: context as any,
      status: "triggered",
    });
  }
}
