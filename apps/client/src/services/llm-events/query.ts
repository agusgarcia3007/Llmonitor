import type { GetEventsParams } from "@/types";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { LLMEventService } from "./service";

export const llmEventsQueryOptions = (params: GetEventsParams) =>
  queryOptions({
    queryKey: ["llm-events", params],
    queryFn: () => LLMEventService.getEvents(params),
  });

export const useLLMEventsQuery = (params: GetEventsParams) => {
  return useQuery(llmEventsQueryOptions(params));
};
