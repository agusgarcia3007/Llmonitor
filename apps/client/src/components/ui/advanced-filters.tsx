import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultipleSelector, { type Option } from "@/components/ui/multiselect";
import { Slider } from "@/components/ui/slider";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface AdvancedFilterField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  backendKey?: string;
  transform?: (value: unknown) => Record<string, unknown>;
}

export enum FieldType {
  TEXT = "text",
  NUMBER = "number",
  SELECT = "select",
  DATE_RANGE = "date-range",
  SLIDER = "slider",
}

interface AdvancedFiltersProps {
  appliedFilters: Record<string, unknown>;
  onChange: (filters: Record<string, unknown>) => void;
  fields: AdvancedFilterField[];
  filtersButton?: React.ReactNode;
}

const createFormSchema = (fields: AdvancedFilterField[]) => {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    switch (field.type) {
      case FieldType.TEXT:
        schemaObject[field.id] = z.string().optional();
        break;
      case FieldType.NUMBER:
        schemaObject[field.id] = z.number().optional();
        break;
      case FieldType.SELECT:
        schemaObject[field.id] = z
          .array(
            z.object({
              value: z.string(),
              label: z.string(),
            })
          )
          .optional();
        break;
      case FieldType.DATE_RANGE:
        schemaObject[field.id] = z
          .object({
            from: z.date().optional(),
            to: z.date().optional(),
          })
          .optional();
        break;
      case FieldType.SLIDER:
        schemaObject[field.id] = z.array(z.number()).optional();
        break;
    }
  });

  return z.object(schemaObject);
};

const getDefaultValues = (
  fields: AdvancedFilterField[],
  filters: Record<string, unknown>
) => {
  const defaults: Record<string, unknown> = {};

  fields.forEach((field) => {
    switch (field.type) {
      case FieldType.TEXT: {
        defaults[field.id] = (filters[field.id] as string) || "";
        break;
      }
      case FieldType.NUMBER: {
        defaults[field.id] = filters[field.id] || undefined;
        break;
      }
      case FieldType.SELECT: {
        const selectValues = filters[field.id] as string[];
        defaults[field.id] =
          selectValues?.map((value) => ({ value, label: value })) || [];
        break;
      }
      case FieldType.DATE_RANGE: {
        defaults[field.id] = filters[field.id] || {
          from: undefined,
          to: undefined,
        };
        break;
      }
      case FieldType.SLIDER: {
        defaults[field.id] = (filters[field.id] as number[]) || [
          field.min ?? 0,
          field.max ?? 100,
        ];
        break;
      }
    }
  });

  return defaults;
};

const cleanFieldValue = (
  field: AdvancedFilterField,
  value: unknown
): unknown => {
  switch (field.type) {
    case FieldType.TEXT: {
      return value && String(value).trim() !== "" ? value : undefined;
    }

    case FieldType.NUMBER: {
      return value !== undefined && value !== null ? value : undefined;
    }

    case FieldType.SELECT: {
      const selectValue = value as Option[];
      return selectValue?.length > 0
        ? selectValue.map((opt) => opt.value)
        : undefined;
    }

    case FieldType.DATE_RANGE: {
      const dateRange = value as DateRange;
      return dateRange?.from || dateRange?.to ? dateRange : undefined;
    }

    case FieldType.SLIDER: {
      const sliderValue = value as number[];
      return sliderValue &&
        (sliderValue[0] !== field.min || sliderValue[1] !== field.max)
        ? sliderValue
        : undefined;
    }

    default:
      return undefined;
  }
};

