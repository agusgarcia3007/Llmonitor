import {
  FieldType,
  type AdvancedFilterField,
} from "@/components/ui/advanced-filters";

export const createTextFilter = (
  id: string,
  label: string,
  backendKey?: string
): AdvancedFilterField => ({
  id,
  label,
  type: FieldType.TEXT,
  backendKey,
});

export const createSelectFilter = (
  id: string,
  label: string,
  options: string[],
  backendKey?: string
): AdvancedFilterField => ({
  id,
  label,
  type: FieldType.SELECT,
  options,
  backendKey,
});

export const createDateRangeFilter = (
  id: string,
  label: string,
  backendKey?: string
): AdvancedFilterField => ({
  id,
  label,
  type: FieldType.DATE_RANGE,
  backendKey,
});

export const createSliderFilter = (
  id: string,
  label: string,
  min: number,
  max: number,
  step: number = 1,
  options?: {
    backendKey?: string;
    minSuffix?: string;
    maxSuffix?: string;
    transform?: (value: unknown) => Record<string, unknown>;
  }
): AdvancedFilterField => {
  const defaultTransform = (value: unknown) => {
    const sliderValue = value as number[];
    const result: Record<string, unknown> = {};
    if (sliderValue && sliderValue.length === 2) {
      const backendKey = options?.backendKey || id;
      const minKey = options?.minSuffix
        ? `${backendKey}${options.minSuffix}`
        : `${backendKey}Min`;
      const maxKey = options?.maxSuffix
        ? `${backendKey}${options.maxSuffix}`
        : `${backendKey}Max`;

      if (sliderValue[0] !== min) {
        result[minKey] = sliderValue[0];
      }
      if (sliderValue[1] !== max) {
        result[maxKey] = sliderValue[1];
      }
    }
    return result;
  };

  return {
    id,
    label,
    type: FieldType.SLIDER,
    min,
    max,
    step,
    backendKey: options?.backendKey,
    transform: options?.transform || defaultTransform,
  };
};

export const createNumberFilter = (
  id: string,
  label: string,
  backendKey?: string
): AdvancedFilterField => ({
  id,
  label,
  type: FieldType.NUMBER,
  backendKey,
});

export const CommonFilters = {
  dateRange: (label: string = "Date", backendKey: string = "date") =>
    createDateRangeFilter("date", label, backendKey),

  provider: (
    options: string[] = [
      "openai",
      "anthropic",
      "deepseek",
      "cohere",
      "google",
      "custom",
    ]
  ) => createSelectFilter("provider", "Provider", options),

  model: () => createTextFilter("model", "Model"),

  latency: (maxMs: number = 10000, step: number = 100) =>
    createSliderFilter("latency_ms", "Latency (ms)", 0, maxMs, step, {
      transform: (value: unknown) => {
        const sliderValue = value as number[];
        const result: Record<string, unknown> = {};
        if (sliderValue && sliderValue.length === 2) {
          if (sliderValue[0] !== 0) {
            result["latencyMin"] = sliderValue[0];
          }
          if (sliderValue[1] !== maxMs) {
            result["latencyMax"] = sliderValue[1];
          }
        }
        return result;
      },
    }),

  cost: (maxCost: number = 10, step: number = 0.01) =>
    createSliderFilter("cost_usd", "Cost (USD)", 0, maxCost, step, {
      transform: (value: unknown) => {
        const sliderValue = value as number[];
        const result: Record<string, unknown> = {};
        if (sliderValue && sliderValue.length === 2) {
          if (sliderValue[0] !== 0) {
            result["costMin"] = sliderValue[0];
          }
          if (sliderValue[1] !== maxCost) {
            result["costMax"] = sliderValue[1];
          }
        }
        return result;
      },
    }),
};
