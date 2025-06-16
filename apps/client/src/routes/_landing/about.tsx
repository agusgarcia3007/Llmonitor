import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { IconBulb, IconRocket, IconUsers, IconTool } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_landing/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      {
        name: "title",
        content: "About LLMonitor",
      },
    ],
  }),
});

function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-5xl mx-auto px-4 pt-10 pb-20 flex flex-col gap-12 items-center w-full">
      <section className="flex flex-col gap-8 w-full">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary/90 px-3 py-1 rounded-full text-xs font-medium"
            >
              {t("landing.about.badge")}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
              {t("landing.about.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("landing.about.subtitle")}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-lg dark:prose-invert mx-auto"
        >
          <p>{t("landing.about.description1")}</p>
          <p>{t("landing.about.description2")}</p>
        </motion.div>
      </section>

      <Separator className="bg-border/50" />

      <section className="flex flex-col gap-8 w-full">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("landing.about.mission.title")}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t("landing.about.mission.description")}
            </p>
          </motion.div>
        </div>
      </section>

      <Separator className="bg-border/50" />

      <section className="flex flex-col gap-8 w-full">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("landing.about.features.title")}
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex gap-4 items-start"
          >
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <IconRocket size={24} stroke={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {t("landing.about.features.dashboard.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("landing.about.features.dashboard.description")}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-4 items-start"
          >
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <IconBulb size={24} stroke={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {t("landing.about.features.cost.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("landing.about.features.cost.description")}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-4 items-start"
          >
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <IconUsers size={24} stroke={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {t("landing.about.features.providers.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("landing.about.features.providers.description")}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex gap-4 items-start"
          >
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <IconTool size={24} stroke={1.5} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {t("landing.about.features.developer.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("landing.about.features.developer.description")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Separator className="bg-border/50" />

      <section className="flex flex-col gap-8 w-full">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("landing.about.getStarted.title")}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
              {t("landing.about.getStarted.description")}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="/signup"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {t("landing.about.getStarted.cta1")}
              </a>
              <a
                href="https://docs.llmonitor.io"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("landing.about.getStarted.cta2")}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
