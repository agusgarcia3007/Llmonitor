import { createOrder, getOrders } from "@/controllers/orders";
import { endpointBuilder, HttpMethod } from "@/lib/endpoint-builder";
import { HonoApp } from "@/types";
import { Hono } from "hono";

export const internalOrdersRoutes = new Hono<HonoApp>();

endpointBuilder({
  path: "/internal",
  method: HttpMethod.POST,
  isPrivate: true,
  body: createOrder,
})(internalOrdersRoutes);

endpointBuilder({
  path: "/internal",
  method: HttpMethod.GET,
  isPrivate: true,
  body: getOrders,
})(internalOrdersRoutes);
