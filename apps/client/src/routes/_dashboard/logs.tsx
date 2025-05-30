import {
  FieldType,
  type AdvancedFilterField,
} from "@/components/ui/advanced-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  llmEventsQueryOptions,
  useLLMEventsQuery,
} from "@/services/llm-events/query";
import type { GetEventsParams, LLMEvent } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef, type SortingState } from "@tanstack/react-table";
import { formatDistance } from "date-fns";
import { ArrowUpDown, Eye, ListFilter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_dashboard/logs")({
  component: LogsPage,
});

export function LogsPage() {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, unknown>>(
    {}
  );
  const queryClient = useQueryClient();

  const params = useMemo<GetEventsParams>(() => {
    return {
      limit: pagination.pageSize,
      offset: (pagination.page - 1) * pagination.pageSize,
      sort: sorting[0]?.id,
      order: sorting[0]?.desc ? "desc" : "asc",
      ...appliedFilters,
    } as GetEventsParams;
  }, [pagination, sorting, appliedFilters]);

  const { data, isLoading } = useLLMEventsQuery(params);

  useEffect(() => {
    if (data) {
      const nextPage = pagination.page + 1;
      if (nextPage <= Math.ceil(data.pagination.total / pagination.pageSize)) {
        const nextPageParams = {
          ...params,
          offset: nextPage * pagination.pageSize - pagination.pageSize,
        };
        queryClient.prefetchQuery(llmEventsQueryOptions(nextPageParams));
      }
    }
  }, [data, pagination.page, pagination.pageSize, params, queryClient]);

  const filtersConfig: AdvancedFilterField[] = [
    {
      id: "model",
      label: "Model",
      type: FieldType.TEXT,
    },
    {
      id: "provider",
      label: "Provider",
      type: FieldType.SELECT,
      options: ["openai", "anthropic", "deepseek"],
    },
    { id: "date", label: "Date", type: FieldType.DATE_RANGE },
    {
      id: "latency_ms",
      label: "Latency (ms)",
      type: FieldType.SLIDER,
      min: 0,
      max: 10000,
      step: 100,
    },
    {
      id: "cost_usd",
      label: "Cost (USD)",
      type: FieldType.SLIDER,
      min: 0,
      max: 10,
      step: 0.01,
    },
  ];

  const tableData = data?.data || [];
  const meta = data
    ? {
        page: Math.floor(data.pagination.offset / data.pagination.limit) + 1,
        pageSize: data.pagination.limit,
        pageCount: Math.ceil(data.pagination.total / data.pagination.limit),
        total: data.pagination.total,
      }
    : undefined;

  const handleFiltersChange = (advancedFilters: Record<string, unknown>) => {
    setAppliedFilters(advancedFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

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
            {t("logsTable.id")}
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
            {t("logsTable.model")}
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "provider",
        header: t("logsTable.provider"),
        cell: ({ row }) => {
          const provider = row.getValue("provider") as string;
          const bgDict: Record<string, string> = {
            openai: "bg-green-200 text-green-800",
            anthropic: "bg-orange-200 text-orange-800",
            deepseek: "bg-blue-200 text-blue-800",
            cohere: "bg-red-200 text-red-800",
            google: "bg-yellow-200 text-yellow-800",
            custom: "bg-gray-200 text-gray-800",
          };
          return (
            <Badge variant="secondary" className={bgDict[provider]}>
              {provider}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("logsTable.status"),
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
            500: { label: "Error", variant: "destructive" },
          };

          const statusInfo = statusMap[status] || {
            label: `${status}`,
            variant: "outline",
          };

          return (
            <Badge variant={statusInfo.variant}>
              {status} {statusInfo.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: "prompt",
        header: t("logsTable.prompt"),
        cell: ({ row }) => (
          <TableExpandableCell
            value={row.getValue("prompt")}
            type="text"
            modalTitle={t("logsTable.prompt")}
          />
        ),
      },
      {
        accessorKey: "completion",
        header: t("logsTable.completion"),
        cell: ({ row }) => (
          <TableExpandableCell
            value={row.getValue("completion")}
            type="text"
            modalTitle={t("logsTable.completion")}
          />
        ),
      },
      {
        accessorKey: "prompt_tokens",
        header: t("logsTable.promptTokens"),
      },
      {
        accessorKey: "completion_tokens",
        header: t("logsTable.completionTokens"),
      },
      {
        accessorKey: "latency_ms",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("logsTable.latency")}
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
            {t("logsTable.cost")}
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const cost = row.getValue("cost_usd") as number;
          return cost ? `$${cost.toFixed(6)}` : "-";
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
            {t("logsTable.createdAt")}
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
      {
        accessorKey: "metadata",
        header: t("logsTable.metadata"),
        cell: ({ row }) => (
          <TableExpandableCell
            value={row.getValue("metadata")}
            type="json"
            modalTitle={t("logsTable.metadata")}
          />
        ),
      },
    ],
    [t]
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4 gap-4">
        <h1 className="text-2xl font-bold">Logs</h1>
      </div>
      <DataTable
        columns={columns}
        data={tableData}
        meta={meta}
        isLoading={isLoading}
        onPaginationChange={(page, pageSize) =>
          setPagination({ page, pageSize })
        }
        onSortingChange={setSorting}
        onFiltersChange={handleFiltersChange}
        filtersConfig={filtersConfig}
        filtersButton={
          <Button variant="outline" size="sm">
            <ListFilter className="w-4 h-4" />
            Filters
          </Button>
        }
      />
    </div>
  );
}

function TableExpandableCell({
  value,
  type,
  modalTitle,
}: {
  value: unknown;
  type: "text" | "json";
  modalTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const isEmpty =
    value == null ||
    (typeof value === "string" && value.trim().length === 0) ||
    (type === "json" &&
      typeof value === "object" &&
      Object.keys(value as object).length === 0);
  if (isEmpty) {
    return <span>-</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="line-clamp-1 max-w-[200px]">
        {type === "json" ? JSON.stringify(value) : (value as string)}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{modalTitle}</DialogTitle>
          {type === "json" ? (
            <pre className="whitespace-pre-wrap text-xs max-h-[60vh] overflow-auto bg-muted rounded p-2">
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            <code className="whitespace-pre-wrap bg-muted rounded p-2 text-sm max-h-[60vh] overflow-auto">
              {value as string}
            </code>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
