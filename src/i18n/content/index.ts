// Sidecar calculator-content localization. English configs in src/calculators stay the source of
// truth; these dictionaries override copy per locale, with English fallback. This keeps i18n OUT of
// the calculator config files so they can evolve independently.

import type { CalculatorDef, ComputeResult, FAQItem } from "../../engine/types";
import { formatOutput } from "../../engine/format";
import type { Locale } from "../config";
import { formatLocaleOf } from "../config";
import { ZH } from "./zh";
import { EN_GB } from "./en-gb";
import { EN_CA } from "./en-ca";

export interface CalcContentL10n {
	title?: string;
	description?: string;
	/** field id → localized label */
	inputs?: Record<string, string>;
	/** output id → localized label */
	outputs?: Record<string, string>;
	intro?: string;
	faq?: FAQItem[];
	disclaimer?: string;
	/** Template with {outputId} placeholders, filled with locale-formatted values. */
	explainTemplate?: string;
}

export type LocaleContent = Record<string, CalcContentL10n>; // calcId → overrides

// English uses the calculator configs directly → empty override map.
export const CONTENT: Record<Locale, LocaleContent> = {
	en: {},
	zh: ZH,
	"en-gb": EN_GB,
	"en-ca": EN_CA,
};

export function calcContent(calcId: string, locale: Locale): CalcContentL10n {
	return CONTENT[locale]?.[calcId] ?? {};
}

/** Replace {outputId} tokens with locale-formatted output values. */
export function fillTemplate(
	tpl: string,
	result: ComputeResult,
	def: CalculatorDef,
	locale: Locale,
): string {
	const fl = formatLocaleOf(locale);
	return tpl.replace(/\{(\w+)\}/g, (_, key: string) => {
		const field = def.outputs.find((o) => o.id === key);
		if (field && key in result.outputs) {
			return formatOutput(result.outputs[key], field.format, fl);
		}
		if (key in result.outputs) return String(result.outputs[key]);
		return `{${key}}`;
	});
}

/** Localized explanation: template if provided, else the English config's explain(). */
export function localizedExplain(
	def: CalculatorDef,
	result: ComputeResult,
	inputs: Record<string, number | string | boolean>,
	locale: Locale,
): string {
	const tpl = calcContent(def.id, locale).explainTemplate;
	if (tpl) return fillTemplate(tpl, result, def, locale);
	return def.content.explain(result, inputs);
}
