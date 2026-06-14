// Declarative comparison pages (PRD §4.2). High commercial intent, easy to chart,
// easy to get cited. Each compares two presets of one calculator side by side.

import type { InputValues } from "../engine/types";

export interface CompareSide {
	label: string;
	values: Partial<InputValues>;
}

export interface CompareSpec {
	pair: string; // URL slug under /compare/
	calcId: string;
	title: string;
	intro: string;
	a: CompareSide;
	b: CompareSide;
	takeaway: string;
}

export const COMPARES: CompareSpec[] = [
	{
		pair: "15-year-vs-30-year-mortgage",
		calcId: "mortgage",
		title: "15-Year vs. 30-Year Mortgage",
		intro:
			"The classic mortgage trade-off: a 15-year loan costs more each month but saves a fortune in interest. Here's the same loan run both ways so you can see the real numbers.",
		a: { label: "15-Year", values: { termYears: 15 } },
		b: { label: "30-Year", values: { termYears: 30 } },
		takeaway:
			"The 15-year payment is higher, but total interest is dramatically lower and you own the home in half the time. Choose the 30-year for cash-flow flexibility, the 15-year to minimize lifetime cost.",
	},
	{
		pair: "36-month-vs-60-month-loan",
		calcId: "loan",
		title: "36-Month vs. 60-Month Loan",
		intro:
			"A shorter auto loan means a bigger monthly payment but far less interest. Compare a 36-month and 60-month term on the same amount.",
		a: { label: "36 Months", values: { termMonths: 36 } },
		b: { label: "60 Months", values: { termMonths: 60 } },
		takeaway:
			"The 60-month term lowers the monthly payment but you pay more interest overall. If the 36-month payment fits your budget, it's the cheaper path.",
	},
];
