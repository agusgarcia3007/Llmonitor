import { createColumnConfigHelper } from "@/components/data-table-filter/core/filters";
import type { Order } from "@/types/order";
import { FileTextIcon, TagIcon, StoreIcon, CalendarIcon } from "lucide-react";

const dtf = createColumnConfigHelper<Order>();

export const orderColumnsConfig = [
  dtf
    .text()
    .id("externalId")
    .accessor((row) => row.externalId)
    .displayName("External ID")
    .icon(FileTextIcon)
    .build(),
  dtf
    .option()
    .id("status")
    .accessor((row) => row.status)
    .displayName("Status")
    .icon(TagIcon)
    .options([
      { label: "Pending", value: "pending" },
      { label: "Processing", value: "processing" },
      { label: "Shipped", value: "shipped" },
      { label: "Delivered", value: "delivered" },
      { label: "Cancelled", value: "cancelled" },
    ])
    .build(),
  dtf
    .option()
    .id("channel")
    .accessor((row) => row.channel)
    .displayName("Channel")
    .icon(StoreIcon)
    .options([
      { label: "Tiendanube", value: "tiendanube" },
      { label: "Mercado Libre", value: "mercadolibre" },
    ])
    .build(),
  dtf
    .date()
    .id("createdAt")
    .accessor((row) => new Date(row.createdAt))
    .displayName("Created At")
    .icon(CalendarIcon)
    .build(),
];
