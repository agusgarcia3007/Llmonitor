export interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
    pageCount: number;
  };
}

export type Locale = "en" | "es";
