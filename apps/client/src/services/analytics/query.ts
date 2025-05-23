import { http } from "@/lib/http";
import { useQuery } from "@tanstack/react-query";

export interface DashboardStats {
  overview: {
    totalEvents: number;
    totalCost: number;
    avgLatency: number;
    errorRate: number;
  };
  topModels: Array<{
    model: string;
    provider: string;
    count: number;
    cost: number;
  }>;
  charts: {
    costByDay: Array<{
      date: string;
      cost: number;
    }>;
    latencyByDay: Array<{
      date: string;
      avg_latency: number;
    }>;
  };
}

export interface CostAnalysis {
  costByProvider: Array<{
    provider: string;
    cost: number;
    count: number;
    avg_cost: number;
  }>;
  costTrend: Array<{
    date: string;
    cost: number;
    count: number;
  }>;
  topCostlyRequests: Array<{
    id: number;
    model: string;
    provider: string;
    cost_usd: number;
    prompt_tokens: number;
    completion_tokens: number;
    created_at: string;
  }>;
}

export const useDashboardStatsQuery = (days = 30) => {
  return useQuery({
    queryKey: ["dashboard-stats", days],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await http.get(`/analytics/dashboard?days=${days}`);
      return response.data;
    },
  });
};

export const useCostAnalysisQuery = (days = 30) => {
  return useQuery({
    queryKey: ["cost-analysis", days],
    queryFn: async (): Promise<CostAnalysis> => {
      const response = await http.get(`/analytics/cost?days=${days}`);
      return response.data;
    },
  });
};
