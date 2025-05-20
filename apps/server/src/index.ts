import { auth } from "@/lib/auth";
import { CORS_OPTIONS } from "@/lib/constants";
import { sessionMiddleware } from "@/middleware/auth";
import { ROUTES } from "@/routes";
import { HonoApp } from "@/types";
import { serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono<HonoApp>()
  .use(cors(CORS_OPTIONS))
  .use(logger())
  .use(prettyJSON())
  .use(sessionMiddleware);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.get("/", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

ROUTES.forEach((route) => {
  app.route(route.path, route.handler);
});

app.onError((err, c) => {
  console.error(err);
  return c.text("Internal Server Error", 500);
});

const port = parseInt(Bun.env.PORT || "3000", 10);
console.log(`🚀 Server running at http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
