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
import { Area, AreaChart, XAxis, CartesianGrid } from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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
import { formatCompactNumber } from "@/lib/utils";

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: Dashboard,
});

const chartConfig = {
  events: {
    label: "Events",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function Dashboard() {
  const { t } = useTranslation();
  const [days, setDays] = useState(1);
  const { data: stats, isLoading } = useDashboardStatsQuery(days);

  const overview = stats?.overview || {
    totalEvents: 0,
    totalCost: 0,
    avgLatency: 0,
    errorRate: 0,
  };

  const getSelectLabel = (value: number) => {
    switch (value) {
      case 1:
        return t("common.last24Hours");
      case 7:
        return t("common.last7Days");
      case 30:
        return t("common.lastMonth");
      case 365:
        return t("common.lastYear");
      default:
        return `${value} ${t("common.days")}`;
    }
  };

  const formatChartData = () => {
    if (!stats?.charts?.eventsActivity) return [];

    return stats.charts.eventsActivity.map(
      (item: { period: string; events: number }) => ({
        period:
          days === 1
            ? new Date(item.period).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : new Date(item.period).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
        events: item.events,
      })
    );
  };

  return (
    <div className="space-y-6 py-4 px-4 lg:px-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("landing.dashboard.title")}</h1>
        <Select
          value={days.toString()}
          onValueChange={(value) => setDays(parseInt(value))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{t("common.last24Hours")}</SelectItem>
            <SelectItem value="7">{t("common.last7Days")}</SelectItem>
            <SelectItem value="30">{t("common.lastMonth")}</SelectItem>
            <SelectItem value="365">{t("common.lastYear")}</SelectItem>
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
                formatCompactNumber(overview.totalEvents)
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
            <div className="text-muted-foreground">{getSelectLabel(days)}</div>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.stats.eventsActivity")}</CardTitle>
            <CardDescription>
              {days === 1
                ? t("dashboard.stats.eventsPerHour24h")
                : t("dashboard.stats.dailyEventsFor", {
                    period: getSelectLabel(days).toLowerCase(),
                  })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] w-full">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <AreaChart
                  accessibilityLayer
                  data={formatChartData()}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="period"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="events"
                    type="natural"
                    fill="var(--color-events)"
                    fillOpacity={0.4}
                    stroke="var(--color-events)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

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
    </div>
  );
}
