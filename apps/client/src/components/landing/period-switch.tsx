import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export type BillingPeriod = "monthly" | "yearly";

interface PeriodSwitchProps {
  onPeriodChange?: (period: BillingPeriod) => void;
}

export function PeriodSwitch({ onPeriodChange }: PeriodSwitchProps) {
  const id = useId();
  const [selectedValue, setSelectedValue] = useState("off");
  const { t } = useTranslation();

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    if (onPeriodChange) {
      onPeriodChange(value === "off" ? "monthly" : "yearly");
    }
  };

  return (
    <div className="bg-input/50 inline-flex h-9 max-w-fit mx-auto rounded-md p-0.5">
      <RadioGroup
        value={selectedValue}
        onValueChange={handleValueChange}
        className="group after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-sm after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] data-[state=off]:after:translate-x-0 data-[state=on]:after:translate-x-full"
        data-state={selectedValue}
      >
        <label className="group-data-[state=on]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          {t("landing.periodSwitch.billMonthly")}
          <RadioGroupItem id={`${id}-1`} value="off" className="sr-only" />
        </label>
        <label className="group-data-[state=off]:text-muted-foreground/70 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none">
          <span>
            {t("landing.periodSwitch.billYearly")}{" "}
            <span className="transition-colors text-emerald-500">
              {t("landing.periodSwitch.monthsFree")}
            </span>
          </span>
          <RadioGroupItem id={`${id}-2`} value="on" className="sr-only" />
        </label>
      </RadioGroup>
    </div>
  );
}
