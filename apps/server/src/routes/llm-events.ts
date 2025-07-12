import { logEvent, getEvents } from "@/controllers/llm-events";
import { endpointBuilder, HttpMethod } from "@/lib/endpoint-builder";
import { HonoApp } from "@/types";
import { Hono } from "hono";

const llmEventsRouter = new Hono<HonoApp>();

// Allow free tier users to log events up to their limit
endpointBuilder({
  path: "/",
  method: HttpMethod.POST,
  body: logEvent,
  isPrivate: true,
  requiresSubscription: true, // Subscription required (includes trial)
})(llmEventsRouter);

// Viewing events requires subscription for now
endpointBuilder({
  path: "/",
  method: HttpMethod.GET,
  body: getEvents,
  isPrivate: true,
  requiresSubscription: true, // Subscription required (includes trial)
})(llmEventsRouter);

export { llmEventsRouter };
