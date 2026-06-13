// Mortgage calculator — flagship (PRD §7). Config-driven; compute is a pure function.

import type { CalculatorDef, ComputeResult, InputValues } from "../engine/types";
import { amortize, monthlyPaymentCents, type AmortRow } from "../engine/finance";
import { formatCurrency, formatMonths } from "../engine/format";

const LOCALES = [{ code: "en-US" as const, currency: "USD", label: "United States" }];

function num(v: InputValues[string], fallback = 0): number {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : fallback;
}

/** Aggregate a monthly amortization schedule into yearly principal/interest totals. */
function aggregateByYear(schedule: AmortRow[]) {
	const years: { year: number; principalCents: number; interestCents: number }[] = [];
	for (const row of schedule) {
		const y = Math.ceil(row.month / 12);
		let bucket = years[y - 1];
		if (!bucket) {
			bucket = { year: y, principalCents: 0, interestCents: 0 };
			years[y - 1] = bucket;
		}
		bucket.principalCents += row.principalCents;
		bucket.interestCents += row.interestCents;
	}
	return years.filter(Boolean);
}

function compute(v: InputValues): ComputeResult {
	const homePrice = Math.round(num(v.homePrice) * 100);
	const downPayment = Math.min(Math.round(num(v.downPayment) * 100), homePrice);
	const loanCents = Math.max(0, homePrice - downPayment);
	const rate = num(v.annualRate);
	const termMonths = Math.round(num(v.termYears, 30) * 12);
	const extraMonthly = Math.round(num(v.extraMonthly) * 100);
	const extraOnce = Math.round(num(v.extraOnce) * 100);

	const taxMonthly = Math.round((num(v.propertyTaxYearly) * 100) / 12);
	const insMonthly = Math.round((num(v.insuranceYearly) * 100) / 12);
	const hoaMonthly = Math.round(num(v.hoaMonthly) * 100);

	const principalInterest = monthlyPaymentCents(loanCents, rate, termMonths);
	const withExtra = amortize(loanCents, rate, termMonths, extraMonthly, extraOnce);
	const baseline = amortize(loanCents, rate, termMonths, 0, 0);

	const totalMonthly = principalInterest + taxMonthly + insMonthly + hoaMonthly;
	const interestSaved = baseline.totalInterestCents - withExtra.totalInterestCents;
	const monthsSaved = baseline.payoffMonths - withExtra.payoffMonths;

	return {
		outputs: {
			monthlyPayment: totalMonthly,
			principalInterest,
			monthlyTax: taxMonthly,
			monthlyInsurance: insMonthly,
			monthlyHoa: hoaMonthly,
			loanAmount: loanCents,
			totalInterest: withExtra.totalInterestCents,
			totalCost: loanCents + withExtra.totalInterestCents,
			payoffTime: withExtra.payoffMonths,
			interestSaved: Math.max(0, interestSaved),
			monthsSaved: Math.max(0, monthsSaved),
		},
		detail: {
			loanCents,
			schedule: withExtra.schedule,
			scheduleBaseline: baseline.schedule,
			yearly: aggregateByYear(withExtra.schedule),
			breakdown: [
				{ label: "Principal & Interest", value: principalInterest },
				{ label: "Property Tax", value: taxMonthly },
				{ label: "Insurance", value: insMonthly },
				{ label: "HOA", value: hoaMonthly },
			].filter((s) => s.value > 0),
			rate,
			loanForSensitivity: loanCents,
			termMonths,
		},
	};
}

