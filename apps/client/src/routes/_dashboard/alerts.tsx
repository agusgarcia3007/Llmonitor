import { CreateAlertForm } from "@/components/alerts/create-alert-form";
import { EditAlertForm } from "@/components/alerts/edit-alert-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useAlertsQuery,
  useDeleteAlertMutation,
} from "@/services/alerts/query";
import type { AlertConfig } from "@/types/alerts";
import { createFileRoute } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { formatDistance } from "date-fns";
import { ArrowUpDown, Edit, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_dashboard/alerts")({
  component: AlertsPage,
});

export function AlertsPage() {
  const [editingAlert, setEditingAlert] = useState<AlertConfig | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: alerts, isLoading } = useAlertsQuery();
  const deleteAlertMutation = useDeleteAlertMutation();

  const handleEditAlert = (alert: AlertConfig) => {
    setEditingAlert(alert);
    setIsEditDialogOpen(true);
  };

  const columns = useMemo<ColumnDef<AlertConfig>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="flex items-center gap-2"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string;
          const typeMap: Record<
            string,
            { label: string; variant: "default" | "secondary" | "outline" }
          > = {
            threshold: { label: "Threshold", variant: "default" },
            anomaly: { label: "Anomaly", variant: "secondary" },
            budget: { label: "Budget", variant: "outline" },
          };

          const typeInfo = typeMap[type] || { label: type, variant: "outline" };
          return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
        },
      },
      {
        accessorKey: "metric",
        header: "Metric",
        cell: ({ row }) => {
          const metric = row.getValue("metric") as string;
          return <span className="text-sm">{metric.replace(/_/g, " ")}</span>;
        },
      },
      {
        accessorKey: "threshold_value",
        header: "Threshold",
        cell: ({ row }) => {
          const value = row.getValue("threshold_value") as number;
          const operator = row.original.threshold_operator;
          return (
            <span className="text-sm">
              {operator} {value}
            </span>
          );
        },
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.getValue("is_active") as boolean;
          return (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        accessorKey: "notification_channels",
        header: "Notifications",
        cell: ({ row }) => {
          const channels = row.getValue("notification_channels") as Array<{
            type: string;
          }>;
          return (
            <div className="flex gap-1">
              {channels.map((channel, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {channel.type}
                </Badge>
              ))}
            </div>
          );
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
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditAlert(row.original)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () =>
                  await deleteAlertMutation.mutate(row.original.id)
                }
                disabled={deleteAlertMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [deleteAlertMutation]
  );

  const tableData = alerts?.alerts || [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Alert</DialogTitle>
              <DialogDescription>
                Configure an alert to monitor your LLM usage and get notified
                when thresholds are exceeded.
              </DialogDescription>
            </DialogHeader>
            <CreateAlertForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={tableData}
        isLoading={isLoading}
        searchColumn="name"
        searchPlaceholder="Filter by alert name..."
      />

      {editingAlert && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Alert</DialogTitle>
              <DialogDescription>
                Update the alert configuration.
              </DialogDescription>
            </DialogHeader>
            <EditAlertForm
              alert={editingAlert}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditingAlert(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
