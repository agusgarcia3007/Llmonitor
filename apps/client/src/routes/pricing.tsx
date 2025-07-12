import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Pricing } from "@/components/landing/pricing";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      {
        name: "title",
        content: "Pricing - LLMonitor",
      },
    ],
  }),
});

function PricingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();

  const handleDenyPayment = async () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            document.cookie =
              "isAuthenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            navigate({ to: "/" });
          },
        },
      });
    });
  };
  return (
    <div className="py-12 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          size="icon"
          isLoading={pending}
          variant="outline"
          onClick={handleDenyPayment}
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {t("landing.pricing.pageTitle")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("landing.pricing.pageDescription")}
          </p>
        </div>
        <Pricing />
      </div>
    </div>
  );
}
