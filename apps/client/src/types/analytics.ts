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
