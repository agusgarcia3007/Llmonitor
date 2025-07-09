import { HeroSection } from "@/components/landing/hero-section";
import { Pricing } from "@/components/landing/pricing";
import { Waitlist } from "@/components/landing/waitlist";
import { MagicCard } from "@/components/magicui/magic-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import {
  IconArrowsShuffle,
  IconBell,
  IconCoin,
  IconFlask,
  IconRobot,
  IconSearch,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Footer } from "@/components/layout/footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      {
        name: "title",
        content: "LLMonitor",
      },
    ],
  }),
});

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div variants={item}>
      <MagicCard gradientColor={"var(--color-primary)"} className="p-0">
        <Card className="flex flex-col items-start gap-5 p-6 h-full border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
          <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary/15 transition-colors">
            {icon}
          </div>
          <div>
            <div className="font-semibold text-lg mb-2 group-hover:text-primary/90 transition-colors">
              {title}
            </div>
            <div className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </div>
          </div>
        </Card>
      </MagicCard>
    </motion.div>
  );
}

function Index() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex flex-col justify-start">
      <HeroSection />

      <div className="max-w-5xl mx-auto px-4 pt-10 md:pt-20 flex flex-col gap-12 items-center w-full">
        <Separator className="bg-border/50" />
        <section className="flex flex-col gap-14" id="features">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary/90 px-3 py-1 rounded-full text-xs font-medium"
              >
                {t("landing.features.badge")}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-2">
                {t("landing.features.title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("landing.features.subtitle")}
              </p>
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <FeatureCard
              icon={<IconSearch size={24} stroke={1.5} />}
              title={t("landing.features.analytics.title")}
              description={t("landing.features.analytics.description")}
            />
            <FeatureCard
              icon={<IconRobot size={24} stroke={1.5} />}
              title={t("landing.features.multiModel.title")}
              description={t("landing.features.multiModel.description")}
            />
            <FeatureCard
              icon={<IconCoin size={24} stroke={1.5} />}
              title={t("landing.features.cost.title")}
              description={t("landing.features.cost.description")}
            />
            <FeatureCard
              icon={<IconArrowsShuffle size={24} stroke={1.5} />}
              title={t("landing.features.drift.title")}
              description={t("landing.features.drift.description")}
            />
            <FeatureCard
              icon={<IconFlask size={24} stroke={1.5} />}
              title={t("landing.features.testing.title")}
              description={t("landing.features.testing.description")}
            />
            <FeatureCard
              icon={<IconBell size={24} stroke={1.5} />}
              title={t("landing.features.alerts.title")}
              description={t("landing.features.alerts.description")}
            />
          </motion.div>
        </section>
        <Separator className="bg-border/50" />

        <section className="flex flex-col gap-14" id="pricing">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="bg-accent/30 text-accent-foreground px-3 py-1 rounded-full text-xs font-medium"
              >
                {t("landing.pricing.badge")}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-2">
                {t("landing.pricing.title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("landing.pricing.subtitle")}
              </p>
            </motion.div>
          </div>

          <Pricing />
        </section>

        <Separator className="bg-border/50" />

        <section className="flex flex-col gap-8 items-center" id="waitlist">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-xs font-medium"
              >
                {t("landing.waitlist.badge", "Waitlist")}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-2">
                {t("landing.waitlist.title", "Join the Waitlist")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t(
                  "landing.waitlist.description",
                  "We're working to bring you the best LLM monitoring experience. Be the first to access when ready."
                )}
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
              <Waitlist />
            </Card>
          </motion.div>
        </section>
      </div>
      <Footer />
      <SmoothCursor />
    </div>
  );
}
