import type {
  ColumnDataType,
  FilterDetails,
} from "@/components/data-table-filter/core/types";

export type Order = {
  id: string;
  externalId: string;
  channel: "tiendanube" | "mercadolibre";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: {
    sku: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shipping: {
    address: string;
    city: string;
    postalCode: string;
  };
  tenantId: string;
  createdAt: string; // o Date si ya lo parseás
  updatedAt: string; // o Date si ya lo parseás
};

export type OrdersQueryParams = {
  filters: FilterDetails<ColumnDataType>[];
  pageIndex: number;
  pageSize: number;
};
