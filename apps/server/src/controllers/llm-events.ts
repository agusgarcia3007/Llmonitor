import { Context } from "hono";
import { LogLlmEventSchema } from "../schemas/llm-events";
import { db } from "@/db";
import { llm_event, type LLMEventMetadata } from "@/db/schema";
import { apikey, member } from "@/db/schema";
import {
  parseQueryParams,
  createSortHelpers,
  parseEventFilters,
  buildEventWhereConditions,
} from "@/lib/query-params";
import { desc, asc, eq, count, and, sql } from "drizzle-orm";
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
  const apiKey = c.req.header("x-api-key");

  let organizationId =
    body.projectId || body.organizationId || session?.organizationId;

  if (!organizationId && apiKey) {
    const keyRecord = await db
      .select()
      .from(apikey)
      .where(eq(apikey.key, apiKey))
      .limit(1);

    if (keyRecord.length) {
      const userId = keyRecord[0].userId;

      const org = await getActiveOrganization(userId);
      organizationId = org?.id;
    }
  }

  if (!organizationId) {
    return c.json(
      {
        success: false,
        message: "No organization found for this user",
      },
      400
    );
  }

  if (session && session.userId && organizationId) {
    const memberRow = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, session.userId),
          eq(member.organizationId, organizationId)
        )
      );

    if (!memberRow.length) {
      return c.json(
        {
          success: false,
          message: "User is not a member of this organization",
        },
        403
      );
    }
  }

  const calculatedCost =
    data.cost_usd ||
    calculateCost(
      data.provider,
      data.model,
      data.prompt_tokens || 0,
      data.completion_tokens || 0
    );

  const metadata: LLMEventMetadata = {
    ...(data.metadata || {}),
    apiKey,
  };

  const insert = await db.insert(llm_event).values({
    id: crypto.randomUUID(),
    ...data,
    cost_usd: calculatedCost,
    organization_id: organizationId,
    metadata,
  });

  return c.json({
    success: true,
    message: "LLM event logged successfully",
    data: insert,
  });
};

export const getEvents = async (c: Context) => {
  const session = await c.get("session");

  if (!session.activeOrganizationId) {
    return c.json(
      {
        success: false,
        message: "No active organization found",
      },
      400
    );
  }

  const { limit, offset, sort, order } = parseQueryParams(
    c,
    allowedSortFields as unknown as string[]
  );

  const apiKey = c.req.query("apiKey");
  const filters = parseEventFilters(c);
  const organizationId = session.activeOrganizationId;

  const orderBy =
    order === SORT_ORDER.ASC
      ? asc(sortFieldMap[sort as keyof typeof sortFieldMap])
      : desc(sortFieldMap[sort as keyof typeof sortFieldMap]);

  const whereConditions = buildEventWhereConditions({
    organizationId,
    apiKey,
    filters,
  });

  try {
    const [events, countResult] = await Promise.all([
      db
        .select()
        .from(llm_event)
        .where(and(...whereConditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(llm_event)
        .where(and(...whereConditions)),
    ]);

    const total = countResult[0]?.count ?? 0;

    return c.json({
      success: true,
      data: events,
      pagination: {
        total: Number(total),
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch events",
      },
      500
    );
  }
};
