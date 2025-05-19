import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroHeader } from "@/components/landing/header";

export const Route = createFileRoute("/")({
  component: Index,
});

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-2 p-6">
      <div className="text-3xl">{icon}</div>
      <div className="font-semibold text-lg text-center">{title}</div>
      <div className="text-muted-foreground text-center text-sm">
        {description}
      </div>
    </Card>
  );
}

function Index() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <HeroHeader />
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col gap-16">
        <section className="flex flex-col items-center gap-4 text-center">
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
          >
            {t("hero.badge")}
          </Badge>
          <h1
            className="text-4xl md:text-5xl font-extrabold leading-tight"
            dangerouslySetInnerHTML={{ __html: t("hero.title.default") }}
          />
          <p className="text-lg text-muted-foreground max-w-xl">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button size="lg" asChild>
              <a
                href="#"
                className="bg-primary text-primary-foreground px-6 py-2 rounded font-semibold text-base shadow hover:bg-primary/90 transition"
              >
                {t("hero.cta")}
              </a>
            </Button>
            <Button variant="link" size="lg" asChild>
              <a
                href="#"
                className="underline text-primary font-medium text-base flex items-center gap-1"
              >
                {t("hero.demo")}
              </a>
            </Button>
          </div>
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureCard
            icon="🛒"
            title={t("hero.feature1.title")!}
            description={t("hero.feature1.description")!}
          />
          <FeatureCard
            icon="⚡"
            title={t("hero.feature2.title")!}
            description={t("hero.feature2.description")!}
          />
          <FeatureCard
            icon="👥"
            title={t("hero.feature3.title")!}
            description={t("hero.feature3.description")!}
          />
          <FeatureCard
            icon="🔌"
            title={t("hero.feature4.title")!}
            description={t("hero.feature4.description")!}
          />
        </section>
        <section className="flex flex-col items-center gap-4 text-center">
          <Badge
            variant="secondary"
            className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
          >
            {t("hero.techBadge")}
          </Badge>
          <h2 className="text-2xl font-bold">{t("hero.techTitle")}</h2>
          <div className="flex flex-wrap gap-3 justify-center text-base font-medium mt-2">
            <Badge variant="outline">{t("hero.tech1")}</Badge>
            <Badge variant="outline">{t("hero.tech2")}</Badge>
            <Badge variant="outline">{t("hero.tech3")}</Badge>
            <Badge variant="outline">{t("hero.tech4")}</Badge>
          </div>
        </section>
        <section className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-2xl font-bold">{t("hero.waitlistTitle")}</h2>
          <p className="text-muted-foreground max-w-lg">
            {t("hero.waitlistSubtitle")}
          </p>
          <form className="flex flex-col sm:flex-row gap-2 w-full max-w-md mx-auto">
            <Input type="email" placeholder="Email" className="flex-1" />
            <Button type="submit" size="lg">
              {t("hero.cta")}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
