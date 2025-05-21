import { Context } from "hono";
import { SORT_ORDER } from "./endpoint-builder";

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
