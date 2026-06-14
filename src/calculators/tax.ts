// Income tax calculator — progressive brackets (PRD §5.3, §6). 2024 U.S. federal, simplified.
// Localized later via the locale rule layer; brackets live in data, not code paths.

import type { CalculatorDef, ComputeResult, InputValues } from "../engine/types";
import { taxOwed } from "../engine/finance";
import { formatCurrency, formatPercent } from "../engine/format";
import { regionTax } from "../i18n/tax";
import type { Locale } from "../i18n/config";

const LOCALES = [{ code: "en-US" as const, currency: "USD", label: "United States" }];

function num(v: InputValues[string], fallback = 0): number {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : fallback;
}

function compute(v: InputValues): ComputeResult {
	const incomeCents = Math.round(num(v.income) * 100);
	const status = String(v.filingStatus ?? "single");
	// `_locale` is injected by the calculator island (not a user-facing input).
	const locale = (v._locale as Locale) ?? "en";
	const region = regionTax(locale);
	const brackets = region.brackets[status] ?? region.brackets.default ?? region.brackets.single;
	const res = taxOwed(incomeCents, brackets);

	return {
		outputs: {
			totalTax: res.totalTaxCents,
			afterTax: incomeCents - res.totalTaxCents,
			marginalRate: res.marginalRatePct,
			effectiveRate: Number(res.effectiveRatePct.toFixed(2)),
		},
		detail: {
			perBracket: res.perBracket
				.filter((b) => b.taxableInBracketCents > 0)
				.map((b) => ({ rate: b.ratePct, taxCents: b.taxCents })),
			marginalRate: res.marginalRatePct,
			effectiveRate: res.effectiveRatePct,
		},
	};
}

export const tax: CalculatorDef = {
	id: "tax",
	slug: "tax-calculator",
	title: "Income Tax Calculator",
	category: "tax",
	description:
		"Estimate your federal income tax by bracket and see why your effective rate is lower than your top marginal rate.",
	locales: LOCALES,
	inputs: [
		{ id: "income", label: "Taxable income", type: "currency", default: 85000, min: 0, step: 1000, unit: "$" },
		{
			id: "filingStatus",
			label: "Filing status",
			type: "select",
			default: "single",
			options: [
				{ label: "Single", value: "single" },
				{ label: "Married filing jointly", value: "married" },
			],
		},
	],
	compute,
	outputs: [
		{ id: "totalTax", label: "Federal tax", format: "currency", emphasize: true },
		{ id: "afterTax", label: "After-tax income", format: "currency" },
		{ id: "marginalRate", label: "Marginal rate", format: "percent" },
		{ id: "effectiveRate", label: "Effective rate", format: "percent" },
	],
	visualizations: [
		{
			id: "brackets",
			type: "tax_bracket_bar",
			title: "Tax by bracket",
			description: "How much tax each bracket contributes — only your top dollars pay the top rate.",
			interactive: true,
			dataMapping: (result) => {
				const pb = result.detail.perBracket as { rate: number; taxCents: number }[];
				return {
					segments: pb.map((b) => ({ label: `${b.rate}%`, value: b.taxCents / 100 })),
				};
			},
		},
		{
			id: "rate-compare",
			type: "tax_bracket_bar",
			title: "Marginal vs. effective rate",
			interactive: false,
			dataMapping: (result) => {
				return {
					segments: [
						{ label: "Marginal", value: result.detail.marginalRate as number },
						{ label: "Effective", value: Number((result.detail.effectiveRate as number).toFixed(2)) },
					],
				};
			},
		},
	],
	content: {
		intro:
			"Enter your taxable income to see your tax broken down by bracket — and why your effective rate is well below your marginal rate. Computed in your browser.",
		explain: (result, inputs) => {
			const o = result.outputs;
			return (
				`On ${formatCurrency(num(inputs.income) * 100)} of taxable income, your estimated federal tax is ` +
				`${formatCurrency(o.totalTax as number)}. Your top (marginal) rate is ${formatPercent(o.marginalRate as number)}, ` +
				`but because only your highest dollars are taxed at that rate, your effective rate is just ${formatPercent(o.effectiveRate as number)}.`
			);
		},
		faq: [
			{
				q: "Why is my effective rate lower than my bracket?",
				a: "Brackets are marginal: only the income within each band is taxed at that band's rate. Your effective rate is total tax divided by total income, which is always lower than your top bracket.",
			},
			{
				q: "Does this include state tax or deductions?",
				a: "No. This is a simplified federal estimate on taxable income. It doesn't model state tax, credits, or deductions, and is not tax advice.",
			},
		],
		disclaimer:
			"For general information only — not tax advice. Uses simplified 2024 federal brackets and excludes state taxes, credits, and deductions.",
	},
	related: ["retirement-calculator", "mortgage-calculator"],
	schemaOrg: { applicationCategory: "FinanceApplication" },
};
