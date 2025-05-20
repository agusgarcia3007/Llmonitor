import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import { TRUSTED_ORIGINS } from "./constants";
import * as schema from "@/db/schema";

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
});
