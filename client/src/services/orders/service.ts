import type {
  ColumnDataType,
  FilterDetails,
} from "@/components/data-table-filter/core/types";
import { http } from "@/lib/http";
import type { PaginatedResponse } from "@/types";
import type { Order } from "@/types/order";

export const OrdersService = {
  async GetOrders(params: {
    filters: FilterDetails<ColumnDataType>[];
    pageIndex: number;
    pageSize: number;
  }) {
    const { data } = await http.get<PaginatedResponse<Order>>(
      "/orders/internal",
      {
        params,
      }
    );
    return data;
  },
} as const;
