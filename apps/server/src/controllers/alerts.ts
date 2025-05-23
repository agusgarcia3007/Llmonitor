import { Hono } from "hono";
import { and, eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { alert_config, webhook_config, alert_trigger } from "@/db/schema";
import { HonoApp } from "@/types";
import { AlertsEvaluator } from "@/lib/alerts-evaluator";
import { WebhookService } from "@/lib/webhook-service";
import { randomUUID } from "crypto";
import { z } from "zod";
import {
  createAlertSchema,
  createWebhookSchema,
  updateAlertSchema,
  updateWebhookSchema,
} from "@/schemas/alerts";

const alertsApp = new Hono<HonoApp>();

const alertsEvaluator = new AlertsEvaluator();
const webhookService = new WebhookService();

alertsApp.get("/", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const alerts = await db
    .select()
    .from(alert_config)
    .where(eq(alert_config.organization_id, session.activeOrganizationId))
    .orderBy(desc(alert_config.created_at));

  return c.json({ alerts });
});

alertsApp.post("/", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const data = createAlertSchema.parse(body);

    const alertId = randomUUID();

    await db.insert(alert_config).values({
      id: alertId,
      organization_id: session.activeOrganizationId,
      name: data.name,
      description: data.description,
      type: data.type,
      metric: data.metric,
      threshold_value: data.threshold_value,
      threshold_operator: data.threshold_operator,
      time_window: data.time_window,
      notification_channels: data.notification_channels as any,
      filters: data.filters as any,
      created_by: user.id,
    });

    const alert = await db
      .select()
      .from(alert_config)
      .where(eq(alert_config.id, alertId))
      .limit(1);

    return c.json({ alert: alert[0] }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request data", details: error.errors },
        400
      );
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

alertsApp.get("/:id", async (c) => {
  const user = c.get("user");
  const session = c.get("session");
  const alertId = c.req.param("id");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const alert = await db
    .select()
    .from(alert_config)
    .where(
      and(
        eq(alert_config.id, alertId),
        eq(alert_config.organization_id, session.activeOrganizationId)
      )
    )
    .limit(1);

  if (!alert.length) {
    return c.json({ error: "Alert not found" }, 404);
  }

  return c.json({ alert: alert[0] });
});

alertsApp.put("/:id", async (c) => {
  const user = c.get("user");
  const session = c.get("session");
  const alertId = c.req.param("id");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const data = updateAlertSchema.parse(body);

    const existingAlert = await db
      .select()
      .from(alert_config)
      .where(
        and(
          eq(alert_config.id, alertId),
          eq(alert_config.organization_id, session.activeOrganizationId)
        )
      )
      .limit(1);

    if (!existingAlert.length) {
      return c.json({ error: "Alert not found" }, 404);
    }

    await db
      .update(alert_config)
      .set({
        ...data,
        notification_channels: data.notification_channels as any,
        filters: data.filters as any,
        updated_at: new Date(),
      })
      .where(eq(alert_config.id, alertId));

    const updatedAlert = await db
      .select()
      .from(alert_config)
      .where(eq(alert_config.id, alertId))
      .limit(1);

    return c.json({ alert: updatedAlert[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request data", details: error.errors },
        400
      );
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

alertsApp.delete("/:id", async (c) => {
  const user = c.get("user");
  const session = c.get("session");
  const alertId = c.req.param("id");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await db
    .delete(alert_config)
    .where(
      and(
        eq(alert_config.id, alertId),
        eq(alert_config.organization_id, session.activeOrganizationId)
      )
    );

  return c.json({ success: true });
});

alertsApp.get("/:id/triggers", async (c) => {
  const user = c.get("user");
  const session = c.get("session");
  const alertId = c.req.param("id");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const triggers = await db
    .select()
    .from(alert_trigger)
    .innerJoin(alert_config, eq(alert_trigger.alert_config_id, alert_config.id))
    .where(
      and(
        eq(alert_trigger.alert_config_id, alertId),
        eq(alert_config.organization_id, session.activeOrganizationId)
      )
    )
    .orderBy(desc(alert_trigger.triggered_at))
    .limit(50);

  return c.json({ triggers: triggers.map((t) => t.alert_trigger) });
});

alertsApp.post("/evaluate", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const results = await alertsEvaluator.evaluateAlerts(
    session.activeOrganizationId
  );

  return c.json({ results });
});

alertsApp.get("/webhooks", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const webhooks = await db
    .select()
    .from(webhook_config)
    .where(eq(webhook_config.organization_id, session.activeOrganizationId))
    .orderBy(desc(webhook_config.created_at));

  return c.json({ webhooks });
});

alertsApp.post("/webhooks", async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const data = createWebhookSchema.parse(body);

    const webhookId = randomUUID();

    await db.insert(webhook_config).values({
      id: webhookId,
      organization_id: session.activeOrganizationId,
      name: data.name,
      url: data.url,
      secret: data.secret,
      headers: data.headers as any,
      events: data.events as any,
    });

    const webhook = await db
      .select()
      .from(webhook_config)
      .where(eq(webhook_config.id, webhookId))
      .limit(1);

    return c.json({ webhook: webhook[0] }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request data", details: error.errors },
        400
      );
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

alertsApp.put("/webhooks/:id", async (c) => {
  const user = c.get("user");
  const session = c.get("session");
  const webhookId = c.req.param("id");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const data = updateWebhookSchema.parse(body);

    const existingWebhook = await db
      .select()
      .from(webhook_config)
      .where(
        and(
          eq(webhook_config.id, webhookId),
          eq(webhook_config.organization_id, session.activeOrganizationId)
        )
      )
      .limit(1);

    if (!existingWebhook.length) {
      return c.json({ error: "Webhook not found" }, 404);
    }

    await db
      .update(webhook_config)
      .set({
        ...data,
        headers: data.headers as any,
        events: data.events as any,
        updated_at: new Date(),
      })
      .where(eq(webhook_config.id, webhookId));

    const updatedWebhook = await db
      .select()
      .from(webhook_config)
      .where(eq(webhook_config.id, webhookId))
      .limit(1);

    return c.json({ webhook: updatedWebhook[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request data", details: error.errors },
        400
      );
    }
    return c.json({ error: "Internal server error" }, 500);
  }
});

alertsApp.delete("/webhooks/:id", async (c) => {
  const user = c.get("user");
  const session = c.get("session");
  const webhookId = c.req.param("id");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await db
    .delete(webhook_config)
    .where(
      and(
        eq(webhook_config.id, webhookId),
        eq(webhook_config.organization_id, session.activeOrganizationId)
      )
    );

  return c.json({ success: true });
});

export { alertsApp };
