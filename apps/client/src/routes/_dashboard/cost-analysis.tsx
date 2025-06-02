import { Badge } from "@/components/ui/badge";
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
import type { CostAnalysis } from "@/types/analytics";
import { IconCurrency, IconDownload } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_dashboard/cost-analysis")({
  component: CostAnalysisPage,
});

export function CostAnalysisPage() {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const { data: analysis, isLoading } = useCostAnalysisQuery(days);

  const handleExportCSV = () => {
    if (!analysis) return;

    const csvContent = [
      ["Provider", "Total Cost", "Requests", "Avg Cost per Request"],
      ...analysis.costByProvider.map(
        (item: CostAnalysis["costByProvider"][0]) => [
          item.provider,
          item.cost.toFixed(4),
          item.count.toString(),
          item.avg_cost.toFixed(6),
        ]
      ),
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
      <div className="space-y-6 px-4 lg:px-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCurrency className="h-4 w-4" />
                {t("costAnalysis.costByProvider.title")}
              </CardTitle>
              <CardDescription>
                {t("costAnalysis.costByProvider.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
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
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("costAnalysis.topCostlyRequests.title")}</CardTitle>
              <CardDescription>
                {t("costAnalysis.topCostlyRequests.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("costAnalysis.costTrend.title")}</CardTitle>
            <CardDescription>
              {t("costAnalysis.costTrend.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex justify-center items-center h-64">
        {t("costAnalysis.noDataAvailable")}
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("costAnalysis.title")}</h1>
          <p className="text-muted-foreground">
            {t("costAnalysis.description")}
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
              <SelectItem value="7">{t("common.last", { days: 7 })}</SelectItem>
              <SelectItem value="30">
                {t("common.last", { days: 30 })}
              </SelectItem>
              <SelectItem value="90">
                {t("common.last", { days: 90 })}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            disabled={isLoading || !analysis}
          >
            <IconDownload className="h-4 w-4 mr-2" />
            {t("costAnalysis.exportCSV")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCurrency className="h-4 w-4" />
              {t("costAnalysis.costByProvider.title")}
            </CardTitle>
            <CardDescription>
              {t("costAnalysis.costByProvider.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis?.costByProvider &&
              analysis.costByProvider.length > 0 ? (
                analysis.costByProvider.map(
                  (provider: CostAnalysis["costByProvider"][0]) => {
                    const totalCost = analysis.costByProvider.reduce(
                      (sum: number, p: CostAnalysis["costByProvider"][0]) =>
                        sum + p.cost,
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
                              {provider.count}{" "}
                              {t("costAnalysis.requestDetails.requests")}
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
                  }
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <IconCurrency className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {t("costAnalysis.emptyState.costData.title")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("costAnalysis.emptyState.costData.description")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("costAnalysis.topCostlyRequests.title")}</CardTitle>
            <CardDescription>
              {t("costAnalysis.topCostlyRequests.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis?.topCostlyRequests &&
              analysis.topCostlyRequests.length > 0 ? (
                analysis.topCostlyRequests
                  ?.slice(0, 5)
                  ?.map((request: CostAnalysis["topCostlyRequests"][0]) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-primary/10">
                          ${request.cost_usd.toFixed(6)}
                        </Badge>
                        <div>
                          <div className="font-medium">{request.model}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.provider} •{" "}
                            {request.prompt_tokens + request.completion_tokens}{" "}
                            {t("costAnalysis.requestDetails.tokens")}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <IconCurrency className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {t("costAnalysis.emptyState.expensiveRequests.title")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("costAnalysis.emptyState.expensiveRequests.description")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("costAnalysis.costTrend.title")}</CardTitle>
          <CardDescription>
            {t("costAnalysis.costTrend.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis?.costTrend && analysis.costTrend.length > 0 ? (
              analysis.costTrend
                ?.slice(-10)
                ?.map((day: CostAnalysis["costTrend"][0]) => (
                  <div
                    key={day.date}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="font-medium">
                      {new Date(day.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground">
                        {day.count} {t("costAnalysis.requestDetails.requests")}
                      </div>
                      <div className="font-medium">${day.cost.toFixed(2)}</div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <IconCurrency className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground font-medium">
                  {t("costAnalysis.emptyState.trendData.title")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("costAnalysis.emptyState.trendData.description")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
