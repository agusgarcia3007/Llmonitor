import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  organizationClient,
  apiKeyClient,
} from "better-auth/client/plugins";
import { toast } from "sonner";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  plugins: [
    organizationClient(),
    adminClient(),
    apiKeyClient(),
    stripeClient({
      subscription: true,
    }),
  ],
  fetchOptions: {
    onError: (ctx) => {
      toast.error(ctx.error.message);
    },
  },
});
