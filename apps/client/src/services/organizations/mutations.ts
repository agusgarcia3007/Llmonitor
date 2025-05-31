import { catchAxiosError } from "@/lib/catch-axios-error";
import type { OrganizationParams } from "@/types/organizations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { OrganizationService } from "./service";

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: OrganizationParams) =>
      OrganizationService.createOrganization(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: catchAxiosError,
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: OrganizationService.updateOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: catchAxiosError,
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: OrganizationService.deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: catchAxiosError,
  });
};
