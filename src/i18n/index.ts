import { pt } from "./pt";
import { en } from "./en";
import { de } from "./de";
import type { Translations } from "./pt";

export type Lang = "pt" | "en" | "de";

export const translations: Record<Lang, Translations> = { pt, en, de };

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split("/");
  if (lang in translations) return lang as Lang;
  return "pt";
}

export function useTranslations(lang: Lang) {
  return translations[lang];
}

export const languages: Record<Lang, { label: string; flag: string }> = {
  pt: { label: "Português", flag: "🇵🇹" },
  en: { label: "English", flag: "🇬🇧" },
  de: { label: "Deutsch", flag: "🇩🇪" },
};

/** Translate a localised field (e.g. { pt: '...', en: '...', de: '...' }) */
export function t(field: Record<Lang, string>, lang: Lang): string {
  return field[lang] ?? field["pt"];
}

/** Translate a localised string array */
export function tArr(field: Record<Lang, string[]>, lang: Lang): string[] {
  return field[lang] ?? field["pt"];
}
