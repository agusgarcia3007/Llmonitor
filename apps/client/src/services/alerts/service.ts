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
    const response = await http.get("/alerts/sections");
    return response.data;
  }

  public static async saveAlertSections(
    request: AlertSectionsRequest
  ): Promise<{ success: boolean }> {
    const response = await http.post("/alerts/sections", request);
    return response.data;
  }
}
