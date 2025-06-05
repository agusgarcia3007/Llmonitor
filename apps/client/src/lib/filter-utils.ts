import {
  FieldType,
  type AdvancedFilterField,
} from "@/components/ui/advanced-filters";

interface FilterDisplayConfig {
  key: string;
  label: string;
  value: string;
  field: AdvancedFilterField;
}

export interface ExtendedFilterField extends AdvancedFilterField {
  parseForDisplay?: (
    appliedFilters: Record<string, unknown>,
    processedKeys: Set<string>
  ) => FilterDisplayConfig | null;
  removeKeys?: string[];
  getRemovalKeys?: (appliedFilters: Record<string, unknown>) => string[];
}

const formatFilterValue = (
  field: AdvancedFilterField,
  value: unknown
): string => {
  switch (field.type) {
    case FieldType.TEXT:
    case FieldType.NUMBER:
      return String(value);

    case FieldType.SELECT: {
      const selectValue = value as string[];
      return selectValue.join(", ");
    }

    case FieldType.DATE_RANGE: {
      const dateValue = value as { from?: string; to?: string };
      if (dateValue.from && dateValue.to) {
        return `${new Date(dateValue.from).toLocaleDateString()} - ${new Date(
          dateValue.to
        ).toLocaleDateString()}`;
      } else if (dateValue.from) {
        return `From ${new Date(dateValue.from).toLocaleDateString()}`;
      } else if (dateValue.to) {
        return `Until ${new Date(dateValue.to).toLocaleDateString()}`;
      }
      return "";
    }

    case FieldType.SLIDER: {
      const sliderValue = value as number[];
      if (sliderValue && sliderValue.length === 2) {
        return `${sliderValue[0]} - ${sliderValue[1]}`;
      }
      return String(value);
    }

    default:
      return String(value);
  }
};

export const parseFiltersForDisplay = (
  appliedFilters: Record<string, unknown>,
  fields: ExtendedFilterField[]
): FilterDisplayConfig[] => {
  const displayFilters: FilterDisplayConfig[] = [];
  const processedKeys = new Set<string>();

  for (const field of fields) {
    if (field.parseForDisplay) {
      const result = field.parseForDisplay(appliedFilters, processedKeys);
      if (result) {
        displayFilters.push(result);
      }
    }
  }

  Object.entries(appliedFilters).forEach(([key, value]) => {
    if (processedKeys.has(key) || value === undefined || value === null) return;

    const field = fields.find((f) => f.id === key || f.backendKey === key);
    if (field) {
      let displayValue = value;

      if (Array.isArray(value) && value.length > 0) {
        displayValue = value;
      } else if (typeof value === "string" && value.trim() !== "") {
        displayValue = value;
      } else {
        return;
      }

      displayFilters.push({
        key,
        label: field.label,
        value: formatFilterValue(field, displayValue),
        field,
      });
    }
  });

  return displayFilters;
};

export const removeFilter = (
  filterKey: string,
  appliedFilters: Record<string, unknown>,
  fields: ExtendedFilterField[]
): Record<string, unknown> => {
  const newFilters = { ...appliedFilters };
  const field = fields.find(
    (f) => f.id === filterKey || f.backendKey === filterKey
  );

  if (field) {
    if (field.getRemovalKeys) {
      const keysToRemove = field.getRemovalKeys(appliedFilters);
      keysToRemove.forEach((key) => delete newFilters[key]);
    } else if (field.removeKeys) {
      field.removeKeys.forEach((key) => delete newFilters[key]);
    } else {
      delete newFilters[filterKey];
    }
  } else {
    delete newFilters[filterKey];
  }

  return newFilters;
};

const createRangeFilterParser = (
  baseId: string,
  label: string,
  minSuffix: string = "Min",
  maxSuffix: string = "Max"
) => {
  return (
    appliedFilters: Record<string, unknown>,
    processedKeys: Set<string>
  ): FilterDisplayConfig | null => {
    const minKey = `${baseId}${minSuffix}`;
    const maxKey = `${baseId}${maxSuffix}`;
    const minValue = appliedFilters[minKey];
    const maxValue = appliedFilters[maxKey];

    if (
      (minValue !== undefined || maxValue !== undefined) &&
      !processedKeys.has(minKey) &&
      !processedKeys.has(maxKey)
    ) {
      processedKeys.add(minKey);
      processedKeys.add(maxKey);

      const rangeValue = [minValue || 0, maxValue || 100];
      return {
        key: baseId,
        label,
        value: formatFilterValue(
          { type: FieldType.SLIDER } as AdvancedFilterField,
          rangeValue
        ),
        field: {
          id: baseId,
          label,
          type: FieldType.SLIDER,
        } as AdvancedFilterField,
      };
    }

    return null;
  };
};

const createDateRangeFilterParser = (baseId: string, label: string) => {
  return (
    appliedFilters: Record<string, unknown>,
    processedKeys: Set<string>
  ): FilterDisplayConfig | null => {
    const fromKey = `${baseId}From`;
    const toKey = `${baseId}To`;
    const fromValue = appliedFilters[fromKey];
    const toValue = appliedFilters[toKey];

    if (
      (fromValue || toValue) &&
      !processedKeys.has(fromKey) &&
      !processedKeys.has(toKey)
    ) {
      processedKeys.add(fromKey);
      processedKeys.add(toKey);

      const dateValue = {
        from: fromValue as string,
        to: toValue as string,
      };

      return {
        key: baseId,
        label,
        value: formatFilterValue(
          { type: FieldType.DATE_RANGE } as AdvancedFilterField,
          dateValue
        ),
        field: {
          id: baseId,
          label,
          type: FieldType.DATE_RANGE,
        } as AdvancedFilterField,
      };
    }

    return null;
  };
};

export const createTextFilter = (
  id: string,
  label: string,
  backendKey?: string
): ExtendedFilterField => ({
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
): ExtendedFilterField => ({
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
): ExtendedFilterField => ({
  id,
  label,
  type: FieldType.DATE_RANGE,
  backendKey,
  parseForDisplay: createDateRangeFilterParser(backendKey || id, label),
  getRemovalKeys: () => [`${backendKey || id}From`, `${backendKey || id}To`],
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
): ExtendedFilterField => {
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

  const backendKey = options?.backendKey || id;
  const minSuffix = options?.minSuffix || "Min";
  const maxSuffix = options?.maxSuffix || "Max";

  return {
    id,
    label,
    type: FieldType.SLIDER,
    min,
    max,
    step,
    backendKey,
    transform: options?.transform || defaultTransform,
    parseForDisplay: createRangeFilterParser(
      backendKey,
      label,
      minSuffix,
      maxSuffix
    ),
    getRemovalKeys: () => [
      `${backendKey}${minSuffix}`,
      `${backendKey}${maxSuffix}`,
    ],
  };
};

export const createNumberFilter = (
  id: string,
  label: string,
  backendKey?: string
): ExtendedFilterField => ({
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
      backendKey: "latency",
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
      backendKey: "cost",
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
