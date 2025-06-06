import {
  getDashboardStats,
  getCostAnalysis,
  getGlobalStats,
} from "@/controllers/analytics";
import { endpointBuilder, HttpMethod } from "@/lib/endpoint-builder";
import { HonoApp } from "@/types";
import { Hono } from "hono";

const analyticsRouter = new Hono<HonoApp>();

endpointBuilder({
  path: "/dashboard",
  method: HttpMethod.GET,
  body: getDashboardStats,
  isPrivate: true,
})(analyticsRouter);

endpointBuilder({
  path: "/cost-analysis",
  method: HttpMethod.GET,
  body: getCostAnalysis,
  isPrivate: true,
})(analyticsRouter);

endpointBuilder({
  path: "/global-stats",
  method: HttpMethod.GET,
  body: getGlobalStats,
  isPrivate: false,
})(analyticsRouter);

export { analyticsRouter };
