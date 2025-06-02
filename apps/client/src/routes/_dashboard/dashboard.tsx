import {
  IconTrendingDown,
  IconTrendingUp,
  IconActivity,
  IconCurrency,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStatsQuery } from "@/services/analytics/query";
import type { DashboardStats } from "@/types/analytics";

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: Dashboard,
});

export function Dashboard() {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const { data: stats, isLoading } = useDashboardStatsQuery(days);

  const overview = stats?.overview || {
    totalEvents: 0,
    totalCost: 0,
    avgLatency: 0,
    errorRate: 0,
  };

  return (
    <div className="space-y-6 py-4 px-4 lg:px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("landing.dashboard.title")}</h1>
        <Select
          value={days.toString()}
          onValueChange={(value) => setDays(parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">{t("common.last", { days: 7 })}</SelectItem>
            <SelectItem value="30">{t("common.last", { days: 30 })}</SelectItem>
            <SelectItem value="90">{t("common.last", { days: 90 })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconActivity className="h-4 w-4" />
              {t("dashboard.stats.totalEvents")}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                overview.totalEvents.toLocaleString()
              )}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                {t("dashboard.stats.active")}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t("dashboard.stats.apiCallsTracked")}{" "}
              <IconActivity className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {t("common.last", { days })}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconCurrency className="h-4 w-4" />
              {t("dashboard.stats.totalCost")}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                `$${overview.totalCost.toFixed(2)}`
              )}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconTrendingUp />
                {isLoading ? (
                  <Skeleton className="h-4 w-12 ml-1" />
                ) : (
                  `$${(overview.totalCost / days).toFixed(2)}/${t(
                    "common.day"
                  )}`
                )}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t("dashboard.stats.tokenCosts")}{" "}
              <IconCurrency className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {t("dashboard.stats.optimizeSavings")}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconClock className="h-4 w-4" />
              {t("dashboard.stats.avgLatency")}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${overview.avgLatency.toFixed(0)}ms`
              )}
            </CardTitle>
            <CardAction>
              <Badge
                variant={overview.avgLatency < 1500 ? "default" : "destructive"}
              >
                {overview.avgLatency < 1500 ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {overview.avgLatency < 1500
                  ? t("dashboard.stats.good")
                  : t("dashboard.stats.slow")}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t("dashboard.stats.responseTime")}{" "}
              <IconClock className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {t("dashboard.stats.monitorExperience")}
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconAlertTriangle className="h-4 w-4" />
              {t("dashboard.stats.errorRate")}
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {isLoading ? (
                <Skeleton className="h-8 w-14" />
              ) : (
                `${(overview.errorRate ?? 0).toFixed(1)}%`
              )}
            </CardTitle>
            <CardAction>
              <Badge
                variant={
                  (overview.errorRate ?? 0) < 5 ? "outline" : "destructive"
                }
              >
                {(overview.errorRate ?? 0) < 5 ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {(overview.errorRate ?? 0) < 5
                  ? t("dashboard.stats.healthy")
                  : t("dashboard.stats.high")}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {t("dashboard.stats.apiFailureRate")}{" "}
              <IconAlertTriangle className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {t("dashboard.stats.keepBelow")}
            </div>
          </CardFooter>
        </Card>
      </div>

      {(stats?.topModels && stats.topModels.length > 0) || isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.stats.topModels")}</CardTitle>
            <CardDescription>
              {t("dashboard.stats.mostFrequent")}
            </CardDescription>
          </CardHeader>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))
                : stats?.topModels
                    .slice(0, 5)
                    .map(
                      (
                        model: DashboardStats["topModels"][0],
                        index: number
                      ) => (
                        <div
                          key={`${model.provider}-${model.model}`}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{model.model}</div>
                              <div className="text-sm text-muted-foreground">
                                {model.provider}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {model.count} {t("dashboard.stats.calls")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${model.cost.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      )
                    )}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
