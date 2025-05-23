import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FiltersState } from "@/components/data-table-filter/core/types";

export type FiltersToParamsOptions = {
  filters: FiltersState;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
};

export function filtersToParams({
  filters,
  limit,
  offset,
  sort,
  order,
}: FiltersToParamsOptions): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (typeof limit === "number") params.limit = limit;
  if (typeof offset === "number") params.offset = offset;
  if (sort) params.sort = sort;
  if (order) params.order = order;
  for (const { columnId, values, operator } of filters) {
    if (!values || values.length === 0) continue;
    if (["model", "provider", "id", "status"].includes(columnId)) {
      params[columnId] = values[0];
      continue;
    }
    if (["latency_ms", "cost_usd"].includes(columnId)) {
      if (operator === "is between" && values.length === 2) {
        params[`${columnId}_min`] = values[0];
        params[`${columnId}_max`] = values[1];
      } else {
        params[columnId] = values[0];
      }
      continue;
    }
    if (columnId === "created_at") {
      if (operator === "is between" && values.length === 2) {
        params["created_at_from"] = values[0];
        params["created_at_to"] = values[1];
      } else {
        params["created_at"] = values[0];
      }
      continue;
    }
  }
  return params;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
