import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FilterXIcon } from "lucide-react";
import { memo } from "react";
import type { DataTableFilterActions } from "../core/types";
import type { Locale } from "@/types";
import { useTranslation } from "react-i18next";

interface FilterActionsProps {
  hasFilters: boolean;
  actions?: DataTableFilterActions;
  locale?: Locale;
}

function FilterActionsInner({
  hasFilters,
  actions,
  locale = "en",
}: FilterActionsProps) {
  const { t } = useTranslation("filters");
  return (
    <Button
      className={cn("h-7 !px-2", !hasFilters && "hidden")}
      variant="destructive"
      onClick={actions?.removeAllFilters}
    >
      <FilterXIcon />
      <span className="hidden md:block">{t("clear", { lng: locale })}</span>
    </Button>
  );
}

export const FilterActions = memo(
  FilterActionsInner
) as typeof FilterActionsInner;
