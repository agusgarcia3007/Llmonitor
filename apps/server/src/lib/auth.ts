import { db } from "@/db";
import * as schema from "@/db/schema";
import { stripe } from "@better-auth/stripe";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, organization } from "better-auth/plugins";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { siteData, TRUSTED_ORIGINS } from "./constants";
import { EmailService } from "./email-service";
import { getActiveOrganization, getActiveSubscription } from "./utils";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const options = {
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendResetPassword: async ({ user, url, token }) => {
      const redirectUrl = `${siteData.url}/reset-password?token=${token}`;

      try {
        await emailService.sendResetPasswordEmail(
          user.email,
          user.name || "",
          redirectUrl
        );

        console.log(`[+] Reset password email sent to ${user.email}`);
      } catch (error) {
        console.error("[-] Failed to send reset password email:", error);
      }
    },
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
    max: 1000,
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
    apiKey({
      rateLimit: {
        enabled: true,
        timeWindow: 1000, // 1 segundo entre solicitudes
        maxRequests: 100, // 100 solicitudes por ventana de tiempo
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,

      subscription: {
        enabled: true,

        plans: [
          {
            name: "pro-lite",
            priceId: "price_1RjkqhBvY3hUsoTthaIpZEbu", // 20 USD monthly (licensed)
            annualDiscountPriceId: "price_1RjkrgBvY3hUsoTt5MJwEcGz", // 200 USD yearly
            limits: {
              events: 50_000,
              dataRetentionDays: 30,
              users: -1,
              projects: -1,
            },
            freeTrial: { days: 14 },
          },
          {
            name: "pro-growth",
            priceId: "price_1RjkqwBvY3hUsoTtT1Y7OnrU", // 45 USD monthly
            annualDiscountPriceId: "price_1RjkrxBvY3hUsoTtbYBBa518",
            limits: {
              events: 250_000,
              dataRetentionDays: 90,
              users: -1,
              projects: -1,
            },
            freeTrial: { days: 14 },
          },
          {
            name: "pro-scale",
            priceId: "price_1RjkrMBvY3hUsoTtdWkfgoQ4", // 90 USD monthly
            annualDiscountPriceId: "price_1RjksHBvY3hUsoTtpl9JCEaW",
            limits: {
              events: 1_000_000,
              dataRetentionDays: 365,
              users: -1,
              projects: -1,
            },
            freeTrial: { days: 14 },
          },
          // Enterprise is “contact-sales”, so no priceId here
        ],

        onSubscriptionComplete: async ({ stripeSubscription }) => {
          await stripeClient.subscriptionItems.create({
            subscription: stripeSubscription.id,
            price: "price_1Rjl2dBvY3hUsoTtgGFrUViN", // add-on metered (0.00002 USD/event)
            quantity: 0, // evita enviar “quantity: 1”
          });
        },
      },
    }),
  ],

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const [organization] = await Promise.all([
            getActiveOrganization(session.userId),
          ]);

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
} satisfies BetterAuthOptions;

const emailService = new EmailService();
export const auth = betterAuth({
  ...options,
});
