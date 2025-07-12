import { createFileRoute } from "@tanstack/react-router";
import { Pricing } from "@/components/landing/pricing";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_landing/pricing")({
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

  return (
    <div className="py-12 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
