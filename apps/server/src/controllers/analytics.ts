import { Context } from "hono";
import { db } from "@/db";
import { llm_event } from "@/db/schema";
import { eq, sql, gte, desc, and, count } from "drizzle-orm";

export const getDashboardStats = async (c: Context) => {
  const session = await c.get("session");
  const days = parseInt(c.req.query("days") || "1");
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const whereClause = and(
    eq(llm_event.organization_id, session.activeOrganizationId),
    gte(llm_event.created_at, startDate)
  );

  const timeFormat =
    days === 1
      ? sql<string>`date_trunc('hour', created_at)`
      : sql<string>`date_trunc('day', created_at)`;

  const [
    totalEvents,
    totalCost,
    avgLatency,
    errorRate,
    topModels,
    costByDay,
    latencyByDay,
    eventsActivity,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(llm_event)
      .where(whereClause),

    db
      .select({ total: sql<number>`sum(cost_usd)` })
      .from(llm_event)
      .where(whereClause),

    db
      .select({ avg: sql<number>`avg(latency_ms)` })
      .from(llm_event)
      .where(whereClause),

    db
      .select({
        total: sql<number>`count(*)`,
        errors: sql<number>`count(*) filter (where status >= 400)`,
      })
      .from(llm_event)
      .where(whereClause),

    db
      .select({
        model: llm_event.model,
        provider: llm_event.provider,
        count: sql<number>`count(*)`,
        cost: sql<number>`sum(cost_usd)`,
      })
      .from(llm_event)
      .where(whereClause)
      .groupBy(llm_event.model, llm_event.provider)
      .orderBy(desc(sql`count(*)`))
      .limit(10),

    db
      .select({
        date: sql<string>`date(created_at)`,
        cost: sql<number>`sum(cost_usd)`,
      })
      .from(llm_event)
      .where(whereClause)
      .groupBy(sql`date(created_at)`)
      .orderBy(sql`date(created_at)`)
      .limit(50),

    db
      .select({
        date: sql<string>`date(created_at)`,
        avg_latency: sql<number>`avg(latency_ms)`,
      })
      .from(llm_event)
      .where(whereClause)
      .groupBy(sql`date(created_at)`)
      .orderBy(sql`date(created_at)`)
      .limit(50),

    db
      .select({
        period: timeFormat,
        events: sql<number>`count(*)`,
      })
      .from(llm_event)
      .where(whereClause)
      .groupBy(timeFormat)
      .orderBy(timeFormat)
      .limit(50),
  ]);

  const errorRatePercent =
    totalEvents[0]?.count && totalEvents[0].count > 0
      ? ((errorRate[0]?.errors || 0) / totalEvents[0].count) * 100
      : 0;

  return c.json({
    success: true,
    data: {
      overview: {
        totalEvents: Number(totalEvents[0]?.count || 0),
        totalCost: Number(totalCost[0]?.total || 0),
        avgLatency: Number(avgLatency[0]?.avg || 0),
        errorRate: Number(errorRatePercent || 0),
      },
      topModels,
      charts: {
        costByDay,
        latencyByDay,
        eventsActivity,
      },
    },
  });
};

export const getCostAnalysis = async (c: Context) => {
  const session = await c.get("session");
  const days = parseInt(c.req.query("days") || "30");
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const whereClause = and(
    eq(llm_event.organization_id, session.activeOrganizationId),
    gte(llm_event.created_at, startDate)
  );

  const [costByProvider, costTrend, topCostlyRequests] = await Promise.all([
    db
      .select({
        provider: llm_event.provider,
        cost: sql<number>`sum(cost_usd)`,
        count: sql<number>`count(*)`,
        avg_cost: sql<number>`avg(cost_usd)`,
      })
      .from(llm_event)
      .where(whereClause)
      .groupBy(llm_event.provider)
      .orderBy(desc(sql`sum(cost_usd)`)),

    db
      .select({
        date: sql<string>`date(created_at)`,
        cost: sql<number>`sum(cost_usd)`,
        count: sql<number>`count(*)`,
      })
      .from(llm_event)
      .where(whereClause)
      .groupBy(sql`date(created_at)`)
      .orderBy(sql`date(created_at)`)
      .limit(50),

    db
      .select({
        id: llm_event.id,
        model: llm_event.model,
        provider: llm_event.provider,
        cost_usd: llm_event.cost_usd,
        prompt_tokens: llm_event.prompt_tokens,
        completion_tokens: llm_event.completion_tokens,
        created_at: llm_event.created_at,
      })
      .from(llm_event)
      .where(whereClause)
      .orderBy(desc(llm_event.cost_usd))
      .limit(10),
  ]);

  return c.json({
    success: true,
    data: {
      costByProvider,
      costTrend,
      topCostlyRequests,
    },
  });
};

export const getGlobalStats = async (c: Context) => {
  const totalEvents = await db.select({ count: count() }).from(llm_event);

  return c.json({
    success: true,
    data: {
      totalEvents: Number(totalEvents[0]?.count || 0),
    },
  });
};
