"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";
import React from "react";
import {
  useDataTableFilters,
  DataTableFilter,
} from "@/components/data-table-filter";
import type {
  Column as DTFColumn,
  FiltersState,
  FilterModel,
  ColumnDataType,
  ColumnConfig,
} from "@/components/data-table-filter/core/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  //   eslint-disable-next-line
  columnsConfig: ReadonlyArray<ColumnConfig<T, any, any, any>>;
  data: T[];
  loading?: boolean;
  isLoading?: boolean;
  pageIndex?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  columnsConfig,
  data,
  loading = false,
  isLoading = false,
  pageIndex = 0,
  pageCount = 1,
  onPageChange,
}: DataTableProps<T>) {
  const {
    columns: filterColumns,
    filters,
    actions,
    strategy,
  } = useDataTableFilters({
    strategy: "client",
    data,
    columnsConfig,
  });

  const enhancedColumns = React.useMemo<ColumnDef<T>[]>(
    () => createTSTColumns({ columns, configs: filterColumns }),
    [columns, filterColumns]
  );

  const table = useReactTable({
    data: data ?? [],
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: {
        pageIndex,
        pageSize: data.length,
      },
      columnFilters: createTSTFilters(filters),
    },
  });

  return (
    <div className="space-y-4">
      <DataTableFilter
        columns={filterColumns}
        filters={filters}
        actions={actions}
        strategy={strategy}
      />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, rowIdx) => (
              <TableRow key={"skeleton-" + rowIdx}>
                {columns.map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : loading ? (
            <TableRow>
              <TableCell colSpan={columns.length}>Loading...</TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pageCount > 1 && onPageChange && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pageIndex > 0) onPageChange(pageIndex - 1);
                }}
                aria-disabled={pageIndex === 0}
                tabIndex={pageIndex === 0 ? -1 : 0}
                style={
                  pageIndex === 0 ? { pointerEvents: "none", opacity: 0.5 } : {}
                }
              />
            </PaginationItem>
            {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
              let page = i;
              if (pageCount > 5) {
                if (pageIndex <= 2) {
                  page = i;
                } else if (pageIndex >= pageCount - 3) {
                  page = pageCount - 5 + i;
                } else {
                  page = pageIndex - 2 + i;
                }
              }
              if (page < 0 || page >= pageCount) return null;
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={pageIndex === page}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(page);
                    }}
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pageIndex < pageCount - 1) onPageChange(pageIndex + 1);
                }}
                aria-disabled={pageIndex === pageCount - 1}
                tabIndex={pageIndex === pageCount - 1 ? -1 : 0}
                style={
                  pageIndex === pageCount - 1
                    ? { pointerEvents: "none", opacity: 0.5 }
                    : {}
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function createTSTFilters(filters: FiltersState): ColumnFiltersState {
  return filters.map((f) => ({ id: f.columnId, value: f }));
}

function createTSTColumns<TData>({
  columns,
  configs,
}: {
  columns: ColumnDef<TData>[];
  configs: DTFColumn<TData>[];
}): ColumnDef<TData>[] {
  return columns.map((col) => {
    const cfg = configs.find((c) => c.id === col.id);
    if (!cfg) return col;

    return {
      ...col,
      filterFn: (row, columnId, filterValue) => {
        const fm = filterValue as FilterModel<ColumnDataType> | undefined;
        if (!fm) return true;
        const { operator, values, type } = fm;
        // eslint-disable-next-line
        const cell = row.getValue(columnId) as any;
        switch (type) {
          case "option": {
            if (values.length === 0) return true;
            const includes = values.includes(cell);
            if (operator === "is" || operator === "is any of") return includes;
            if (operator === "is not" || operator === "is none of")
              return !includes;
            return true;
          }
          case "multiOption": {
            if (!Array.isArray(cell)) return false;
            if (values.length === 0) return true;
            // eslint-disable-next-line
            const hasAny = cell.some((v: any) => values.includes(v));
            const hasAll = values.every((v) => cell.includes(v));
            switch (operator) {
              case "include":
              case "include any of":
                return hasAny;
              case "include all of":
                return hasAll;
              case "exclude":
              case "exclude if any of":
                return !hasAny;
              case "exclude if all":
                return !hasAll;
              default:
                return true;
            }
          }
          case "text": {
            const cellStr = (cell ?? "").toString().toLowerCase();
            const search = (values[0] ?? "").toString().toLowerCase();
            if (operator === "contains") return cellStr.includes(search);
            if (operator === "does not contain")
              return !cellStr.includes(search);
            return true;
          }
          case "number": {
            const num = Number(cell);
            if (values.length === 0 || Number.isNaN(num)) return true;
            const a = Number(values[0]);
            const b = Number(values[1]);
            switch (operator) {
              case "is":
                return num === a;
              case "is not":
                return num !== a;
              case "is less than":
                return num < a;
              case "is greater than or equal to":
                return num >= a;
              case "is greater than":
                return num > a;
              case "is less than or equal to":
                return num <= a;
              case "is between":
                return num >= a && num <= b;
              case "is not between":
                return !(num >= a && num <= b);
              default:
                return true;
            }
          }
          case "date": {
            const time = new Date(cell).getTime();
            if (values.length === 0 || isNaN(time)) return true;
            const st = values[0]
              ? // eslint-disable-next-line
                new Date(values[0] as any).getTime()
              : undefined;
            const ed = values[1]
              ? // eslint-disable-next-line
                new Date(values[1] as any).getTime()
              : undefined;
            switch (operator) {
              case "is":
                return time === st;
              case "is not":
                return time !== st;
              case "is before":
                return time < (st ?? 0);
              case "is after":
                return time > (st ?? 0);
              case "is on or before":
                return time <= (st ?? 0);
              case "is on or after":
                return time >= (st ?? 0);
              case "is between":
                return (
                  (st === undefined || time >= st) &&
                  (ed === undefined || time <= ed)
                );
              case "is not between":
                return !(
                  (st === undefined || time >= st) &&
                  (ed === undefined || time <= ed)
                );
              default:
                return true;
            }
          }
          default:
            return true;
        }
      },
    } as ColumnDef<TData>;
  });
}
