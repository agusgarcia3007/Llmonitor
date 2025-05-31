import { authClient } from "@/lib/auth-client";
import type { OrganizationParams } from "@/types/organizations";

export class OrganizationService {
  public static async getOrganization() {
    const { data, error } = await authClient.organization.getFullOrganization();
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
}
