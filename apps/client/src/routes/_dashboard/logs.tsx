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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_dashboard/logs")({
  component: LogsPage,
});

export function LogsPage() {
  const { t } = useTranslation();
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
            // Agregar otros estados según sea necesario
          };

          const statusInfo = statusMap[status] || {
            label: `${status}`,
            variant: "outline",
          };

          return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
        },
      },
      {
        accessorKey: "prompt",
        header: t("logsTable.prompt"),
        cell: ({ row }) => (
          <PromptCell prompt={row.getValue("prompt") as string} />
        ),
      },
      {
        accessorKey: "completion",
        header: t("logsTable.completion"),
        cell: ({ row }) => (
          <CompletionCell completion={row.getValue("completion") as string} />
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
        cell: ({ row }) => <MetadataCell metadata={row.getValue("metadata")} />,
      },
    ],
    [t]
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

function PromptCell({ prompt }: { prompt: string }) {
  const [open, setOpen] = useState(false);
  const hasText = typeof prompt === "string" && prompt.trim().length > 0;
  return (
    <div className="flex items-center gap-2">
      <div className="line-clamp-1 max-w-[200px]">{hasText ? prompt : "-"}</div>
      {hasText && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <Eye className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Prompt</DialogTitle>
            <code className="whitespace-pre-wrap bg-muted rounded p-2 text-sm max-h-[60vh] overflow-auto">
              {prompt}
            </code>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function CompletionCell({ completion }: { completion: string }) {
  const [open, setOpen] = useState(false);
  const hasText =
    typeof completion === "string" && completion.trim().length > 0;
  return (
    <div className="flex items-center gap-2">
      <div className="line-clamp-1 max-w-[200px]">
        {hasText ? completion : "-"}
      </div>
      {hasText && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
              <Eye className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Respuesta</DialogTitle>
            <code className="whitespace-pre-wrap bg-muted rounded p-2 text-sm max-h-[60vh] overflow-auto">
              {completion}
            </code>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function MetadataCell({ metadata }: { metadata: unknown }) {
  const [open, setOpen] = useState(false);
  const isEmpty =
    !metadata ||
    (typeof metadata === "object" &&
      Object.keys(metadata as object).length === 0);
  if (isEmpty) {
    return <span>-</span>;
  }
  return (
    <div className="flex items-center">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Metadata</DialogTitle>
          <pre className="whitespace-pre-wrap text-xs max-h-[60vh] overflow-auto bg-muted rounded p-2">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
