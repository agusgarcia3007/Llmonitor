import { Context } from "hono";
import { SORT_ORDER } from "./endpoint-builder";
import { eq, sql, inArray, gte, lte } from "drizzle-orm";
import { llm_event } from "@/db/schema";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;
const DEFAULT_SORT = "created_at";
const DEFAULT_ORDER = SORT_ORDER.DESC;

export function parseQueryParams(
  c: Context,
  allowedSortFields: string[] = []
): {
  limit: number;
  offset: number;
  sort: string;
  order: SORT_ORDER;
} {
  const q = c.req.query();
  let limit = parseInt(q["limit"] ?? "");
  if (isNaN(limit) || limit < 1 || limit > MAX_LIMIT) limit = DEFAULT_LIMIT;

  let offset = parseInt(q["offset"] ?? "");
  if (isNaN(offset) || offset < 0) offset = DEFAULT_OFFSET;

  let sort = q["sort"] ?? DEFAULT_SORT;
  if (allowedSortFields.length && !allowedSortFields.includes(sort))
    sort = DEFAULT_SORT;

  let order = (q["order"] ?? DEFAULT_ORDER).toLowerCase();
  if (order !== SORT_ORDER.ASC && order !== SORT_ORDER.DESC)
    order = DEFAULT_ORDER;

  return {
    limit,
    offset,
    sort,
    order: order as SORT_ORDER,
  };
}

export function createSortHelpers<
  T extends Record<string, any>,
  K extends readonly string[]
>(
  table: T,
  fields: K
): {
  allowedSortFields: K;
  sortFieldMap: Record<K[number], any>;
} {
  return {
    allowedSortFields: fields,
    sortFieldMap: Object.fromEntries(
      fields.map((f) => [f, table[f]])
    ) as Record<K[number], any>,
  };
}

export function parseEventFilters(c: Context) {
  const q = c.req.query();

  // Helper function to parse array parameters
  const parseArrayParam = (
    param: string | string[] | undefined
  ): string[] | undefined => {
    if (!param) return undefined;
    if (Array.isArray(param)) return param;
    return param.split(",").filter(Boolean);
  };

  // Helper function to parse date parameters
  const parseDateParam = (param: string | undefined): Date | undefined => {
    if (!param) return undefined;
    const date = new Date(param);
    return isNaN(date.getTime()) ? undefined : date;
  };

  return {
    model: q["model"] ?? undefined,
    provider: parseArrayParam(q["provider"]),
    status: q["status"] ? Number(q["status"]) : undefined,
    version_tag: q["version_tag"] ?? undefined,
    session_id: q["session_id"] ?? undefined,
    latencyMin: q["latencyMin"] ? Number(q["latencyMin"]) : undefined,
    latencyMax: q["latencyMax"] ? Number(q["latencyMax"]) : undefined,
    costMin: q["costMin"] ? Number(q["costMin"]) : undefined,
    costMax: q["costMax"] ? Number(q["costMax"]) : undefined,
    dateFrom: parseDateParam(q["dateFrom"]),
    dateTo: parseDateParam(q["dateTo"]),
  };
}

export function buildEventWhereConditions({
  organizationId,
  apiKey,
  filters,
}: {
  organizationId: string;
  apiKey?: string;
  filters: ReturnType<typeof parseEventFilters>;
}) {
  const whereConditions = [eq(llm_event.organization_id, organizationId)];

  if (apiKey) {
    whereConditions.push(sql`metadata->>'apiKey' = ${apiKey}`);
  }
  if (filters.model) {
    whereConditions.push(eq(llm_event.model, filters.model));
  }
  if (filters.provider && filters.provider.length > 0) {
    if (filters.provider.length === 1) {
      whereConditions.push(eq(llm_event.provider, filters.provider[0]));
    } else {
      whereConditions.push(inArray(llm_event.provider, filters.provider));
    }
  }
  if (filters.status !== undefined) {
    whereConditions.push(eq(llm_event.status, filters.status));
  }
  if (filters.version_tag) {
    whereConditions.push(eq(llm_event.version_tag, filters.version_tag));
  }
  if (filters.session_id) {
    whereConditions.push(eq(llm_event.session_id, filters.session_id));
  }
  if (filters.latencyMin !== undefined) {
    whereConditions.push(gte(llm_event.latency_ms, filters.latencyMin));
  }
  if (filters.latencyMax !== undefined) {
    whereConditions.push(lte(llm_event.latency_ms, filters.latencyMax));
  }
  if (filters.costMin !== undefined) {
    whereConditions.push(gte(llm_event.cost_usd, filters.costMin));
  }
  if (filters.costMax !== undefined) {
    whereConditions.push(lte(llm_event.cost_usd, filters.costMax));
  }
  if (filters.dateFrom) {
    whereConditions.push(gte(llm_event.created_at, filters.dateFrom));
  }
  if (filters.dateTo) {
    whereConditions.push(lte(llm_event.created_at, filters.dateTo));
  }
  return whereConditions;
}
