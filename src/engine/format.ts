// Display-layer formatting. Operates on cents/percents; never used inside compute math.

import type { LocaleCode, OutputFormat } from "./types";

const CURRENCY_BY_LOCALE: Record<LocaleCode, string> = {
	"en-US": "USD",
	"en-GB": "GBP",
	"zh-CN": "CNY",
};

export function formatCurrency(
	cents: number,
	locale: LocaleCode = "en-US",
	currency = CURRENCY_BY_LOCALE[locale],
	maxFractionDigits = 0,
): string {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		maximumFractionDigits: maxFractionDigits,
	}).format(cents / 100);
}

export function formatPercent(pct: number, digits = 2, locale: LocaleCode = "en-US"): string {
	return new Intl.NumberFormat(locale, {
		style: "percent",
		minimumFractionDigits: 0,
		maximumFractionDigits: digits,
	}).format(pct / 100);
}

export function formatNumber(n: number, digits = 0, locale: LocaleCode = "en-US"): string {
	return new Intl.NumberFormat(locale, {
		maximumFractionDigits: digits,
	}).format(n);
}

/** Months → "X yr Y mo" (or just one part when the other is zero). */
export function formatMonths(months: number): string {
	const m = Math.max(0, Math.round(months));
	const yr = Math.floor(m / 12);
	const mo = m % 12;
	if (yr === 0) return `${mo} mo`;
	if (mo === 0) return `${yr} yr`;
	return `${yr} yr ${mo} mo`;
}

/** Format a single OutputField value by its declared format. */
export function formatOutput(
	value: number | string,
	format: OutputFormat,
	locale: LocaleCode = "en-US",
): string {
	if (typeof value === "string") return value;
	switch (format) {
		case "currency":
			return formatCurrency(value, locale);
		case "percent":
			return formatPercent(value, 2, locale);
		case "months":
			return formatMonths(value);
		case "number":
			return formatNumber(value, 0, locale);
		case "date":
		case "text":
		default:
			return String(value);
	}
}
