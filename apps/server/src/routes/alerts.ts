import { getAlertSections, saveAlertSections } from "@/controllers/alerts";
import { endpointBuilder, HttpMethod } from "@/lib/endpoint-builder";
import { HonoApp } from "@/types";
import { Hono } from "hono";

const alertsRouter = new Hono<HonoApp>();

// Premium users (including trial) can view alerts
endpointBuilder({
  path: "/sections",
  method: HttpMethod.GET,
  body: getAlertSections,
  isPrivate: true,
  requiresSubscription: true, // Subscription required (includes trial)
})(alertsRouter);

// Premium users (including trial) can create alerts
endpointBuilder({
  path: "/sections",
  method: HttpMethod.POST,
  body: saveAlertSections,
  isPrivate: true,
  requiresSubscription: true, // Subscription required (includes trial)
})(alertsRouter);

export { alertsRouter };
