import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAlertMutation } from "@/services/alerts/query";
import type {
  AlertMetric,
  AlertType,
  CreateAlertRequest,
  NotificationChannelType,
  ThresholdOperator,
} from "@/types/alerts";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

interface CreateAlertFormData {
  name: string;
  description?: string;
  type: AlertType;
  metric: AlertMetric;
  threshold_value: number;
  threshold_operator: ThresholdOperator;
  time_window: number;
  notification_channels: Array<{
    type: NotificationChannelType;
    target: string;
  }>;
}

interface CreateAlertFormProps {
  onSuccess?: () => void;
}

const alertTypes: { value: AlertType; label: string }[] = [
  { value: "threshold", label: "Threshold" },
  { value: "anomaly", label: "Anomaly" },
  { value: "budget", label: "Budget" },
];

const alertMetrics: { value: AlertMetric; label: string }[] = [
  { value: "cost_per_hour", label: "Cost per Hour" },
  { value: "cost_per_day", label: "Cost per Day" },
  { value: "cost_per_week", label: "Cost per Week" },
  { value: "cost_per_month", label: "Cost per Month" },
  { value: "requests_per_minute", label: "Requests per Minute" },
  { value: "requests_per_hour", label: "Requests per Hour" },
  { value: "error_rate", label: "Error Rate %" },
  { value: "latency_p95", label: "Latency P95 (ms)" },
  { value: "latency_p99", label: "Latency P99 (ms)" },
  { value: "token_usage_per_hour", label: "Token Usage per Hour" },
  { value: "token_usage_per_day", label: "Token Usage per Day" },
];

const thresholdOperators: { value: ThresholdOperator; label: string }[] = [
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
  { value: "eq", label: "=" },
  { value: "ne", label: "≠" },
];

const notificationChannelTypes: {
  value: NotificationChannelType;
  label: string;
}[] = [
  { value: "email", label: "Email" },
  { value: "webhook", label: "Webhook" },
  { value: "slack", label: "Slack" },
];

export function CreateAlertForm({ onSuccess }: CreateAlertFormProps) {
  const createAlertMutation = useCreateAlertMutation();

  const form = useForm<CreateAlertFormData>({
    defaultValues: {
      name: "",
      description: "",
      type: "threshold",
      metric: "cost_per_hour",
      threshold_value: 0,
      threshold_operator: "gt",
      time_window: 60,
      notification_channels: [{ type: "email", target: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "notification_channels",
  });

  const onSubmit = async (data: CreateAlertFormData) => {
    try {
      if (!data.name.trim()) {
        toast.error("Name is required");
        return;
      }

      if (data.threshold_value < 0) {
        toast.error("Threshold value must be positive");
        return;
      }

      if (data.time_window < 1) {
        toast.error("Time window must be at least 1 minute");
        return;
      }

      if (!data.notification_channels.some((ch) => ch.target.trim())) {
        toast.error(
          "At least one notification channel with target is required"
        );
        return;
      }

      const alertData: CreateAlertRequest = {
        ...data,
        notification_channels: data.notification_channels
          .filter((ch) => ch.target.trim())
          .map((channel) => ({
            type: channel.type,
            target: channel.target.trim(),
          })),
      };

      await createAlertMutation.mutateAsync(alertData);
      toast.success("Alert created successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create alert");
      console.error("Error creating alert:", error);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="High cost alert" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this alert monitors..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {alertTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time_window"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Window (min) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="60"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Evaluation period in minutes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Threshold Configuration */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Threshold Configuration
            </h4>

            <FormField
              control={form.control}
              name="metric"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metric to Monitor *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {alertMetrics.map((metric) => (
                        <SelectItem key={metric.value} value={metric.value}>
                          {metric.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-[120px_1fr] gap-4 items-end">
              <FormField
                control={form.control}
                name="threshold_operator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {thresholdOperators.map((operator) => (
                          <SelectItem
                            key={operator.value}
                            value={operator.value}
                          >
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="threshold_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold Value *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Notification Channels */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Notification Channels
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Where to send alerts when triggered
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ type: "email", target: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-3 items-end p-3 border rounded-lg"
                >
                  <FormField
                    control={form.control}
                    name={`notification_channels.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="min-w-[120px]">
                        <FormLabel className="text-xs">Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {notificationChannelTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`notification_channels.${index}.target`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="text-xs">Target</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="email@example.com or webhook URL"
                            className="h-9"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="h-9 w-9 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="submit"
              isLoading={createAlertMutation.isPending}
              className="min-w-[120px]"
            >
              Create Alert
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