const transformFiltersForBackend = (
  filters: Record<string, unknown>,
  fields: AdvancedFilterField[]
): Record<string, unknown> => {
  const backendFilters: Record<string, unknown> = {};

  Object.entries(filters).forEach(([key, value]) => {
    const field = fields.find((f) => f.id === key);
    if (!field || value === undefined || value === null) return;

    if (field.transform) {
      const transformedFilters = field.transform(value);
      Object.assign(backendFilters, transformedFilters);
      return;
    }

    const backendKey = field.backendKey || key;

    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.NUMBER:
        if (value && String(value).trim() !== "") {
          backendFilters[backendKey] = value;
        }
        break;

      case FieldType.SELECT: {
        const selectValue = value as string[];
        if (selectValue && selectValue.length > 0) {
          backendFilters[backendKey] = selectValue;
        }
        break;
      }

      case FieldType.DATE_RANGE: {
        const dateRange = value as DateRange;
        if (dateRange?.from) {
          backendFilters[`${backendKey}From`] = dateRange.from.toISOString();
        }
        if (dateRange?.to) {
          backendFilters[`${backendKey}To`] = dateRange.to.toISOString();
        }
        break;
      }

      case FieldType.SLIDER: {
        const sliderValue = value as number[];
        if (sliderValue && sliderValue.length === 2) {
          if (sliderValue[0] !== field.min) {
            backendFilters[`${backendKey}Min`] = sliderValue[0];
          }
          if (sliderValue[1] !== field.max) {
            backendFilters[`${backendKey}Max`] = sliderValue[1];
          }
        }
        break;
      }
    }
  });

  return backendFilters;
};

