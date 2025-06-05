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

import {
  AdvancedFilters,
  type AdvancedFilterField,
} from "@/components/ui/advanced-filters";
import { Badge } from "@/components/ui/badge";
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
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Checkbox } from "./checkbox";
import { type ExtendedFilterField } from "@/lib/filter-utils";

export function createSortableHeader(title: string) {
  return ({
    column,
  }: {
    column: {
      toggleSorting: (ascending?: boolean) => void;
      getIsSorted: () => false | "asc" | "desc";
    };
  }) => (
    <Button
      variant="ghost"
      className="flex items-center gap-2"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown className="h-4 w-4" />
      ) : (
        <ArrowUpDown className="h-4 w-4" />
      )}
    </Button>
  );
}

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
  onFiltersChange?: (advancedFilters: Record<string, unknown>) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  filtersConfig?: ExtendedFilterField[];
  filtersButton?: React.ReactNode;
  selectable?: boolean;
  parseFiltersForDisplay?: (
    appliedFilters: Record<string, unknown>,
    fields: ExtendedFilterField[]
  ) => Array<{
    key: string;
    label: string;
    value: string;
    field: AdvancedFilterField;
  }>;
  onRemoveFilter?: (
    filterKey: string,
    appliedFilters: Record<string, unknown>
  ) => Record<string, unknown>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  onPaginationChange,
  onSortingChange,
  selectable = false,
  onFiltersChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
  isLoading = false,
  filtersConfig,
  filtersButton,
  parseFiltersForDisplay,
  onRemoveFilter,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [appliedFilters, setAppliedFilters] = React.useState<
    Record<string, unknown>
  >({});

  const [idSearch, setIdSearch] = React.useState<string>("");
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  React.useEffect(() => {
    if (onSortingChange) {
      onSortingChange(sorting);
    }
  }, [sorting, onSortingChange]);

  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
    enableRowSelection: selectable,
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

  const handleFiltersChange = React.useCallback(
    (filters: Record<string, unknown>) => {
      setAppliedFilters(filters);
      if (onFiltersChange) {
        onFiltersChange(filters);
      }
    },
    [onFiltersChange]
  );

  const handleIdSearchChange = React.useCallback(
    (value: string) => {
      setIdSearch(value);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        const updatedFilters = { ...appliedFilters };
        if (value.trim()) {
          updatedFilters.id = value.trim();
        } else {
          delete updatedFilters.id;
        }
        setAppliedFilters(updatedFilters);
        if (onFiltersChange) {
          onFiltersChange(updatedFilters);
        }
      }, 300);
    },
    [appliedFilters, onFiltersChange]
  );

  const handleRemoveFilter = React.useCallback(
    (filterKey: string) => {
      let newFilters = { ...appliedFilters };

      if (onRemoveFilter) {
        newFilters = onRemoveFilter(filterKey, appliedFilters);
      } else {
        delete newFilters[filterKey];
      }

      handleFiltersChange(newFilters);
    },
    [appliedFilters, handleFiltersChange, onRemoveFilter]
  );

  const displayFilters =
    filtersConfig && parseFiltersForDisplay
      ? parseFiltersForDisplay(appliedFilters, filtersConfig)
      : [];

  const skeletonRows = Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={`skeleton-${i}`}>
      {columns.map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-6 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));

  return (
    <div className="space-y-4">
      {filtersConfig && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID..."
                value={idSearch}
                onChange={(e) => handleIdSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
            <AdvancedFilters
              appliedFilters={appliedFilters}
              onChange={handleFiltersChange}
              fields={filtersConfig}
              filtersButton={filtersButton}
            />

            {displayFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFiltersChange({})}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>

          {displayFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {displayFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  <span className="text-xs font-medium">{filter.label}:</span>
                  <span className="text-xs">{filter.value}</span>
                  <button
                    onClick={() => handleRemoveFilter(filter.key)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow>
                {selectable && (
                  <TableHead>
                    <Checkbox
                      checked={table.getIsAllRowsSelected()}
                      onCheckedChange={(checked) =>
                        table.toggleAllPageRowsSelected(!!checked)
                      }
                    />
                  </TableHead>
                )}
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
            {isLoading ? (
              skeletonRows
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(checked) =>
                          row.toggleSelected(!!checked)
                        }
                      />
                    </TableCell>
                  )}
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
