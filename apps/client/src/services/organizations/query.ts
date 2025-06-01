import { useQuery } from "@tanstack/react-query";
import { OrganizationService } from "./service";

export const useGetOrganization = () => {
  return useQuery({
    queryKey: ["organization"],
    queryFn: OrganizationService.getOrganization,
  });
};

export const useGetOrganizationById = (organizationId: string) => {
  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: () => OrganizationService.getOrganizationById(organizationId),
    enabled: !!organizationId,
  });
};

export const useGetOrganizationBySlug = (organizationSlug: string) => {
  return useQuery({
    queryKey: ["organization", "slug", organizationSlug],
    queryFn: () => OrganizationService.getOrganizationBySlug(organizationSlug),
    enabled: !!organizationSlug,
  });
};

export const useGetOrganizationsList = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: OrganizationService.getOrganizationsList,
  });
};

export const useCheckSlug = (slug: string) => {
  return useQuery({
    queryKey: ["organization", "checkSlug", slug],
    queryFn: () => OrganizationService.checkSlug(slug),
    enabled: !!slug,
  });
};

export const useGetInvitation = (invitationId: string) => {
  return useQuery({
    queryKey: ["invitation", invitationId],
    queryFn: () => OrganizationService.getInvitation(invitationId),
    enabled: !!invitationId,
  });
};

export const useListInvitations = (organizationId?: string) => {
  return useQuery({
    queryKey: ["invitations", organizationId],
    queryFn: () => OrganizationService.listInvitations(organizationId),
  });
};

export const useGetActiveMember = () => {
  return useQuery({
    queryKey: ["activeMember"],
    queryFn: OrganizationService.getActiveMember,
  });
};
