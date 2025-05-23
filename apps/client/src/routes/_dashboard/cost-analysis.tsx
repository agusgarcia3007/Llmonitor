import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useCostAnalysisQuery } from "@/services/analytics/query";
import { IconCurrency, IconDownload } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/cost-analysis")({
  component: CostAnalysisPage,
});

export function CostAnalysisPage() {
  const [days, setDays] = useState(30);
  const { data: analysis, isLoading } = useCostAnalysisQuery(days);

  const handleExportCSV = () => {
    if (!analysis) return;

    const csvContent = [
      ["Provider", "Total Cost", "Requests", "Avg Cost per Request"],
      ...analysis.costByProvider.map((item) => [
        item.provider,
        item.cost.toFixed(4),
        item.count.toString(),
        item.avg_cost.toFixed(6),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cost-analysis-${days}days.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading cost analysis...
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex justify-center items-center h-64">
        No data available
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Cost Analysis</h1>
          <p className="text-muted-foreground">
            Deep dive into your LLM spending patterns
          </p>
        </div>
        <div className="flex gap-2">
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
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            disabled={isLoading || !analysis}
          >
            <IconDownload className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCurrency className="h-4 w-4" />
              Cost by Provider
            </CardTitle>
            <CardDescription>
              Spending breakdown across different LLM providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-3 h-3 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </div>
                  ))
                : analysis?.costByProvider.map((provider) => {
                    const totalCost = analysis.costByProvider.reduce(
                      (sum, p) => sum + p.cost,
                      0
                    );
                    const percentage =
                      totalCost > 0 ? (provider.cost / totalCost) * 100 : 0;

                    return (
                      <div
                        key={provider.provider}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          <div>
                            <div className="font-medium capitalize">
                              {provider.provider}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {provider.count} requests
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            ${provider.cost.toFixed(2)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Costly Requests</CardTitle>
            <CardDescription>
              Individual requests with highest token costs
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                : analysis?.topCostlyRequests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-xs font-medium">
                          ${request.cost_usd.toFixed(3)}
                        </div>
                        <div>
                          <div className="font-medium">{request.model}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.provider} •{" "}
                            {request.prompt_tokens + request.completion_tokens}{" "}
                            tokens
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Trend</CardTitle>
          <CardDescription>
            Daily spending pattern over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <Skeleton className="h-4 w-20" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                ))
              : analysis?.costTrend.slice(-10).map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="font-medium">
                      {new Date(day.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground">
                        {day.count} requests
                      </div>
                      <div className="font-medium">${day.cost.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
