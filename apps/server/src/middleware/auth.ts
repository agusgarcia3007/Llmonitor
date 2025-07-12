import { auth } from "@/lib/auth";
import { getActiveOrganization, getActiveSubscription } from "@/lib/utils";
import { Context, Next } from "hono";

export const sessionMiddleware = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  // Enrich session with subscription data
  const [organization, sub] = await Promise.all([
    getActiveOrganization(session.user.id),
    getActiveSubscription(session.user.id),
  ]);

  const enrichedSession = {
    ...session.session,
    activeOrganizationId:
      organization?.id ?? session.session.activeOrganizationId,
    subscriptionPlan: sub?.plan ?? null,
    subscriptionStatus: sub?.status ?? null,
    subscriptionPeriodEnd: sub?.periodEnd ? sub.periodEnd.toISOString() : null,
  };

  c.set("user", session.user);
  c.set("session", enrichedSession);
  return next();
};

export const authMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  return next();
};

export const subscriptionMiddleware = async (c: Context, next: Next) => {
  const session = c.get("session");
  const user = c.get("user");

  if (!user || !session) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const subscriptionStatus = session.subscriptionStatus;

  // Check if user has an active subscription (including trial)
  const hasActiveSubscription =
    subscriptionStatus === "active" || subscriptionStatus === "trialing";

  if (!hasActiveSubscription) {
    return c.json(
      {
        error: "Active subscription required. Please upgrade your plan.",
      },
      402
    ); // 402 Payment Required for subscription issues
  }

  return next();
};
