import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultipleSelector from "@/components/ui/multiselect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Loader2,
  Mail,
  Settings,
} from "lucide-react";

import {
  useAlertSectionsQuery,
  useSaveAlertSectionsMutation,
} from "@/services/alerts/query";
import { useGetOrganizationsList } from "@/services/organizations/query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_dashboard/alerts")({
  component: AlertsPage,
});

const alertSectionSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
  threshold: z.number().min(0).optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  projectIds: z.array(z.string()).optional(),
});

const alertSectionsFormSchema = z.object({
  sections: z.array(alertSectionSchema),
});

type AlertSectionsFormData = z.infer<typeof alertSectionsFormSchema>;

export function AlertsPage() {
  const { t } = useTranslation();
  const { data: alertSectionsData, isLoading } = useAlertSectionsQuery();
  const { data: organizationsData } = useGetOrganizationsList();
  const saveAlertSectionsMutation = useSaveAlertSectionsMutation();

  const form = useForm<AlertSectionsFormData>({
    resolver: zodResolver(alertSectionsFormSchema),
    defaultValues: {
      sections: [
        {
          id: "errors",
          enabled: false,
          threshold: 5,
          projectIds: [],
        },
        {
          id: "latency",
          enabled: false,
          threshold: 5000,
          projectIds: [],
        },
        {
          id: "cost",
          enabled: false,
          threshold: 0.1,
          projectIds: [],
        },
        {
          id: "summary",
          enabled: false,
          frequency: "daily",
          projectIds: [],
        },
      ],
    },
  });

  const { watch, reset } = form;
  const alertSections = watch("sections");

  useEffect(() => {
    if (!organizationsData?.length) return;

    const allProjectIds = organizationsData.map((org) => org.id);

    if (alertSectionsData?.sections?.length) {
      const formattedSections = alertSectionsData.sections.map((section) => ({
        ...section,
        threshold: section.threshold ?? 0,
        frequency: section.frequency ?? "daily",
        projectIds: section.projectIds?.length
          ? section.projectIds
          : allProjectIds,
      }));

      reset({ sections: formattedSections });
    } else {
      reset({
        sections: [
          {
            id: "errors",
            enabled: false,
            threshold: 5,
            projectIds: allProjectIds,
          },
          {
            id: "latency",
            enabled: false,
            threshold: 5000,
            projectIds: allProjectIds,
          },
          {
            id: "cost",
            enabled: false,
            threshold: 0.1,
            projectIds: allProjectIds,
          },
          {
            id: "summary",
            enabled: false,
            frequency: "daily",
            projectIds: allProjectIds,
          },
        ],
      });
    }
  }, [alertSectionsData, organizationsData, reset]);

  const getSectionConfig = (id: string) => {
    const configs = {
      errors: {
        title: t("alertsNew.sections.errors.title"),
        description: t("alertsNew.sections.errors.description"),
        icon: AlertTriangle,
        unit: t("alertsNew.sections.errors.unit"),
      },
      latency: {
        title: t("alertsNew.sections.latency.title"),
        description: t("alertsNew.sections.latency.description"),
        icon: Clock,
        unit: t("alertsNew.sections.latency.unit"),
      },
      cost: {
        title: t("alertsNew.sections.cost.title"),
        description: t("alertsNew.sections.cost.description"),
        icon: DollarSign,
        unit: t("alertsNew.sections.cost.unit"),
      },
      summary: {
        title: t("alertsNew.sections.summary.title"),
        description: t("alertsNew.sections.summary.description"),
        icon: Mail,
        unit: null,
      },
    };
    return configs[id as keyof typeof configs];
  };

  const onSubmit = async (data: AlertSectionsFormData) => {
    try {
      await saveAlertSectionsMutation.mutateAsync({ sections: data.sections });
      toast.success(t("alertsNew.success.configurationSaved"));
    } catch (error) {
      toast.error(t("alertsNew.error.savingConfiguration"));
      console.error("Error saving alert settings:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 w-full mx-auto">
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("apiKeys.loading")}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("alertsNew.title")}</h1>
        <p className="text-muted-foreground">{t("alertsNew.description")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Toggles section - Left side (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {alertSections.map((section, index) => {
                const config = getSectionConfig(section.id);
                if (!config) return null;

                const IconComponent = config.icon;
                return (
                  <Card
                    key={section.id}
                    className={`transition-all ${
                      section.enabled ? "ring-2 ring-blue-200" : ""
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              section.enabled
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {config.title}
                            </CardTitle>
                            <CardDescription>
                              {config.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FormField
                            control={form.control}
                            name={`sections.${index}.enabled`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormLabel className="text-sm">
                                  {field.value
                                    ? t("alertsNew.enabled")
                                    : t("alertsNew.disabled")}
                                </FormLabel>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </CardHeader>

                    {section.enabled && (
                      <CardContent className="pt-0">
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`sections.${index}.projectIds`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-sm font-medium">
                                    {t("navigation.projects")}
                                  </FormLabel>
                                  <FormControl>
                                    <MultipleSelector
                                      value={
                                        field.value?.map((id) => ({
                                          value: id,
                                          label:
                                            organizationsData?.find(
                                              (org) => org.id === id
                                            )?.name || id,
                                        })) || []
                                      }
                                      onChange={(options) => {
                                        field.onChange(
                                          options.map((option) => option.value)
                                        );
                                      }}
                                      defaultOptions={
                                        organizationsData?.map((org) => ({
                                          value: org.id,
                                          label: org.name,
                                        })) || []
                                      }
                                      placeholder="Select projects..."
                                      emptyIndicator={
                                        <p className="text-center text-sm">
                                          No projects found
                                        </p>
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {section.id === "summary" ? (
                              <FormField
                                control={form.control}
                                name={`sections.${index}.frequency`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                      {t(
                                        "alertsNew.sections.summary.frequency"
                                      )}
                                    </FormLabel>
                                    <FormControl>
                                      <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="daily">
                                            {t(
                                              "alertsNew.sections.summary.frequencies.daily"
                                            )}
                                          </SelectItem>
                                          <SelectItem value="weekly">
                                            {t(
                                              "alertsNew.sections.summary.frequencies.weekly"
                                            )}
                                          </SelectItem>
                                          <SelectItem value="monthly">
                                            {t(
                                              "alertsNew.sections.summary.frequencies.monthly"
                                            )}
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            ) : (
                              <FormField
                                control={form.control}
                                name={`sections.${index}.threshold`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-sm font-medium">
                                      {t("alertsNew.threshold")}
                                    </FormLabel>
                                    <div className="flex items-center space-x-2">
                                      <FormControl>
                                        <Input
                                          type="number"
                                          className="flex-1"
                                          step={
                                            section.id === "cost" ? "0.01" : "1"
                                          }
                                          min="0"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value)
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <span className="text-sm text-muted-foreground">
                                        {config.unit}
                                      </span>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Status section - Right side (1/3 width) */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("alertsNew.status")}
                  </CardTitle>
                  <CardDescription>
                    {t("alertsNew.statusDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {alertSections.map((section) => {
                      const config = getSectionConfig(section.id);
                      if (!config) return null;

                      return (
                        <div
                          key={section.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                section.enabled
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              <config.icon className="h-3 w-3" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {config.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {section.enabled
                                  ? t("alertsNew.active")
                                  : t("alertsNew.inactive")}
                              </p>
                            </div>
                          </div>
                          {section.enabled && (
                            <div className="text-xs text-muted-foreground">
                              {section.id === "summary"
                                ? t(
                                    `alertsNew.sections.summary.frequencies.${section.frequency}`
                                  )
                                : `${section.threshold} ${config.unit}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      type="submit"
                      className="w-full"
                      isLoading={saveAlertSectionsMutation.isPending}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t("alertsNew.saveConfiguration")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
