// components/StartTrialButton.tsx
import { Button } from "@/components/ui/button";
import { useAuthState } from "@/hooks/use-auth-state";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { PlanSlug, BillingPeriod } from "@/types";

type Props = {
  planSlug: PlanSlug;
  billingPeriod: BillingPeriod;
  variant?: "default" | "secondary" | "outline";
  className?: string;
};

export function StartTrialButton({
  planSlug,
  billingPeriod,
  variant = "default",
  className,
}: Props) {
  const { isLoggedIn } = useAuthState();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      if (!isLoggedIn) {
        navigate({
          to: "/signup",
          search: {
            plan: planSlug,
            period: billingPeriod,
          },
        });
        return;
      }

      try {
        await authClient.subscription.upgrade({
          plan: planSlug,
          annual: billingPeriod === "yearly",
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: `${window.location.origin}/#pricing`,
        });
      } catch (err) {
        toast.error("Checkout failed, please try again.");
        console.error(err);
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      isLoading={isPending}
      variant={variant}
      className={className}
    >
      {t("landing.pricing.startFreeTrial")}
    </Button>
  );
}
