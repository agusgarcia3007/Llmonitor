import { Waitlist } from "@/components/landing/waitlist";
import { HeroSection } from "@/components/landing/hero-section";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  IconApi,
  IconArrowsShuffle,
  IconBell,
  IconBrandFramer,
  IconBrandVscode,
  IconBulb,
  IconCoin,
  IconFlask,
  IconLock,
  IconRobot,
  IconRocket,
  IconSearch,
  IconTool,
  IconUsers,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Pricing } from "@/components/landing/pricing";

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
    </motion.div>
  );
}

function Index() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background  to-background/95 flex flex-col justify-start">
      <HeroSection />

      <div className="max-w-5xl mx-auto px-4 pt-10 md:pt-20 flex flex-col gap-12 items-center w-full">
        <Separator className="bg-border/50" />

        <section className="flex flex-col gap-14">
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

        <section className="flex flex-col gap-14">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="outline"
                className="bg-secondary/30 text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium"
              >
                {t("landing.developers.badge")}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-2">
                {t("landing.developers.title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("landing.developers.subtitle")}
              </p>
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={item}>
              <Card className="p-6 text-center border border-border/50 bg-card/30 backdrop-blur-sm hover:border-secondary/20 transition-all duration-300 h-full hover:shadow-lg group">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <IconBrandVscode
                    size={24}
                    className="text-secondary-foreground"
                    stroke={1.5}
                  />
                </div>
                <p className="font-medium mb-2">
                  {t("landing.developers.integration")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("landing.developers.integrationDesc")}
                </p>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="p-6 text-center border border-border/50 bg-card/30 backdrop-blur-sm hover:border-secondary/20 transition-all duration-300 h-full hover:shadow-lg group">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <IconApi
                    size={24}
                    className="text-secondary-foreground"
                    stroke={1.5}
                  />
                </div>
                <p className="font-medium mb-2">
                  {t("landing.developers.api")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("landing.developers.apiDesc")}
                </p>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="p-6 text-center border border-border/50 bg-card/30 backdrop-blur-sm hover:border-secondary/20 transition-all duration-300 h-full hover:shadow-lg group">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <IconLock
                    size={24}
                    className="text-secondary-foreground"
                    stroke={1.5}
                  />
                </div>
                <p className="font-medium mb-2">
                  {t("landing.developers.noLockIn")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("landing.developers.noLockInDesc")}
                </p>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="p-6 text-center border border-border/50 bg-card/30 backdrop-blur-sm hover:border-secondary/20 transition-all duration-300 h-full hover:shadow-lg group">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
                  <IconBrandFramer
                    size={24}
                    className="text-secondary-foreground"
                    stroke={1.5}
                  />
                </div>
                <p className="font-medium mb-2">
                  {t("landing.developers.frameworks")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("landing.developers.frameworksDesc")}
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        <Separator className="bg-border/50" />

        <section className="flex flex-col gap-14">
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
                {t("landing.audience.badge")}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mt-3 mb-2">
                {t("landing.audience.title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("landing.ecosystem")}
              </p>
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={item}>
              <Card className="p-6 border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 h-full hover:shadow-lg group">
                <div className="flex gap-4 items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/15 transition-colors">
                    <IconUsers stroke={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-lg mb-1 group-hover:text-primary/90 transition-colors">
                      {t("landing.audience.teams")}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t("landing.audience.teamsDesc")}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="p-6 border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 h-full hover:shadow-lg group">
                <div className="flex gap-4 items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/15 transition-colors">
                    <IconRocket stroke={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-lg mb-1 group-hover:text-primary/90 transition-colors">
                      {t("landing.audience.startups")}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t("landing.audience.startupsDesc")}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="p-6 border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 h-full hover:shadow-lg group">
                <div className="flex gap-4 items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/15 transition-colors">
                    <IconTool stroke={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-lg mb-1 group-hover:text-primary/90 transition-colors">
                      {t("landing.audience.builders")}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t("landing.audience.buildersDesc")}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
            <motion.div variants={item}>
              <Card className="p-6 border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/20 transition-all duration-300 h-full hover:shadow-lg group">
                <div className="flex gap-4 items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/15 transition-colors">
                    <IconBulb stroke={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-lg mb-1 group-hover:text-primary/90 transition-colors">
                      {t("landing.audience.anyone")}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t("landing.audience.anyoneDesc")}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        <Separator className="bg-border/50" />

        <Pricing />

        <motion.section
          className="flex flex-col items-center gap-8 text-center bg-gradient-to-b from-card/80 to-card/30 backdrop-blur-sm p-10 rounded-xl border border-border/50 shadow-lg relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1.5 }}
          />

          <div>
            <Badge
              variant="default"
              className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium mb-4"
            >
              {t("landing.waitlist.badge")}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {t("landing.waitlist.title")}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto mb-6">
              {t("landing.waitlist.subtitle")}
            </p>
          </div>

          <div className="w-full">
            <Waitlist />
          </div>
        </motion.section>

        <footer className="text-center text-sm text-muted-foreground pt-4">
          <p>
            {t("landing.footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </footer>
      </div>
    </div>
  );
}
