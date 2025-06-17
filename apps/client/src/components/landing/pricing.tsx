import { Check } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { PeriodSwitch, type BillingPeriod } from "./period-switch";
import { useState } from "react";
import { NumberTicker } from "../magicui/number-ticker";

export function Pricing() {
  const { t } = useTranslation();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");

  const hobbyFeatures = [
    t("landing.pricing.hobby.feature1"),
    t("landing.pricing.hobby.feature2"),
    t("landing.pricing.hobby.feature3"),
    t("landing.pricing.hobby.feature4"),
    t("landing.pricing.hobby.feature5"),
  ];

  const proFeatures = [
    t("landing.pricing.pro.feature1"),
    t("landing.pricing.pro.feature2"),
    t("landing.pricing.pro.feature3"),
    t("landing.pricing.pro.feature4"),
    t("landing.pricing.pro.feature5"),
    t("landing.pricing.pro.feature6"),
    t("landing.pricing.pro.feature7"),
  ];

  const enterpriseFeatures = [
    t("landing.pricing.enterprise.feature1"),
    t("landing.pricing.enterprise.feature2"),
    t("landing.pricing.enterprise.feature3"),
    t("landing.pricing.enterprise.feature4"),
    t("landing.pricing.enterprise.feature5"),
    t("landing.pricing.enterprise.feature6"),
    t("landing.pricing.enterprise.feature7"),
  ];

  // Obtener los valores numéricos de los precios
  const hobbyPrice = 0;
  const proPrice = 20;

  // Calcular los precios según el período de facturación
  const currentProPrice = billingPeriod === "yearly" ? proPrice * 10 : proPrice;

  return (
    <div className="flex flex-col gap-y-2">
      <PeriodSwitch onPeriodChange={setBillingPeriod} />
      <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-3 container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-medium">
              {t("landing.pricing.hobby.title")}
            </CardTitle>

            <span className="my-3 block text-2xl font-semibold">
              ${hobbyPrice} / {billingPeriod === "yearly" ? "year" : "mo"}
            </span>

            <CardDescription className="text-sm">
              {t("landing.pricing.hobby.description")}
            </CardDescription>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/signup">{t("landing.pricing.hobby.cta")}</Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <hr className="border-dashed" />

            <ul className="list-outside space-y-3 text-sm">
              {hobbyFeatures.map((item: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="size-3" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="relative">
          <span className="bg-primary absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">
            {t("landing.pricing.pro.popular")}
          </span>

          <CardHeader>
            <CardTitle className="font-medium">
              {t("landing.pricing.pro.title")}
            </CardTitle>

            <span className="my-3 block text-2xl font-semibold">
              $
              <NumberTicker
                value={currentProPrice}
                startValue={currentProPrice / 2}
                className="text-2xl font-semibold"
              />{" "}
              / {billingPeriod === "yearly" ? "year" : "mo"}
            </span>

            <CardDescription className="text-sm">
              {t("landing.pricing.pro.description")}
            </CardDescription>

            <Button asChild className="mt-4 w-full">
              <Link to="/signup">{t("landing.pricing.pro.cta")}</Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <hr className="border-dashed" />

            <ul className="list-outside space-y-3 text-sm">
              {proFeatures.map((item: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="size-3" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-medium">
              {t("landing.pricing.enterprise.title")}
            </CardTitle>

            <span className="my-3 block text-2xl font-semibold">
              {t("landing.pricing.enterprise.price")}
            </span>

            <CardDescription className="text-sm">
              {t("landing.pricing.enterprise.description")}
            </CardDescription>

            <Button asChild variant="outline" className="mt-4 w-full">
              <Link to="/signup">{t("landing.pricing.enterprise.cta")}</Link>
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <hr className="border-dashed" />

            <ul className="list-outside space-y-3 text-sm">
              {enterpriseFeatures.map((item: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="size-3" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
