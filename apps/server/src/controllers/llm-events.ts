import { Context } from "hono";
import { LogLlmEventSchema } from "../schemas/llm-events";
import { db } from "@/db";
import { llm_event } from "@/db/schema";

export const logEvent = async (c: Context) => {
  const body = await c.req.json();
  const session = await c.get("session");
  const data = LogLlmEventSchema.parse(body);

  const insert = await db.insert(llm_event).values({
    ...data,
    organization_id: session.organizationId,
  });

  return c.json({
    success: true,
    message: "LLM event logged successfully",
    data: insert,
  });
};
