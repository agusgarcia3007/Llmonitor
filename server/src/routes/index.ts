import { HonoApp } from "@/types";
import { Hono } from "hono";
import { internalOrdersRoutes } from "./orders/internal";

interface RouteObject {
  path: string;
  handler: Hono<HonoApp>;
}

export const ROUTES: RouteObject[] = [
  {
    path: "/orders",
    handler: internalOrdersRoutes,
  },
];
