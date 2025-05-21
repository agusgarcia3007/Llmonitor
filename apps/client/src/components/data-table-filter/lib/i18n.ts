import en from "@/locale/en.json";
import es from "@/locale/es.json";

export type Locale = "en" | "es";

type Translations = Record<string, string>;

const translations: Record<Locale, Translations> = {
  en: en.dataTableFilter,
  es: es.dataTableFilter,
};

export function t(key: string, locale: Locale): string {
  return translations[locale][key] ?? key;
}
