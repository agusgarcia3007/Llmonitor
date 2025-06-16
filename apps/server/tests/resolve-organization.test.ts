import { resolveOrganizationId } from "@/lib/resolve-organization";
import type { SessionLike } from "@/lib/resolve-organization";
import { expect, test } from "bun:test";

const fakeGetOrg = async (id: string) => {
  if (id === "user1") return { id: "org-from-user" };
  return null;
};

test("returns projectId when present", async () => {
  const session: SessionLike | null = null;
  const id = await resolveOrganizationId(
    { projectId: "proj" },
    session,
    fakeGetOrg
  );
  expect(id).toBe("proj");
});

test("returns organizationId when projectId absent", async () => {
  const id = await resolveOrganizationId(
    { organizationId: "org1" },
    null,
    fakeGetOrg
  );
  expect(id).toBe("org1");
});

test("falls back to session activeOrganizationId", async () => {
  const session: SessionLike = { activeOrganizationId: "activeOrg" };
  const id = await resolveOrganizationId({}, session, fakeGetOrg);
  expect(id).toBe("activeOrg");
});

test("falls back to getActiveOrganization when everything missing", async () => {
  const session: SessionLike = { userId: "user1" };
  const id = await resolveOrganizationId({}, session, fakeGetOrg);
  expect(id).toBe("org-from-user");
});

test("returns undefined when no data", async () => {
  const id = await resolveOrganizationId({}, null, fakeGetOrg);
  expect(id).toBeUndefined();
});
