import { authClient } from "@/lib/auth-client";
import type { OrganizationParams } from "@/types/organizations";

export class OrganizationService {
  public static async getOrganization() {
    const { data, error } = await authClient.organization.getFullOrganization();
    if (error) throw error;
    return data;
  }

  public static async getOrganizationById(organizationId: string) {
    const { data, error } = await authClient.organization.getFullOrganization({
      query: { organizationId },
    });
    if (error) throw error;
    return data;
  }

  public static async getOrganizationBySlug(organizationSlug: string) {
    const { data, error } = await authClient.organization.getFullOrganization({
      query: { organizationSlug },
    });
    if (error) throw error;
    return data;
  }

  public static async createOrganization(params: OrganizationParams) {
    const { data, error } = await authClient.organization.create({
      name: params.name,
      slug: params.slug,
      logo: params.logo,
    });
    if (error) throw error;
    return data;
  }

  public static async updateOrganization(
    params: OrganizationParams & { id?: string }
  ) {
    const { data, error } = await authClient.organization.update({
      data: {
        name: params.name,
        slug: params.slug,
        logo: params.logo,
      },
      ...(params.id && { organizationId: params.id }),
    });
    if (error) throw error;
    return data;
  }

  public static async deleteOrganization(organizationId: string) {
    const { data, error } = await authClient.organization.delete({
      organizationId,
    });
    if (error) throw error;
    return data;
  }

  public static async getOrganizationsList() {
    const { data, error } = await authClient.organization.list();
    if (error) throw error;
    return data;
  }

  public static async setActiveOrganization(organizationId: string) {
    const { data, error } = await authClient.organization.setActive({
      organizationId,
    });
    if (error) throw error;
    return data;
  }

  public static async setActiveOrganizationBySlug(organizationSlug: string) {
    const { data, error } = await authClient.organization.setActive({
      organizationSlug,
    });
    if (error) throw error;
    return data;
  }

  public static async checkSlug(slug: string) {
    const { data, error } = await authClient.organization.checkSlug({
      slug,
    });
    if (error) throw error;
    return data;
  }

  public static async inviteMember(params: {
    email: string;
    role: "member" | "admin" | "owner";
    organizationId?: string;
  }) {
    const { data, error } = await authClient.organization.inviteMember({
      email: params.email,
      role: params.role,
      ...(params.organizationId && { organizationId: params.organizationId }),
    });
    if (error) throw error;
    return data;
  }

  public static async acceptInvitation(invitationId: string) {
    const { data, error } = await authClient.organization.acceptInvitation({
      invitationId,
    });
    if (error) throw error;
    return data;
  }

  public static async getInvitation(invitationId: string) {
    const { data, error } = await authClient.organization.getInvitation({
      query: { id: invitationId },
    });
    if (error) throw error;
    return data;
  }

  public static async listInvitations(organizationId?: string) {
    const { data, error } = await authClient.organization.listInvitations({
      query: { ...(organizationId && { organizationId }) },
    });
    if (error) throw error;
    return data;
  }

  public static async removeMember(
    memberIdOrEmail: string,
    organizationId?: string
  ) {
    const { data, error } = await authClient.organization.removeMember({
      memberIdOrEmail,
      ...(organizationId && { organizationId }),
    });
    if (error) throw error;
    return data;
  }

  public static async updateMemberRole(params: {
    memberId: string;
    role: "member" | "admin" | "owner";
    organizationId?: string;
  }) {
    const { data, error } = await authClient.organization.updateMemberRole({
      memberId: params.memberId,
      role: params.role,
      ...(params.organizationId && { organizationId: params.organizationId }),
    });
    if (error) throw error;
    return data;
  }

  public static async getActiveMember() {
    const { data, error } = await authClient.organization.getActiveMember({
      query: {},
    });
    if (error) throw error;
    return data;
  }

  public static async cancelInvitation(invitationId: string) {
    const { data, error } = await authClient.organization.cancelInvitation({
      invitationId,
    });
    if (error) throw error;
    return data;
  }

  public static async rejectInvitation(invitationId: string) {
    const { data, error } = await authClient.organization.cancelInvitation({
      invitationId,
    });
    if (error) throw error;
    return data;
  }

  public static async getInvitationByToken(token: string) {
    const { data, error } = await authClient.organization.getInvitation({
      query: { id: token },
    });
    if (error) throw error;
    return data;
  }
}
