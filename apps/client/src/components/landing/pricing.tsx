import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLANS } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PeriodSwitch, type BillingPeriod } from "./period-switch";
import { StartTrialButton } from "./start-trial-button";
import type { PlanSlug } from "@/types";

export function Pricing() {
  const { t } = useTranslation();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  return (
    <div className="flex flex-col gap-y-4 px-4 sm:px-6 lg:px-8">
      <PeriodSwitch onPeriodChange={setBillingPeriod} />
      <div className="mt-8 grid gap-6 md:mt-20 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 container mx-auto">
        {PLANS.slice(0, 3).map((plan, index) => {
          const currentPrice =
            plan.monthlyPrice !== null
              ? billingPeriod === "yearly"
                ? plan.monthlyPrice * 10
                : plan.monthlyPrice
              : "Custom";

          const periodText =
            plan.monthlyPrice !== null
              ? `/ ${billingPeriod === "yearly" ? "year" : "mo"}`
              : "";

          const features = [
            `${plan.events} included events / month`,
            `${plan.retention} days retention`,
            `Extra events at ${plan.extra}`,
          ];

          return (
            <Card
              key={index}
              className={`relative flex flex-col min-h-[420px] ${
                plan.isPopular ? "ring-2 ring-primary shadow-lg" : ""
              }`}
            >
              {plan.isPopular && (
                <span className="bg-primary absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">
                  {t("landing.pricing.pro.popular")}
                </span>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="font-medium text-lg">
                  {plan.name}
                </CardTitle>

                <span className="my-3 block text-3xl font-semibold">
                  ${currentPrice} {periodText}
                </span>

                <CardDescription className="text-sm text-muted-foreground">
                  {plan.note}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                <hr className="border-dashed" />

                <ul className="list-outside space-y-3 text-sm">
                  {features.map((item, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2">
                      <Check className="size-4 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <div className="p-6 pt-0">
                <StartTrialButton
                  planSlug={plan.slug as PlanSlug}
                  billingPeriod={billingPeriod}
                  variant={plan.variant}
                  className="w-full"
                />
              </div>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 container mx-auto">
        {(() => {
          const plan = PLANS[3];
          const currentPrice =
            plan.monthlyPrice !== null
              ? billingPeriod === "yearly"
                ? plan.monthlyPrice * 10
                : plan.monthlyPrice
              : "Custom";
          const periodText =
            plan.monthlyPrice !== null
              ? `/ ${billingPeriod === "yearly" ? "year" : "mo"}`
              : "";
          const features = [
            `${plan.events} included events / month`,
            `${plan.retention} retention`,
            `Extra events at ${plan.extra}`,
          ];
          return (
            <Card className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1 lg:max-w-md">
                  <CardTitle className="text-xl font-medium mb-2">
                    {plan.name}
                  </CardTitle>
                  <span className="block text-3xl font-semibold mb-3">
                    ${currentPrice} {periodText}
                  </span>
                  <CardDescription className="text-sm mb-4">
                    {plan.note}
                  </CardDescription>
                  <Button
                    asChild
                    variant={plan.variant}
                    className="w-full sm:w-auto"
                  >
                    <Link
                      to="/signup"
                      search={{ plan: undefined, period: undefined }}
                    >
                      Contact us
                    </Link>
                  </Button>
                </div>
                <div className="flex-1 lg:pl-8">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 text-sm">
                    {features.map((item, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2">
                        <Check className="size-4 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })()}
      </div>
    </div>
  );
}
