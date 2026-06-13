// Retirement / investment calculator. Differentiator: deterministic uncertainty fan (PRD §6).
// We model uncertainty analytically (return ± volatility) so compute stays pure & testable —
// no Math.random, fully reproducible golden tests.

import type { CalculatorDef, ComputeResult, InputValues } from "../engine/types";
import { futureValue, type FVRow } from "../engine/finance";
import { formatCurrency } from "../engine/format";

const LOCALES = [{ code: "en-US" as const, currency: "USD", label: "United States" }];

function num(v: InputValues[string], fallback = 0): number {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : fallback;
}

function yearlySnapshots(schedule: FVRow[]): FVRow[] {
	return schedule.filter((r) => r.month % 12 === 0);
}

function compute(v: InputValues): ComputeResult {
	const startCents = Math.round(num(v.currentSavings) * 100);
	const monthlyCents = Math.round(num(v.monthlyContribution) * 100);
	const ret = num(v.annualReturn, 7);
	const years = Math.round(num(v.years, 30));
	const vol = num(v.volatility, 4); // ± percentage points for the uncertainty band

	const mid = futureValue(startCents, ret, years, monthlyCents);
	const high = futureValue(startCents, ret + vol, years, monthlyCents);
	const low = futureValue(startCents, Math.max(0, ret - vol), years, monthlyCents);

	return {
		outputs: {
			futureValue: mid.fvCents,
			totalContributed: mid.totalContributedCents,
			totalGrowth: mid.totalGrowthCents,
			optimistic: high.fvCents,
			pessimistic: low.fvCents,
		},
		detail: {
			midYearly: yearlySnapshots(mid.schedule),
			highYearly: yearlySnapshots(high.schedule),
			lowYearly: yearlySnapshots(low.schedule),
		},
	};
}

export const retirement: CalculatorDef = {
	id: "retirement",
	slug: "retirement-calculator",
	title: "Retirement Calculator",
	category: "retirement",
	description:
		"Project how your savings could grow with compound returns and regular contributions — including an uncertainty range, not just a single optimistic line.",
	locales: LOCALES,
	inputs: [
		{ id: "currentSavings", label: "Current savings", type: "currency", default: 25000, min: 0, step: 1000, unit: "$" },
		{ id: "monthlyContribution", label: "Monthly contribution", type: "currency", default: 500, min: 0, step: 50, unit: "$" },
		{ id: "annualReturn", label: "Expected annual return", type: "percent", default: 7, min: 0, max: 20, step: 0.5, unit: "%" },
		{ id: "volatility", label: "Uncertainty (±)", type: "percent", default: 4, min: 0, max: 10, step: 0.5, unit: "%", help: "Width of the optimistic/pessimistic band around your expected return." },
		{
			id: "years",
			label: "Years to grow",
			type: "slider",
			default: 30,
			min: 1,
			max: 50,
			step: 1,
			unit: "yr",
			presets: [
				{
					id: "30-years",
					label: "30-Year Projection",
					values: { years: 30 },
					blurb:
						"Over 30 years, compound growth typically does more of the work than your contributions. The stacked area chart makes the crossover point visible.",
				},
			],
		},
	],
	compute,
	outputs: [
		{ id: "futureValue", label: "Projected value", format: "currency", emphasize: true },
		{ id: "totalContributed", label: "Total contributed", format: "currency" },
		{ id: "totalGrowth", label: "Investment growth", format: "currency" },
		{ id: "optimistic", label: "Optimistic", format: "currency" },
		{ id: "pessimistic", label: "Conservative", format: "currency" },
	],
	visualizations: [
		{
			id: "growth",
			type: "growth_area",
			title: "Contributions vs. growth",
			description: "How much of your balance is money you put in vs. compound growth.",
			interactive: true,
			dataMapping: (result) => {
				const mid = result.detail.midYearly as FVRow[];
				return {
					x: mid.map((r) => r.month / 12),
					xLabel: "Year",
					yLabel: "Value",
					series: [
						{ label: "Contributed", values: mid.map((r) => r.contributedCents / 100) },
						{ label: "Growth", values: mid.map((r) => Math.max(0, r.growthCents) / 100) },
					],
				};
			},
		},
		{
			id: "fan",
			type: "monte_carlo_fan",
			title: "Range of outcomes",
			description: "Conservative, expected, and optimistic projections at your uncertainty band.",
			interactive: true,
			dataMapping: (result) => {
				const mid = result.detail.midYearly as FVRow[];
				const high = result.detail.highYearly as FVRow[];
				const low = result.detail.lowYearly as FVRow[];
				return {
					x: mid.map((r) => r.month / 12),
					xLabel: "Year",
					yLabel: "Value",
					series: [
						{ label: "Optimistic", values: high.map((r) => r.balanceCents / 100) },
						{ label: "Expected", values: mid.map((r) => r.balanceCents / 100) },
						{ label: "Conservative", values: low.map((r) => r.balanceCents / 100) },
					],
				};
			},
		},
	],
	content: {
		intro:
			"See not just a single projection but a range — because real returns vary. All figures are computed locally in your browser.",
		explain: (result, inputs) => {
			const o = result.outputs;
			return (
				`Starting with ${formatCurrency(o.totalContributed === o.futureValue ? 0 : num(inputs.currentSavings) * 100)} ` +
				`and adding ${formatCurrency(num(inputs.monthlyContribution) * 100)} a month for ${num(inputs.years, 30)} years at ${num(inputs.annualReturn, 7)}%, ` +
				`your projected balance is ${formatCurrency(o.futureValue as number)} — of which ${formatCurrency(o.totalGrowth as number)} is compound growth. ` +
				`Depending on returns, the range runs from about ${formatCurrency(o.pessimistic as number)} to ${formatCurrency(o.optimistic as number)}.`
			);
		},
		faq: [
			{
				q: "Why show a range instead of one number?",
				a: "Markets don't return the same amount every year. The fan chart shows a conservative-to-optimistic band so you plan around uncertainty rather than a single optimistic line.",
			},
			{
				q: "Is this investment advice?",
				a: "No. This is a general projection tool. It doesn't account for taxes, fees, inflation, or your personal situation, and is not financial advice.",
			},
		],
		disclaimer:
			"For general information only — not investment advice. Projections are illustrative and not a guarantee of future returns.",
	},
	related: ["mortgage-calculator", "loan-calculator", "tax-calculator"],
	schemaOrg: { applicationCategory: "FinanceApplication" },
};
