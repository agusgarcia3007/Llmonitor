import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import { TRUSTED_ORIGINS } from "./constants";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { getActiveOrganization } from "./utils";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: TRUSTED_ORIGINS,
  rateLimit: {
    window: 10, // time window in seconds
    max: 100, // max requests in the window
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  plugins: [organization(), admin()],

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await getActiveOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id ?? null,
            },
          };
        },
      },
    },
    user: {
      create: {
        after: async (user, request) => {
          const orgs = await db
            .select()
            .from(schema.member)
            .where(eq(schema.member.userId, user.id));
          console.log({ orgs });
          if (orgs.length === 0) {
            const orgName = `${user.email.split("@")[0]}-${randomUUID().slice(
              0,
              4
            )}`;
            const orgId = randomUUID();
            await db.insert(schema.organization).values({
              id: orgId,
              name: orgName,
              createdAt: new Date(),
            });
            await db.insert(schema.member).values({
              id: randomUUID(),
              userId: user.id,
              organizationId: orgId,
              role: "owner",
              createdAt: new Date(),
            });
            // Persiste la organización activa en el usuario
            await db
              .update(schema.user)
              .set({ lastActiveOrganizationId: orgId })
              .where(eq(schema.user.id, user.id));
          }
        },
      },
    },
  },
});
