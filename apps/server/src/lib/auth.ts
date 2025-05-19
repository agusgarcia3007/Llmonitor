import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, organization } from "better-auth/plugins";
import { prisma } from "./prisma";
import { TRUSTED_ORIGINS } from "./constants";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
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
});
