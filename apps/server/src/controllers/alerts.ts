import { Context } from "hono";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { alert_config } from "@/db/schema";
import { randomUUID } from "crypto";
import { z } from "zod";

// Schema for alert sections
const alertSectionSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string(),
      enabled: z.boolean(),
      threshold: z.number().optional(),
      frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
      projectIds: z.array(z.string()).optional(),
    })
  ),
});

// GET /alerts/sections - Get alert sections configuration
export const getAlertSections = async (c: Context) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const sections = await db
    .select()
    .from(alert_config)
    .where(
      and(
        eq(alert_config.organization_id, session.activeOrganizationId),
        eq(alert_config.type, "section")
      )
    );

  // Transform database records to frontend format
  const transformedSections = sections.map((section) => ({
    id: section.name, // errors, latency, cost, summary
    enabled: section.is_active,
    threshold: section.threshold_value,
    frequency:
      section.time_window === 86400
        ? "daily"
        : section.time_window === 604800
        ? "weekly"
        : "monthly",
    projectIds: (section.filters as any)?.projectIds || [],
  }));

  return c.json({ sections: transformedSections });
};

// POST /alerts/sections - Save alert sections configuration
export const saveAlertSections = async (c: Context) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session?.activeOrganizationId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const data = alertSectionSchema.parse(body);

    // Delete existing sections for this organization
    await db
      .delete(alert_config)
      .where(
        and(
          eq(alert_config.organization_id, session.activeOrganizationId),
          eq(alert_config.type, "section")
        )
      );

    // Insert new sections
    for (const section of data.sections) {
      const timeWindow =
        section.frequency === "daily"
          ? 86400 // 24 hours in seconds
          : section.frequency === "weekly"
          ? 604800 // 7 days in seconds
          : 2592000; // 30 days in seconds

      await db.insert(alert_config).values({
        id: randomUUID(),
        organization_id: session.activeOrganizationId,
        name: section.id,
        description: `Alert section for ${section.id}`,
        type: "section",
        metric: section.id,
        threshold_value: section.threshold || 0,
        threshold_operator: "gt",
        time_window: timeWindow,
        is_active: section.enabled,
        notification_channels: ["email"],
        filters: { projectIds: section.projectIds || [] },
        created_by: user.id,
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving alert sections:", error);
    if (error instanceof z.ZodError) {
      return c.json(
        { error: "Invalid request data", details: error.errors },
        400
      );
    }
    return c.json({ error: "Internal server error" }, 500);
  }
};
