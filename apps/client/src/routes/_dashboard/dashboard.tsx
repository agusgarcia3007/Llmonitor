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

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: Dashboard,
});

export function Dashboard() {
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
        <h1 className="text-2xl font-bold">LLM Analytics Dashboard</h1>
        <Select
          value={days.toString()}
          onValueChange={(value) => setDays(parseInt(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconActivity className="h-4 w-4" />
              Total Events
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
                Active
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              LLM API calls tracked <IconActivity className="size-4" />
            </div>
            <div className="text-muted-foreground">Last {days} days</div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconCurrency className="h-4 w-4" />
              Total Cost
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
                  `$${(overview.totalCost / days).toFixed(2)}/day`
                )}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Token costs across providers <IconCurrency className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Optimize for better savings
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconClock className="h-4 w-4" />
              Avg Latency
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
                variant={overview.avgLatency < 1000 ? "outline" : "destructive"}
              >
                {overview.avgLatency < 1000 ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {overview.avgLatency < 1000 ? "Good" : "Slow"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Response time performance <IconClock className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Monitor for user experience
            </div>
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <IconAlertTriangle className="h-4 w-4" />
              Error Rate
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {isLoading ? (
                <Skeleton className="h-8 w-14" />
              ) : (
                `${overview.errorRate.toFixed(1)}%`
              )}
            </CardTitle>
            <CardAction>
              <Badge
                variant={overview.errorRate < 5 ? "outline" : "destructive"}
              >
                {overview.errorRate < 5 ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {overview.errorRate < 5 ? "Healthy" : "High"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              API failure rate <IconAlertTriangle className="size-4" />
            </div>
            <div className="text-muted-foreground">
              Keep below 5% for reliability
            </div>
          </CardFooter>
        </Card>
      </div>

      {(stats?.topModels && stats.topModels.length > 0) || isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>Top Models by Usage</CardTitle>
            <CardDescription>Most frequently used LLM models</CardDescription>
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
                : stats?.topModels.slice(0, 5).map((model, index) => (
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
                        <div className="font-medium">{model.count} calls</div>
                        <div className="text-sm text-muted-foreground">
                          ${model.cost.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
