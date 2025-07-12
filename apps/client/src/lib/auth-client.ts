import { stripeClient } from "@better-auth/stripe/client";
import {
  adminClient,
  apiKeyClient,
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  plugins: [
    organizationClient(),
    adminClient(),
    apiKeyClient(),
    stripeClient({
      subscription: true,
    }),
    inferAdditionalFields({
      session: {
        activeOrganizationId: { type: "string", required: false },
      },
    }),
  ],
  fetchOptions: {
    onError: (ctx) => {
      toast.error(ctx.error.message);
    },
  },
});
