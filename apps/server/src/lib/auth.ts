import { db } from "@/db";
import * as schema from "@/db/schema";
import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, openAPI, organization } from "better-auth/plugins";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { TRUSTED_ORIGINS } from "./constants";
import { getActiveOrganization } from "./utils";
import { EmailService } from "./email-service";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const emailService = new EmailService();
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  trustedOrigins: TRUSTED_ORIGINS,
  rateLimit: {
    window: 10, // time window in seconds
    max: 100, // max requests in the window
  },
  advanced: {
    crossSubDomainCookies: { enabled: true },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  plugins: [
    organization({
      cancelPendingInvitationsOnReInvite: true,
      sendInvitationEmail: async (invitation, request) => {
        try {
          const organizationName = invitation.organization.name;
          const inviterName =
            invitation.inviter.user.name ||
            invitation.inviter.user.email ||
            "Someone";

          await emailService.sendInvitationEmail(
            invitation.email,
            organizationName,
            inviterName,
            invitation.role,
            invitation.id
          );

          console.log(
            `Invitation email sent to ${invitation.email} for organization ${organizationName}`
          );
        } catch (error) {
          console.error("Failed to send invitation email:", error);
        }
      },
    }),
    admin(),
    apiKey(),
    openAPI(),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
    }),
  ],

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
          try {
            const orgs = await db
              .select()
              .from(schema.member)
              .where(eq(schema.member.userId, user.id));
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
              await db
                .update(schema.user)
                .set({ lastActiveOrganizationId: orgId })
                .where(eq(schema.user.id, user.id));
            }
          } catch (error) {
            console.error(error);
          }
        },
      },
    },
  },
});
