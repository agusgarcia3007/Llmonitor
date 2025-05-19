import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/schemas/orders";
import { Context } from "hono";
import { Prisma } from "../../generated/prisma";

export async function createOrder(c: Context) {
  const session = c.get("session");
  const body = await c.req.json();
  const parsed = orderSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Invalid order format", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const tenantId = session?.activeOrganizationId;

  if (!tenantId) {
    return c.json({ error: "Active organization not found" }, { status: 403 });
  }

  const { externalId, channel, status, items, customer, shipping } =
    parsed.data;

  const order = await prisma.order.create({
    data: {
      externalId,
      channel,
      status,
      items,
      customer,
      shipping,
      tenantId,
    },
  });

  return c.json({
    success: true,
    orderId: order.id,
  });
}

export async function getOrders(c: Context) {
  const session = c.get("session");
  const tenantId = session?.activeOrganizationId;

  if (!tenantId) {
    return c.json({ error: "Active organization not found" }, { status: 403 });
  }

  const { searchParams } = new URL(c.req.url);

  const channel = searchParams.get("channel") ?? undefined; // "tiendanube" | "mercadolibre"
  const status = searchParams.get("status") ?? undefined; // "pending", "processing", "shipped", etc.
  const from = searchParams.get("from"); // ISO string (start date)
  const to = searchParams.get("to"); // ISO string (end date)
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Prisma.OrderWhereInput = {
    tenantId,
  };

  if (channel) where.channel = channel;
  if (status) where.status = status;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return c.json({
    success: true,
    total,
    data: orders,
    pagination: {
      limit,
      offset,
      hasMore: offset + orders.length < total,
      pageCount: Math.ceil(total / limit),
    },
  });
}
