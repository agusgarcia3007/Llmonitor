import type { ColumnDef } from "@tanstack/react-table";
import type { Order } from "@/types/order"; // asumimos que tenés este tipo

export const orderColumns: ColumnDef<Order>[] = [
  {
    header: "External ID",
    accessorKey: "externalId",
  },
  {
    header: "Status",
    accessorKey: "status",
  },
  {
    header: "Channel",
    accessorKey: "channel",
  },
  {
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("en-US"),
  },
];
