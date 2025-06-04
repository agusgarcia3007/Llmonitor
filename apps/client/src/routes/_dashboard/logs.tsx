import { type AdvancedFilterField } from "@/components/ui/advanced-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  CommonFilters,
  createSelectFilter,
  createNumberFilter,
} from "@/lib/filter-utils";
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
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
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
    CommonFilters.model(),
    CommonFilters.provider([
      "openai",
      "anthropic",
      "deepseek",
      "cohere",
      "google",
      "azure",
      "ollama",
      "custom",
    ]),
    createSelectFilter(
      "status",
      "Status",
      ["200", "400", "401", "403", "404", "429", "500", "502", "503"],
      "status"
    ),
    CommonFilters.dateRange("Date", "date"),
    CommonFilters.latency(30000, 100),
    CommonFilters.cost(100, 0.01),
    createNumberFilter("prompt_tokens", "Prompt Tokens"),
    createNumberFilter("completion_tokens", "Completion Tokens"),
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
          <div
            className="font-medium max-w-[120px] truncate"
            title={row.getValue("id")}
          >
            {row.getValue("id")}
          </div>
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
        cell: ({ row }) => (
          <div className="max-w-[120px] truncate" title={row.getValue("model")}>
            {row.getValue("model")}
          </div>
        ),
      },
      {
        accessorKey: "provider",
        header: t("logsTable.provider"),
        cell: ({ row }) => {
          const provider = row.getValue("provider") as string;
          const bgDict: Record<string, string> = {
            openai:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            anthropic:
              "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
            deepseek:
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            cohere: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            google:
              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
            azure:
              "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
            ollama:
              "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
            custom:
              "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          };
          return (
            <Badge
              variant="secondary"
              className={bgDict[provider] || bgDict.custom}
            >
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
          const getStatusVariant = (status: number) => {
            if (status >= 200 && status < 300) return "default";
            if (status >= 400 && status < 500) return "destructive";
            if (status >= 500) return "destructive";
            return "outline";
          };

          const getStatusLabel = (status: number) => {
            if (status === 200) return "OK";
            if (status === 400) return "Bad Request";
            if (status === 401) return "Unauthorized";
            if (status === 403) return "Forbidden";
            if (status === 404) return "Not Found";
            if (status === 429) return "Rate Limited";
            if (status === 500) return "Server Error";
            if (status === 502) return "Bad Gateway";
            if (status === 503) return "Service Unavailable";
            return "Unknown";
          };

          return (
            <Badge
              variant={
                getStatusVariant(status) as
                  | "default"
                  | "destructive"
                  | "outline"
                  | "secondary"
              }
            >
              {status} {getStatusLabel(status)}
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
        cell: ({ row }) => {
          const tokens = row.getValue("prompt_tokens") as number;
          return tokens ? tokens.toLocaleString() : "-";
        },
      },
      {
        accessorKey: "completion_tokens",
        header: t("logsTable.completionTokens"),
        cell: ({ row }) => {
          const tokens = row.getValue("completion_tokens") as number;
          return tokens ? tokens.toLocaleString() : "-";
        },
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
          if (!latency) return "-";

          const getLatencyColor = (ms: number) => {
            if (ms < 1000) return "text-green-600 dark:text-green-400";
            if (ms < 3000) return "text-yellow-600 dark:text-yellow-400";
            return "text-red-600 dark:text-red-400";
          };

          return (
            <span className={getLatencyColor(latency)}>
              {latency.toFixed(0)} ms
            </span>
          );
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
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("logs.title", "Logs")}</h1>
          <p className="text-muted-foreground">
            {t("logs.description", "View and analyze your LLM events and logs")}
          </p>
        </div>
      </div>

      <Card>
        <CardContent>
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
                <ListFilter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            }
          />
        </CardContent>
      </Card>
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
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogTitle>{modalTitle}</DialogTitle>
          {type === "json" ? (
            <pre className="whitespace-pre-wrap text-xs max-h-[60vh] overflow-auto bg-muted rounded p-2">
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            <div className="whitespace-pre-wrap bg-muted rounded p-2 text-sm max-h-[60vh] overflow-auto">
              {value as string}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
