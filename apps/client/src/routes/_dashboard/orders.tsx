import { orderColumns } from "@/components/orders/columns";
import { orderColumnsConfig } from "@/components/orders/columns-config";
import { DataTable } from "@/components/ui/data-table";
import { useOrdersQuery } from "@/services/orders/query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/orders")({
  component: Orders,
});

function Orders() {
  const { data: orders, isLoading } = useOrdersQuery({
    filters: [],
    pageIndex: 0,
    pageSize: 20,
  });

  return (
    <DataTable
      columns={orderColumns}
      columnsConfig={orderColumnsConfig}
      data={orders?.data ?? []}
      pageCount={orders?.pagination.pageCount ?? 0}
      pageIndex={0}
      isLoading={isLoading}
    />
  );
}
