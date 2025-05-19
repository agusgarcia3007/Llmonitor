import { ORDER_CHANNELS, ORDER_STATUSES } from "@/lib/constants";
import { z } from "zod";

export const orderSchema = z.object({
  externalId: z.string(),
  channel: z.enum(ORDER_CHANNELS),
  status: z.enum(ORDER_STATUSES),
  items: z.array(
    z.object({
      sku: z.string(),
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  shipping: z.object({
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
  }),
});
