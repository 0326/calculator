// Loan calculator (auto / personal). Term-sensitivity is the differentiator (PRD §6).

import type { CalculatorDef, ComputeResult, InputValues } from "../engine/types";
import { amortize, monthlyPaymentCents } from "../engine/finance";
import { formatCurrency } from "../engine/format";

const LOCALES = [{ code: "en-US" as const, currency: "USD", label: "United States" }];

function num(v: InputValues[string], fallback = 0): number {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : fallback;
}

function compute(v: InputValues): ComputeResult {
	const amountCents = Math.round(num(v.loanAmount) * 100);
	const rate = num(v.annualRate);
	const termMonths = Math.round(num(v.termMonths, 60));
	const extraMonthly = Math.round(num(v.extraMonthly) * 100);

	const payment = monthlyPaymentCents(amountCents, rate, termMonths);
	const amort = amortize(amountCents, rate, termMonths, extraMonthly, 0);

	// Term comparison: 36 / 48 / 60 / 72 months on the same principal & rate.
	const compareTerms = [36, 48, 60, 72];
	const termCompare = compareTerms.map((m) => {
		const a = amortize(amountCents, rate, m, 0, 0);
		return {
			months: m,
			paymentCents: monthlyPaymentCents(amountCents, rate, m),
			totalInterestCents: a.totalInterestCents,
		};
	});

	return {
		outputs: {
			monthlyPayment: payment,
			loanAmount: amountCents,
			totalInterest: amort.totalInterestCents,
			totalCost: amountCents + amort.totalInterestCents,
			payoffTime: amort.payoffMonths,
		},
		detail: {
			amountCents,
			rate,
			termMonths,
			termCompare,
			breakdown: [
				{ label: "Principal", value: amountCents },
				{ label: "Interest", value: amort.totalInterestCents },
			],
		},
	};
}

export const loan: CalculatorDef = {
	id: "loan",
	slug: "loan-calculator",
	title: "Loan Calculator",
	category: "loan",
	description:
		"Calculate the monthly payment and total interest on an auto or personal loan, and compare how different terms change the cost.",
	locales: LOCALES,
	inputs: [
		{ id: "loanAmount", label: "Loan amount", type: "currency", default: 30000, min: 0, step: 500, unit: "$" },
		{ id: "annualRate", label: "Interest rate", type: "percent", default: 7.5, min: 0, max: 36, step: 0.05, unit: "%" },
		{
			id: "termMonths",
			label: "Term (months)",
			type: "select",
			default: 60,
			options: [
				{ label: "36 months", value: 36 },
				{ label: "48 months", value: 48 },
				{ label: "60 months", value: 60 },
				{ label: "72 months", value: 72 },
				{ label: "84 months", value: 84 },
			],
			presets: [
				{
					id: "60-month",
					label: "60-Month Loan",
					values: { termMonths: 60 },
					blurb:
						"A 60-month loan is the most common auto term — a middle ground between monthly affordability and total interest. See where it lands for your amount and rate.",
				},
			],
		},
		{ id: "extraMonthly", label: "Extra monthly payment", type: "currency", default: 0, min: 0, step: 25, unit: "$" },
	],
	compute,
	outputs: [
		{ id: "monthlyPayment", label: "Monthly payment", format: "currency", emphasize: true },
		{ id: "loanAmount", label: "Loan amount", format: "currency" },
		{ id: "totalInterest", label: "Total interest", format: "currency" },
		{ id: "totalCost", label: "Total of payments", format: "currency" },
		{ id: "payoffTime", label: "Payoff time", format: "months" },
	],
	visualizations: [
		{
			id: "breakdown",
			type: "breakdown_donut",
			title: "Principal vs. interest",
			interactive: true,
			dataMapping: (result) => {
				const breakdown = result.detail.breakdown as { label: string; value: number }[];
				return { segments: breakdown.map((b) => ({ label: b.label, value: b.value / 100 })) };
			},
		},
		{
			id: "term-compare",
			type: "scenario_compare",
			title: "Shorter term, less interest",
			description: "Same loan, different terms — monthly payment vs. total interest.",
			interactive: true,
			dataMapping: (result) => {
				const tc = result.detail.termCompare as {
					months: number;
					paymentCents: number;
					totalInterestCents: number;
				}[];
				return {
					x: tc.map((t) => t.months),
					xLabel: "Term (months)",
					yLabel: "Amount",
					series: [
						{ label: "Monthly payment", values: tc.map((t) => t.paymentCents / 100) },
						{ label: "Total interest", values: tc.map((t) => t.totalInterestCents / 100) },
					],
				};
			},
		},
		{
			id: "sensitivity",
			type: "sensitivity_line",
			title: "Payment sensitivity to rate",
			interactive: true,
			dataMapping: (result, inputs) => {
				const amount = result.detail.amountCents as number;
				const termMonths = result.detail.termMonths as number;
				const baseRate = num(inputs.annualRate);
				const rates: number[] = [];
				const payments: number[] = [];
				for (let r = Math.max(0, baseRate - 4); r <= baseRate + 4 + 1e-9; r += 0.5) {
					rates.push(Number(r.toFixed(2)));
					payments.push(monthlyPaymentCents(amount, r, termMonths) / 100);
				}
				return { x: rates, xLabel: "Rate %", yLabel: "Monthly payment", series: [{ label: "Payment", values: payments }] };
			},
		},
	],
	content: {
		intro:
			"Adjust the term and watch the trade-off: a shorter loan costs more per month but far less in total interest. Everything is computed in your browser.",
		explain: (result, inputs) => {
			const o = result.outputs;
			return (
				`Borrowing ${formatCurrency(o.loanAmount as number)} at ${num(inputs.annualRate)}% over ${num(inputs.termMonths, 60)} months ` +
				`costs ${formatCurrency(o.monthlyPayment as number)} per month and ${formatCurrency(o.totalInterest as number)} in total interest, ` +
				`for a total of ${formatCurrency(o.totalCost as number)}.`
			);
		},
		faq: [
			{
				q: "Should I choose a shorter or longer term?",
				a: "A shorter term raises your monthly payment but lowers total interest. The term-comparison chart shows both numbers side by side so you can pick the trade-off you're comfortable with.",
			},
			{
				q: "Does this work for car loans and personal loans?",
				a: "Yes. Any fixed-rate, fully-amortizing installment loan uses the same math.",
			},
		],
		disclaimer:
			"For general information only — not financial advice. Your actual rate and fees depend on your lender and credit profile.",
	},
	related: ["mortgage-calculator", "retirement-calculator"],
	schemaOrg: { applicationCategory: "FinanceApplication" },
};
