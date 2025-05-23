"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Reusable interface for server-side data
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  pageSizeOptions?: number[];
  searchColumn?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
  searchColumn,
  searchPlaceholder = "Filter...",
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Debounced search handler
  const debouncedSearchHandler = React.useCallback(
    (value: string, column: string) => {
      const timeoutId = setTimeout(() => {
        setColumnFilters((prev) => {
          const newFilters = prev.filter((filter) => filter.id !== column);
          if (value) {
            newFilters.push({
              id: column,
              value,
            });
          }
          if (onFiltersChange) {
            onFiltersChange(newFilters);
          }
          return newFilters;
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [onFiltersChange]
  );

  // Handle sorting changes
  React.useEffect(() => {
    if (onSortingChange) {
      onSortingChange(sorting);
    }
  }, [sorting, onSortingChange]);

  // Handle filter changes
  React.useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(columnFilters);
    }
  }, [columnFilters, onFiltersChange]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: meta
        ? {
            pageIndex: meta.page - 1,
            pageSize: meta.pageSize,
          }
        : undefined,
    },
    enableRowSelection: true,
    manualPagination: Boolean(meta),
    manualSorting: Boolean(onSortingChange),
    manualFiltering: Boolean(onFiltersChange),
    pageCount: meta?.pageCount || -1,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  });

  // Loading state UI
  if (isLoading) {
    return (
      <div className="space-y-4">
        {searchColumn && (
          <div className="flex items-center py-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <Skeleton className="ml-auto h-8 w-24" />
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {columns.map((column, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-6 w-full" />
                </TableHead>
              ))}
            </TableHeader>
            <TableBody>
              {Array.from({ length: meta?.pageSize || 10 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {meta && (
          <div className="flex items-center justify-between px-2">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center space-x-6 lg:space-x-8">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      {searchColumn && (
        <div className="flex items-center py-4">
          <Input
            placeholder={searchPlaceholder}
            className="max-w-sm"
            onChange={(e) => {
              debouncedSearchHandler(e.target.value, searchColumn);
            }}
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      {meta && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of {meta.total}{" "}
            row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${meta.pageSize}`}
                onValueChange={(value) => {
                  if (onPaginationChange) {
                    onPaginationChange(1, Number(value));
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={meta.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {meta.page} of {meta.pageCount}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  if (onPaginationChange) {
                    onPaginationChange(1, meta.pageSize);
                  }
                }}
                disabled={meta.page <= 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => {
                  if (onPaginationChange) {
                    onPaginationChange(meta.page - 1, meta.pageSize);
                  }
                }}
                disabled={meta.page <= 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => {
                  if (onPaginationChange) {
                    onPaginationChange(meta.page + 1, meta.pageSize);
                  }
                }}
                disabled={meta.page >= meta.pageCount}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  if (onPaginationChange) {
                    onPaginationChange(meta.pageCount, meta.pageSize);
                  }
                }}
                disabled={meta.page >= meta.pageCount}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
