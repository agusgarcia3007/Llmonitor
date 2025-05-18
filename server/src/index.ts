import { Hono } from "hono";
import { auth } from "./lib/auth";

const app = new Hono();

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

export default {
  fetch: app.fetch,
  port: 4444,
};
