import { http } from "@/lib/http";
import type { GetEventsParams } from "@/types";

export class LLMEventService {
  public static async getEvents(params: GetEventsParams) {
    const { data } = await http.get("/llm-events", {
      params,
    });
    return data;
  }
}