export const mortgage: CalculatorDef = {
	id: "mortgage",
	slug: "mortgage-calculator",
	title: "Mortgage Calculator",
	category: "mortgage",
	description:
		"Estimate your monthly mortgage payment, see how principal and interest shift over time, and find out how much extra payments save you — all computed in your browser.",
	locales: LOCALES,
	inputs: [
		{
			id: "homePrice",
			label: "Home price",
			type: "currency",
			default: 400000,
			min: 0,
			step: 1000,
			unit: "$",
		},
		{
			id: "downPayment",
			label: "Down payment",
			type: "currency",
			default: 80000,
			min: 0,
			step: 1000,
			unit: "$",
			help: "Amount paid upfront. The loan covers the rest.",
		},
		{
			id: "annualRate",
			label: "Interest rate",
			type: "percent",
			default: 6.5,
			min: 0,
			max: 25,
			step: 0.05,
			unit: "%",
		},
		{
			id: "termYears",
			label: "Loan term",
			type: "select",
			default: 30,
			options: [
				{ label: "30 years", value: 30 },
				{ label: "20 years", value: 20 },
				{ label: "15 years", value: 15 },
				{ label: "10 years", value: 10 },
			],
			presets: [
				{
					id: "15-year",
					label: "15-Year Mortgage",
					values: { termYears: 15 },
					blurb:
						"A 15-year mortgage pairs a higher monthly payment with dramatically lower lifetime interest — see exactly how the trade-off plays out at your loan amount and rate.",
				},
				{
					id: "30-year",
					label: "30-Year Mortgage",
					values: { termYears: 30 },
					blurb:
						"The 30-year mortgage is the U.S. default: the lowest monthly payment, but the most interest paid over the life of the loan. Watch the amortization curve to see why.",
				},
			],
		},
		{
			id: "propertyTaxYearly",
			label: "Property tax (yearly)",
			type: "currency",
			default: 4800,
			min: 0,
			step: 100,
			unit: "$",
		},
		{
			id: "insuranceYearly",
			label: "Home insurance (yearly)",
			type: "currency",
			default: 1800,
			min: 0,
			step: 100,
			unit: "$",
		},
		{
			id: "hoaMonthly",
			label: "HOA (monthly)",
			type: "currency",
			default: 0,
			min: 0,
			step: 10,
			unit: "$",
		},
		{
			id: "extraMonthly",
			label: "Extra monthly payment",
			type: "currency",
			default: 0,
			min: 0,
			step: 50,
			unit: "$",
			help: "Extra principal paid every month shortens your loan.",
		},
		{
			id: "extraOnce",
			label: "One-time extra payment",
			type: "currency",
			default: 0,
			min: 0,
			step: 500,
			unit: "$",
		},
	],
	compute,
	outputs: [
		{ id: "monthlyPayment", label: "Monthly payment", format: "currency", emphasize: true },
		{ id: "principalInterest", label: "Principal & interest", format: "currency" },
		{ id: "monthlyTax", label: "Property tax", format: "currency" },
		{ id: "monthlyInsurance", label: "Insurance", format: "currency" },
		{ id: "loanAmount", label: "Loan amount", format: "currency" },
		{ id: "totalInterest", label: "Total interest", format: "currency" },
		{ id: "totalCost", label: "Total of payments", format: "currency" },
		{ id: "payoffTime", label: "Payoff time", format: "months" },
		{ id: "interestSaved", label: "Interest saved (extra)", format: "currency" },
		{ id: "monthsSaved", label: "Time saved (extra)", format: "months" },
	],
	visualizations: [
		{
			id: "amortization",
			type: "amortization",
			title: "Principal vs. interest over time",
			description: "Each year's payment split — watch interest shrink as the balance falls.",
			interactive: true,
			dataMapping: (result) => {
				const yearly = result.detail.yearly as {
					year: number;
					principalCents: number;
					interestCents: number;
				}[];
				return {
					x: yearly.map((y) => y.year),
					xLabel: "Year",
					yLabel: "Paid",
					series: [
						{ label: "Principal", values: yearly.map((y) => y.principalCents / 100) },
						{ label: "Interest", values: yearly.map((y) => y.interestCents / 100) },
					],
				};
			},
		},
		{
			id: "breakdown",
			type: "breakdown_donut",
			title: "Monthly payment breakdown",
			interactive: true,
			dataMapping: (result) => {
				const breakdown = result.detail.breakdown as { label: string; value: number }[];
				return { segments: breakdown.map((b) => ({ label: b.label, value: b.value / 100 })) };
			},
		},
		{
			id: "scenario",
			type: "scenario_compare",
			title: "Balance: with vs. without extra payments",
			interactive: true,
			dataMapping: (result) => {
				const sched = result.detail.schedule as AmortRow[];
				const base = result.detail.scheduleBaseline as AmortRow[];
				const maxLen = Math.max(sched.length, base.length);
				const x = Array.from({ length: maxLen }, (_, i) => (i + 1) / 12);
				const fill = (rows: AmortRow[]) =>
					Array.from({ length: maxLen }, (_, i) =>
						i < rows.length ? rows[i].balanceCents / 100 : 0,
					);
				return {
					x,
					xLabel: "Year",
					yLabel: "Balance",
					series: [
						{ label: "Without extra", values: fill(base) },
						{ label: "With extra", values: fill(sched) },
					],
				};
			},
		},
		{
			id: "sensitivity",
			type: "sensitivity_line",
			title: "Payment sensitivity to interest rate",
			description: "How your principal & interest changes as rates move.",
			interactive: true,
			dataMapping: (result, inputs) => {
				const loan = result.detail.loanForSensitivity as number;
				const termMonths = result.detail.termMonths as number;
				const baseRate = num(inputs.annualRate);
				const rates: number[] = [];
				const payments: number[] = [];
				for (let r = Math.max(0, baseRate - 3); r <= baseRate + 3 + 1e-9; r += 0.25) {
					rates.push(Number(r.toFixed(2)));
					payments.push(monthlyPaymentCents(loan, r, termMonths) / 100);
				}
				return {
					x: rates,
					xLabel: "Rate %",
					yLabel: "Monthly P&I",
					series: [{ label: "Monthly P&I", values: payments }],
				};
			},
		},
	],
	content: {
		intro:
			"Enter your numbers and the payment, amortization, and payoff date update instantly. Nothing is sent to a server — every figure is computed locally in your browser.",
		explain: (result, inputs) => {
			const o = result.outputs;
			const term = num(inputs.termYears, 30);
			let s =
				`On a ${formatCurrency(o.loanAmount as number)} loan at ${num(inputs.annualRate)}% over ${term} years, ` +
				`your principal & interest is ${formatCurrency(o.principalInterest as number)} per month, ` +
				`and your all-in monthly payment (with taxes, insurance${(o.monthlyHoa as number) > 0 ? ", and HOA" : ""}) is ` +
				`${formatCurrency(o.monthlyPayment as number)}. Over the full term you pay ` +
				`${formatCurrency(o.totalInterest as number)} in interest.`;
			if ((o.interestSaved as number) > 0) {
				s +=
					` By adding the extra payments you entered, you save ${formatCurrency(o.interestSaved as number)} in interest ` +
					`and pay the loan off ${formatMonths(o.monthsSaved as number)} sooner.`;
			}
			return s;
		},
		faq: [
			{
				q: "What's included in the monthly payment?",
				a: "Principal and interest plus monthly property tax, home insurance, and any HOA dues you enter. Lenders call the combined figure PITI.",
			},
			{
				q: "How do extra payments save money?",
				a: "Every extra dollar goes straight to principal, so future interest is charged on a smaller balance. That compounds, cutting both total interest and the number of payments.",
			},
			{
				q: "Why is so much of my early payment interest?",
				a: "Interest is charged on the outstanding balance, which is largest at the start. The amortization chart shows the principal share growing every year.",
			},
			{
				q: "Is my data sent anywhere?",
				a: "No. All calculations run in your browser. Nothing you type leaves your device.",
			},
		],
		disclaimer:
			"For general information only — not financial advice. Actual loan terms, taxes, insurance, and fees vary by lender and location.",
	},
	related: ["loan-calculator", "retirement-calculator"],
	schemaOrg: { applicationCategory: "FinanceApplication" },
};
