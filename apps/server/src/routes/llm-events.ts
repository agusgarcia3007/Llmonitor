import { logEvent, getEvents } from "@/controllers/llm-events";
import { endpointBuilder, HttpMethod } from "@/lib/endpoint-builder";
import { HonoApp } from "@/types";
import { Hono } from "hono";

const llmEventsRouter = new Hono<HonoApp>();

endpointBuilder({
  path: "/",
  method: HttpMethod.POST,
  body: logEvent,
  isPrivate: true,
})(llmEventsRouter);

endpointBuilder({
  path: "/",
  method: HttpMethod.GET,
  body: getEvents,
  isPrivate: true,
})(llmEventsRouter);

export { llmEventsRouter };
