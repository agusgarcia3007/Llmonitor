import { auth } from "@/lib/auth";
import { Context, Next } from "hono";

export const sessionMiddleware = async (c: Context, next: Next) => {
  if (c.req.header("x-api-key")) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
};

export const authMiddleware = async (c: Context, next: Next) => {
  if (c.req.header("x-api-key")) {
    return next();
  }
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  return next();
};
