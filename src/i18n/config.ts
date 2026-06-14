// i18n configuration. Locales = market adaptations (currency + rules), not just translations
// (PRD §4.4). Default (en/US) stays unprefixed at `/`; others live under `/<prefix>/`.

import type { LocaleCode } from "../engine/types";

export type Locale = "en" | "zh" | "en-gb" | "en-ca";

export const LOCALES: Locale[] = ["en", "zh", "en-gb", "en-ca"];
export const DEFAULT_LOCALE: Locale = "en";

/** Non-default locales — used to build `/<prefix>/` route mirrors. */
export const PREFIXED_LOCALES: Locale[] = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export interface LocaleMeta {
	code: Locale;
	htmlLang: string; // <html lang> + hreflang
	formatLocale: LocaleCode; // maps to engine format.ts
	label: string; // native name for the language picker
	/** URL prefix segment ("" for the default locale). */
	prefix: string;
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
	en: { code: "en", htmlLang: "en-US", formatLocale: "en-US", label: "English (US)", prefix: "" },
	zh: { code: "zh", htmlLang: "zh-CN", formatLocale: "zh-CN", label: "中文", prefix: "zh" },
	"en-gb": { code: "en-gb", htmlLang: "en-GB", formatLocale: "en-GB", label: "English (UK)", prefix: "en-gb" },
	"en-ca": { code: "en-ca", htmlLang: "en-CA", formatLocale: "en-CA", label: "English (CA)", prefix: "en-ca" },
};

export function isLocale(x: string): x is Locale {
	return (LOCALES as string[]).includes(x);
}

export function formatLocaleOf(locale: Locale): LocaleCode {
	return LOCALE_META[locale].formatLocale;
}

/** Prefix a bare path (e.g. "/mortgage-calculator") for a locale. */
export function localizePath(path: string, locale: Locale): string {
	const prefix = LOCALE_META[locale].prefix;
	const clean = path.startsWith("/") ? path : `/${path}`;
	if (!prefix) return clean;
	return clean === "/" ? `/${prefix}/` : `/${prefix}${clean}`;
}
