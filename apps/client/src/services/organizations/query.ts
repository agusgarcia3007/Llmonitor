import { useQuery } from "@tanstack/react-query";
import { OrganizationService } from "./service";

export const useGetOrganization = () => {
  return useQuery({
    queryKey: ["organization"],
    queryFn: OrganizationService.getOrganization,
  });
};

export const useGetOrganizationsList = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: OrganizationService.getOrganizationsList,
  });
};
