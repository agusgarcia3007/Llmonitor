import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconLanguage } from "@tabler/icons-react";

export function LanguageSwitch() {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground">
          <IconLanguage className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">
            {t("common.languageSwitch.changeLanguage")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => i18n.changeLanguage("en")}
          className={currentLanguage === "en" ? "bg-accent" : ""}
        >
          <span className="mr-2">🇺🇸</span> {t("common.languageSwitch.english")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => i18n.changeLanguage("es")}
          className={currentLanguage === "es" ? "bg-accent" : ""}
        >
          <span className="mr-2">🇪🇸</span> {t("common.languageSwitch.spanish")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
