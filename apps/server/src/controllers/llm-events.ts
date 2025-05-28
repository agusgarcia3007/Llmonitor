import { Context } from "hono";
import { LogLlmEventSchema } from "../schemas/llm-events";
import { db } from "@/db";
import { llm_event } from "@/db/schema";
import { parseQueryParams, createSortHelpers } from "@/lib/query-params";
import { desc, asc, eq, count } from "drizzle-orm";
import { SORT_ORDER } from "@/lib/endpoint-builder";
import { calculateCost } from "@/lib/cost-calculator";
import { getActiveOrganization } from "@/lib/utils";

const SORTABLE_FIELDS = [
  "created_at",
  "model",
  "provider",
  "status",
  "latency_ms",
  "cost_usd",
  "score",
] as const;

const { allowedSortFields, sortFieldMap } = createSortHelpers(
  llm_event,
  SORTABLE_FIELDS
);

export const logEvent = async (c: Context) => {
  const body = await c.req.json();
  const session = await c.get("session");
  const data = LogLlmEventSchema.parse(body);

  let organizationId = session.organizationId;
  if (!organizationId && session.userId) {
    const org = await getActiveOrganization(session.userId);
    organizationId = org?.id;
  }

  if (!organizationId) {
    return c.json(
      { success: false, message: "No organization found for this user" },
      400
    );
  }

  const calculatedCost =
    data.cost_usd ||
    calculateCost(
      data.provider,
      data.model,
      data.prompt_tokens || 0,
      data.completion_tokens || 0
    );

  const insert = await db.insert(llm_event).values({
    ...data,
    cost_usd: calculatedCost,
    organization_id: organizationId,
  });

  return c.json({
    success: true,
    message: "LLM event logged successfully",
    data: insert,
  });
};

export const getEvents = async (c: Context) => {
  const session = await c.get("session");
  const { limit, offset, sort, order } = parseQueryParams(
    c,
    allowedSortFields as unknown as string[]
  );

  const orderBy =
    order === SORT_ORDER.ASC
      ? asc(sortFieldMap[sort as keyof typeof sortFieldMap])
      : desc(sortFieldMap[sort as keyof typeof sortFieldMap]);

  const [events] = await Promise.all([
    db
      .select()
      .from(llm_event)
      .where(eq(llm_event.organization_id, session.organizationId))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(llm_event)
      .where(eq(llm_event.organization_id, session.organizationId)),
  ]);

  return c.json({
    success: true,
    data: events,
    pagination: {
      total: Number(count),
      limit,
      offset,
    },
  });
};
