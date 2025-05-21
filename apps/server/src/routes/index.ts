import { HonoApp } from "@/types";
import { Hono } from "hono";
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
];
