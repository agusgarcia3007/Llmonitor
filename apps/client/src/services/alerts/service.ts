import { http } from "@/lib/http";

interface AlertSectionConfig {
  id: string;
  enabled: boolean;
  threshold?: number;
  frequency?: "daily" | "weekly" | "monthly";
  projectIds?: string[];
}

interface AlertSectionsRequest {
  sections: AlertSectionConfig[];
}

interface AlertSectionsResponse {
  sections: AlertSectionConfig[];
}

export class AlertService {
  public static async getAlertSections(): Promise<AlertSectionsResponse> {
    return http.get("/alerts/sections");
  }

  public static async saveAlertSections(
    request: AlertSectionsRequest
  ): Promise<{ success: boolean }> {
    return http.post("/alerts/sections", request);
  }
}
