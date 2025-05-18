import { HonoApp } from "@/types";
import { Hono } from "hono";

interface RouteObject {
  path: string;
  handler: Hono<HonoApp>;
}

export const ROUTES: RouteObject[] = [];
