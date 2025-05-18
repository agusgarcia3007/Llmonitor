import { queryOptions, useQuery } from "@tanstack/react-query";
import { OrdersService } from "./service";
import type { OrdersQueryParams } from "@/types/order";

export const ordersQueryOptions = (params: OrdersQueryParams) =>
  queryOptions({
    queryKey: ["orders", params.filters, params.pageIndex, params.pageSize],
    queryFn: () =>
      OrdersService.GetOrders({
        filters: params.filters,
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
      }),
  });

export const useOrdersQuery = (params: OrdersQueryParams) => {
  return useQuery(ordersQueryOptions(params));
};