export function AdvancedFilters({
  appliedFilters,
  onChange,
  fields,
  filtersButton,
}: AdvancedFiltersProps) {
  const { t } = useTranslation();
  const schema = React.useMemo(() => createFormSchema(fields), [fields]);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(
    undefined
  );

  const [pendingFilters, setPendingFilters] = React.useState<
    Record<string, unknown>
  >({});

  const [datePopoverStates, setDatePopoverStates] = React.useState<
    Record<string, boolean>
  >({});

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(fields, appliedFilters),
  });

  React.useEffect(() => {
    const newDefaults = getDefaultValues(fields, appliedFilters);
    form.reset(newDefaults);
    setPendingFilters({});
  }, [appliedFilters, fields, form]);

  const handleInternalChange = React.useCallback(
    (values: Record<string, unknown>) => {
      const cleanedValues: Record<string, unknown> = {};

      Object.entries(values).forEach(([key, value]) => {
        const field = fields.find((f) => f.id === key);
        if (!field) return;

        const cleanedValue = cleanFieldValue(field, value);
        if (cleanedValue !== undefined) {
          cleanedValues[key] = cleanedValue;
        }
      });

      setPendingFilters(cleanedValues);
    },
    [fields]
  );

  const handleDebouncedChange = React.useCallback(
    (fieldId: string, value: unknown) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        handleInternalChange({ ...form.getValues(), [fieldId]: value });
      }, 300);
    },
    [form, handleInternalChange]
  );

  const setDatePopoverOpen = React.useCallback(
    (fieldId: string, isOpen: boolean) => {
      setDatePopoverStates((prev) => ({ ...prev, [fieldId]: isOpen }));
    },
    []
  );

  const handleApply = React.useCallback(() => {
    const backendFilters = transformFiltersForBackend(pendingFilters, fields);
    onChange(backendFilters);
  }, [pendingFilters, fields, onChange]);

  const handleClear = React.useCallback(() => {
    form.reset(getDefaultValues(fields, {}));
    setPendingFilters({});
    onChange({});
  }, [form, fields, onChange]);

  const renderField = (field: AdvancedFilterField) => {
    switch (field.type) {
      case FieldType.TEXT: {
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-medium">
                  {field.label}
                </FormLabel>
                <FormControl>
                  <Input
                    className="h-8 text-sm"
                    placeholder={t(
                      "dataTableFilter.advancedFilters.placeholder.text",
                      {
                        field: field.label.toLowerCase(),
                      }
                    )}
                    {...formField}
                    onChange={(e) => {
                      formField.onChange(e);
                      handleDebouncedChange(field.id, e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }

      case FieldType.NUMBER: {
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-medium">
                  {field.label}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="h-8 text-sm"
                    placeholder={t(
                      "dataTableFilter.advancedFilters.placeholder.number",
                      {
                        field: field.label.toLowerCase(),
                      }
                    )}
                    {...formField}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      formField.onChange(value);
                      handleDebouncedChange(field.id, value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }

      case FieldType.SELECT: {
        const selectOptions: Option[] =
          field.options?.map((option) => ({
            value: option,
            label: option,
          })) || [];

        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-medium">
                  {field.label}
                </FormLabel>
                <FormControl>
                  <MultipleSelector
                    value={formField.value || []}
                    onChange={(selected) => {
                      formField.onChange(selected);
                      handleInternalChange({
                        ...form.getValues(),
                        [field.id]: selected,
                      });
                    }}
                    defaultOptions={selectOptions}
                    placeholder={t(
                      "dataTableFilter.advancedFilters.placeholder.select",
                      {
                        field: field.label.toLowerCase(),
                      }
                    )}
                    emptyIndicator={
                      <p className="text-center text-gray-600 dark:text-gray-400 text-xs">
                        {t("dataTableFilter.advancedFilters.empty.select")}
                      </p>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }

      case FieldType.DATE_RANGE: {
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-medium">
                  {field.label}
                </FormLabel>
                <Popover
                  open={datePopoverStates[field.id] || false}
                  onOpenChange={(isOpen) =>
                    setDatePopoverOpen(field.id, isOpen)
                  }
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal h-8 text-sm"
                      >
                        <CalendarIcon className="w-3 h-3 mr-2" />
                        {formField.value?.from ? (
                          formField.value.to ? (
                            <>
                              {formField.value.from.toLocaleDateString()} -{" "}
                              {formField.value.to.toLocaleDateString()}
                            </>
                          ) : (
                            formField.value.from.toLocaleDateString()
                          )
                        ) : (
                          <span>
                            {t(
                              "dataTableFilter.advancedFilters.placeholder.dateRange"
                            )}
                          </span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={formField.value?.from}
                      selected={formField.value}
                      onSelect={(date) => {
                        formField.onChange(date);
                        handleInternalChange({
                          ...form.getValues(),
                          [field.id]: date,
                        });
                        if (date?.from && date?.to) {
                          setDatePopoverOpen(field.id, false);
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }

      case FieldType.SLIDER: {
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-medium">
                  {field.label}: {formField.value?.[0]} - {formField.value?.[1]}
                </FormLabel>
                <FormControl>
                  <Slider
                    min={field.min ?? 0}
                    max={field.max ?? 100}
                    step={field.step ?? 1}
                    value={
                      formField.value || [field.min ?? 0, field.max ?? 100]
                    }
                    onValueChange={(value) => {
                      formField.onChange(value);
                      handleDebouncedChange(field.id, value);
                    }}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      }

      default:
        return null;
    }
  };

  if (!filtersButton) {
    return (
      <Form {...form}>
        <form className="space-y-3">
          <div className="space-y-3">
            {fields.map((field) => renderField(field))}
          </div>
          <div className="flex gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="flex-1"
            >
              {t("dataTableFilter.clear")}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleApply}
              className="flex-1"
            >
              {t("dataTableFilter.advancedFilters.apply")}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{filtersButton}</DropdownMenuTrigger>
      <DropdownMenuContent
        className="p-0 w-[280px] max-h-[500px]"
        onCloseAutoFocus={(e) => e.preventDefault()}
        align="start"
      >
        <Form {...form}>
          <form className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto max-h-[400px] p-3 space-y-3">
              {fields.map((field) => renderField(field))}
            </div>
            <div className="flex gap-2 p-3 border-t bg-background">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="flex-1"
              >
                {t("dataTableFilter.clear")}
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleApply}
                className="flex-1"
              >
                {t("dataTableFilter.advancedFilters.apply")}
              </Button>
            </div>
          </form>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
