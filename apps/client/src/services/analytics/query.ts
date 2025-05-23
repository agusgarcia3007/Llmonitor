import { queryOptions, useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "./service";

export const dashboardStatsQueryOptions = (days: number) =>
  queryOptions({
    queryKey: ["dashboard-stats", days],
    queryFn: () => AnalyticsService.getDashboardStats(days),
  });

export const costAnalysisQueryOptions = (days: number) =>
  queryOptions({
    queryKey: ["cost-analysis", days],
    queryFn: () => AnalyticsService.getCostAnalysis(days),
  });

export const useDashboardStatsQuery = (days = 30) => {
  return useQuery(dashboardStatsQueryOptions(days));
};

export const useCostAnalysisQuery = (days = 30) => {
  return useQuery(costAnalysisQueryOptions(days));
};
