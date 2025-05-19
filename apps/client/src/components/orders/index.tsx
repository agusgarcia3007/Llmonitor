import { useOrdersQuery } from "@/services/orders/query";
import { DataTable } from "../ui/data-table";
import { orderColumns } from "./columns";
import { orderColumnsConfig } from "./columns-config";

export function Orders() {
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
