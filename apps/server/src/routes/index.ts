import { HonoApp } from "@/types";
import { Hono } from "hono";
import { alertsRouter } from "./alerts";
import { analyticsRouter } from "./analytics";
import { llmEventsRouter } from "./llm-events";

interface RouteObject {
  path: string;
  handler: Hono<HonoApp>;
}

export const ROUTES: RouteObject[] = [
  {
    path: "/llm-events",
    handler: llmEventsRouter,
  },
  {
    path: "/analytics",
    handler: analyticsRouter,
  },
  {
    path: "/alerts",
    handler: alertsRouter,
  },
];
