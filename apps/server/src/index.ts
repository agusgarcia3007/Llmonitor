import { AlertScheduler } from "@/lib/alert-scheduler";
import { auth } from "@/lib/auth";
import { CORS_OPTIONS } from "@/lib/constants";
import { sessionMiddleware } from "@/middleware/auth";
import { HonoApp } from "@/types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { ROUTES } from "./routes";

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

const alertScheduler = new AlertScheduler();
alertScheduler.start(5);

process.on("SIGTERM", () => {
  console.log("Received SIGTERM, stopping alert scheduler...");
  alertScheduler.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, stopping alert scheduler...");
  alertScheduler.stop();
  process.exit(0);
});

const port = parseInt(Bun.env.PORT || "4444", 10);

export default {
  fetch: app.fetch,
  port,
};
