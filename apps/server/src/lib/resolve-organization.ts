export type SessionLike = {
  activeOrganizationId?: string | null;
  organizationId?: string | null;
  userId?: string | null;
};

export type GetOrgFn = (userId: string) => Promise<{ id: string } | null>;

export interface ResolveOrgParams {
  projectId?: string;
  organizationId?: string;
}

export async function resolveOrganizationId(
  body: ResolveOrgParams,
  session: SessionLike | null,
  getActiveOrganization: GetOrgFn
): Promise<string | undefined> {
  let organizationId =
    body.projectId ||
    body.organizationId ||
    session?.activeOrganizationId ||
    session?.organizationId ||
    undefined;

  if (!organizationId && session?.userId) {
    const org = await getActiveOrganization(session.userId);
    organizationId = org?.id;
  }

  return organizationId || undefined;
}
