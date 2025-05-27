import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useApiKeysQuery = () =>
  useQuery({
    queryKey: ["api-keys"],
    queryFn: () => authClient.apiKey.list(),
  });
