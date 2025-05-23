import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useLLMEventsQuery } from "@/services/llm-events/query";
import type { GetEventsParams, LLMEvent } from "@/types";
import { createFileRoute } from "@tanstack/react-router";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { formatDistance } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_dashboard/logs")({
  component: LogsPage,
});

export function LogsPage() {
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const params = useMemo<GetEventsParams>(() => {
    if (sorting.length > 0) {
      return {
        sort: sorting[0].id,
        order: sorting[0].desc ? "desc" : "asc",
        limit: pagination.pageSize,
        offset: (pagination.page - 1) * pagination.pageSize,
      };
    }

    const filters: Record<string, string> = {};
    if (columnFilters.length > 0) {
      columnFilters.forEach((filter) => {
        if (filter.id === "model" || filter.id === "provider") {
          filters[filter.id] = filter.value as string;
        }
      });
    }

    return {
      ...filters,
      limit: pagination.pageSize,
      offset: (pagination.page - 1) * pagination.pageSize,
    };
  }, [pagination, sorting, columnFilters]);

  const { data, isLoading } = useLLMEventsQuery(params);

  const columns = useMemo<ColumnDef<LLMEvent>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("id")}</div>
        ),
      },
      {
        accessorKey: "model",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Model
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "provider",
        header: "Provider",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as number;
          const statusMap: Record<
            number,
            {
              label: string;
              variant: "default" | "destructive" | "outline" | "secondary";
            }
          > = {
            200: { label: "Success", variant: "default" },
            400: { label: "Error", variant: "destructive" },
            // Agregar otros estados según sea necesario
          };

          const statusInfo = statusMap[status] || {
            label: `Status ${status}`,
            variant: "outline",
          };

          return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
        },
      },
      {
        accessorKey: "prompt_tokens",
        header: "Prompt Tokens",
      },
      {
        accessorKey: "completion_tokens",
        header: "Completion Tokens",
      },
      {
        accessorKey: "latency_ms",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Latency (ms)
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const latency = row.getValue("latency_ms") as number;
          return latency ? `${latency.toFixed(0)} ms` : "-";
        },
      },
      {
        accessorKey: "cost_usd",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Cost
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const cost = row.getValue("cost_usd") as number;
          return cost ? `$${cost.toFixed(4)}` : "-";
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("created_at"));
          return (
            <div title={date.toLocaleString()}>
              {formatDistance(date, new Date(), { addSuffix: true })}
            </div>
          );
        },
      },
    ],
    []
  );

  // Metadatos para la tabla
  const tableData = data?.data || [];
  const meta = data
    ? {
        page: Math.floor(data.pagination.offset / data.pagination.limit) + 1,
        pageSize: data.pagination.limit,
        pageCount: Math.ceil(data.pagination.total / data.pagination.limit),
        total: data.pagination.total,
      }
    : undefined;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Logs</h1>
      <DataTable
        columns={columns}
        data={tableData}
        meta={meta}
        isLoading={isLoading}
        onPaginationChange={(page, pageSize) =>
          setPagination({ page, pageSize })
        }
        onSortingChange={setSorting}
        onFiltersChange={setColumnFilters}
        searchColumn="model"
        searchPlaceholder="Filter by model..."
      />
    </div>
  );
}
