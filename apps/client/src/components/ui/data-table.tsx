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
  FieldType,
} from "@/components/ui/advanced-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  X,
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
  onFiltersChange?: (advancedFilters: Record<string, unknown>) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  filtersConfig?: AdvancedFilterField[];
  filtersButton?: React.ReactNode;
}

const formatFilterValue = (
  field: AdvancedFilterField,
  value: unknown
): string => {
  switch (field.type) {
    case FieldType.TEXT:
    case FieldType.NUMBER:
      return String(value);

    case FieldType.SELECT: {
      const selectValue = value as string[];
      return selectValue.join(", ");
    }

    case FieldType.DATE_RANGE: {
      const dateValue = value as { from?: string; to?: string };
      if (dateValue.from && dateValue.to) {
        return `${new Date(dateValue.from).toLocaleDateString()} - ${new Date(
          dateValue.to
        ).toLocaleDateString()}`;
      } else if (dateValue.from) {
        return `From ${new Date(dateValue.from).toLocaleDateString()}`;
      } else if (dateValue.to) {
        return `Until ${new Date(dateValue.to).toLocaleDateString()}`;
      }
      return "";
    }

    case FieldType.SLIDER: {
      const sliderValue = value as number[];
      if (sliderValue && sliderValue.length === 2) {
        return `${sliderValue[0]} - ${sliderValue[1]}`;
      }
      return String(value);
    }

    default:
      return String(value);
  }
};

const parseAppliedFiltersForDisplay = (
  appliedFilters: Record<string, unknown>,
  fields: AdvancedFilterField[]
) => {
  const displayFilters: Array<{
    key: string;
    label: string;
    value: string;
    field: AdvancedFilterField;
  }> = [];

  // Group related filters (like latencyMin/latencyMax)
  const processedKeys = new Set<string>();

  Object.entries(appliedFilters).forEach(([key, value]) => {
    if (processedKeys.has(key) || value === undefined || value === null) return;

    // Handle range filters (Min/Max pairs)
    if (key.endsWith("Min")) {
      const baseKey = key.replace("Min", "");
      const maxKey = `${baseKey}Max`;
      const minValue = value;
      const maxValue = appliedFilters[maxKey];

      const field = fields.find(
        (f) =>
          f.id === baseKey ||
          f.id === `${baseKey}_ms` ||
          f.id === `${baseKey}_usd` ||
          (f.backendKey &&
            (f.backendKey === baseKey ||
              f.backendKey === key.replace("Min", "")))
      );

      if (field && (minValue !== undefined || maxValue !== undefined)) {
        const rangeValue = [
          minValue || field.min || 0,
          maxValue || field.max || 100,
        ];
        displayFilters.push({
          key: baseKey,
          label: field.label,
          value: formatFilterValue(
            { ...field, type: FieldType.SLIDER },
            rangeValue
          ),
          field,
        });
        processedKeys.add(key);
        processedKeys.add(maxKey);
      }
      return;
    }

    if (key.endsWith("Max")) {
      const baseKey = key.replace("Max", "");
      const minKey = `${baseKey}Min`;

      if (!processedKeys.has(minKey)) {
        // Handle Max without Min
        const field = fields.find(
          (f) =>
            f.id === baseKey ||
            f.id === `${baseKey}_ms` ||
            f.id === `${baseKey}_usd` ||
            (f.backendKey &&
              (f.backendKey === baseKey ||
                f.backendKey === key.replace("Max", "")))
        );

        if (field) {
          const rangeValue = [field.min || 0, value];
          displayFilters.push({
            key: baseKey,
            label: field.label,
            value: formatFilterValue(
              { ...field, type: FieldType.SLIDER },
              rangeValue
            ),
            field,
          });
          processedKeys.add(key);
        }
      }
      return;
    }

    // Handle date range filters
    if (key.endsWith("From") || key.endsWith("To")) {
      const baseKey = key.replace(/From$|To$/, "");
      const fromKey = `${baseKey}From`;
      const toKey = `${baseKey}To`;

      if (!processedKeys.has(fromKey) && !processedKeys.has(toKey)) {
        const fromValue = appliedFilters[fromKey];
        const toValue = appliedFilters[toKey];

        const field = fields.find(
          (f) => f.id === baseKey || (f.backendKey && f.backendKey === baseKey)
        );

        if (field && (fromValue || toValue)) {
          const dateValue = {
            from: fromValue as string,
            to: toValue as string,
          };
          displayFilters.push({
            key: baseKey,
            label: field.label,
            value: formatFilterValue(
              { ...field, type: FieldType.DATE_RANGE },
              dateValue
            ),
            field,
          });
          processedKeys.add(fromKey);
          processedKeys.add(toKey);
        }
      }
      return;
    }

    // Handle regular filters
    const field = fields.find((f) => f.id === key || f.backendKey === key);
    if (field) {
      let displayValue = value;

      // For arrays, show as comma-separated
      if (Array.isArray(value) && value.length > 0) {
        displayValue = value;
      } else if (typeof value === "string" && value.trim() !== "") {
        displayValue = value;
      } else {
        return; // Skip empty values
      }

      displayFilters.push({
        key,
        label: field.label,
        value: formatFilterValue(field, displayValue),
        field,
      });
    }
  });

  return displayFilters;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  onPaginationChange,
  onSortingChange,
  onFiltersChange,
  pageSizeOptions = [10, 20, 30, 40, 50],
  isLoading = false,
  filtersConfig,
  filtersButton,
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

  React.useEffect(() => {
    if (onSortingChange) {
      onSortingChange(sorting);
    }
  }, [sorting, onSortingChange]);

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

  const handleFiltersChange = React.useCallback(
    (filters: Record<string, unknown>) => {
      setAppliedFilters(filters);
      if (onFiltersChange) {
        onFiltersChange(filters);
      }
    },
    [onFiltersChange]
  );

  const handleRemoveFilter = React.useCallback(
    (filterKey: string) => {
      const newFilters = { ...appliedFilters };

      // Handle range filters - remove both min and max
      if (filterKey === "latency" || filterKey === "cost") {
        delete newFilters[`${filterKey}Min`];
        delete newFilters[`${filterKey}Max`];
      } else if (filterKey === "date") {
        delete newFilters.dateFrom;
        delete newFilters.dateTo;
      } else {
        delete newFilters[filterKey];
        // Also try backend key variants
        delete newFilters[`${filterKey}Min`];
        delete newFilters[`${filterKey}Max`];
        delete newFilters[`${filterKey}From`];
        delete newFilters[`${filterKey}To`];
      }

      handleFiltersChange(newFilters);
    },
    [appliedFilters, handleFiltersChange]
  );

  const displayFilters = filtersConfig
    ? parseAppliedFiltersForDisplay(appliedFilters, filtersConfig)
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
            {isLoading ? (
              skeletonRows
            ) : table.getRowModel().rows?.length ? (
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
