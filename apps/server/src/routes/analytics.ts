import {
  getDashboardStats,
  getCostAnalysis,
  getGlobalStats,
} from "@/controllers/analytics";
import { endpointBuilder, HttpMethod } from "@/lib/endpoint-builder";
import { HonoApp } from "@/types";
import { Hono } from "hono";

const analyticsRouter = new Hono<HonoApp>();

// Premium users (including trial) can see dashboard stats
endpointBuilder({
  path: "/dashboard",
  method: HttpMethod.GET,
  body: getDashboardStats,
  isPrivate: true,
  requiresSubscription: true, // Subscription required (includes trial)
})(analyticsRouter);

// Advanced cost analysis requires subscription
endpointBuilder({
  path: "/cost-analysis",
  method: HttpMethod.GET,
  body: getCostAnalysis,
  isPrivate: true,
  requiresSubscription: true, // Subscription required (includes trial)
})(analyticsRouter);

// Global stats - public endpoint
endpointBuilder({
  path: "/global-stats",
  method: HttpMethod.GET,
  body: getGlobalStats,
  isPrivate: false, // Public endpoint
})(analyticsRouter);

export { analyticsRouter };
