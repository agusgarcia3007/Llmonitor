import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AlertService } from "./service";

export const alertSectionsQueryOptions = () =>
  queryOptions({
    queryKey: ["alert-sections"],
    queryFn: () => AlertService.getAlertSections(),
  });

export const useAlertSectionsQuery = () => {
  return useQuery(alertSectionsQueryOptions());
};

export const useSaveAlertSectionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AlertService.saveAlertSections,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-sections"] });
    },
  });
};
