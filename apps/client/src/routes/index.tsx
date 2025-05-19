import { Waitlist } from "@/components/landing/waitlist";
import { LanguageSwitch } from "@/components/layout/language-switch";
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
  IconChevronRight,
  IconCoin,
  IconFlask,
  IconLock,
  IconRobot,
  IconRocket,
  IconSearch,
  IconTool,
  IconUsers,
  IconSparkles,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

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
    <div className="min-h-screen bg-gradient-to-b from-background p-4 to-background/95">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitch />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-24 flex flex-col gap-20">
        <motion.section
          className="flex flex-col items-center gap-8 text-center relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="absolute w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1.5 }}
          />

          <Badge
            variant="outline"
            className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide"
          >
            {t("landing.badge")}
          </Badge>

          <motion.h1
            className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight max-w-2xl text-secondary-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {t("landing.title")}
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {t("landing.subtitle")}
          </motion.p>

          <motion.div
            className="flex items-center gap-2 text-primary/80 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <IconSparkles size={18} stroke={1.5} />
            <span>{t("landing.ecosystem")}</span>
          </motion.div>
          <div className="flex items-center gap-2">
            <Waitlist />
          </div>
        </motion.section>

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
                Comprehensive tools to understand, optimize, and troubleshoot
                your LLM interactions
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

        <motion.div
          className="relative rounded-xl overflow-hidden border border-border/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 md:p-12">
            <div className="max-w-3xl">
              <h3 className="text-2xl font-bold mb-4">
                Centralized AI Monitoring Dashboard
              </h3>
              <p className="text-muted-foreground mb-6">
                Our intuitive dashboard provides real-time metrics on prompts,
                completions, token usage, costs, latency, and more — enabling
                data-driven optimization of your AI investments.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium">
                <span>Explore our analytics capabilities</span>
                <IconChevronRight size={18} stroke={1.5} />
              </div>
            </div>
          </div>
        </motion.div>

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
                Built by developers, for developers — minimal integration
                effort, maximum insight
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
                  Just one line of code to start getting insights
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
                  Designed with developer experience in mind
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
                  Freedom to switch models and providers anytime
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
                  Seamless integration with your existing stack
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
                Whether you're building your first AI feature or scaling
                enterprise AI systems
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
                    <IconUsers size={22} stroke={1.5} />
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
                    <IconRocket size={22} stroke={1.5} />
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
                    <IconTool size={22} stroke={1.5} />
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
                    <IconBulb size={22} stroke={1.5} />
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

        <motion.section
          className="flex flex-col items-center gap-8 text-center bg-gradient-to-b from-card/80 to-card/30 backdrop-blur-sm p-10 rounded-xl border border-border/50 shadow-lg relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="absolute w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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

          <div className="w-full max-w-md">
            <Waitlist />
          </div>
        </motion.section>

        <footer className="text-center text-sm text-muted-foreground pt-4">
          <p>© {new Date().getFullYear()} LLMonitor.</p>
        </footer>
      </div>
    </div>
  );
}
