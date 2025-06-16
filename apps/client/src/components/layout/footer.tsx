import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background/95 border-t border-border/50 mt-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo.svg"
                alt="LLMonitor"
                className={cn(
                  "transition-all dark:invert duration-300 !size-7"
                )}
              />
              <span className="text-base font-semibold">LLMonitor</span>
            </Link>
            <p className="text-muted-foreground mt-2 text-sm">
              {t("landing.about.subtitle")}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <a
                href="https://github.com/LLMonitor/LLMonitor-core"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <IconBrandGithub size={20} stroke={1.5} />
              </a>
              <a
                href="https://x.com/agus_build"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <IconBrandTwitter size={20} stroke={1.5} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            {t("landing.footer.copyright", { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  );
}
