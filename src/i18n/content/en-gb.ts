// UK (en-GB) content overrides. Copy is English; the formatter renders £ automatically.
// "en-GB locale" adds UK terminology tweaks and UK income-tax bands for the tax calculator.

import type { LocaleContent } from "./index";

export const EN_GB: LocaleContent = {
	mortgage: {
		inputs: { downPayment: "Deposit" },
		faq: [
			{
				q: "What's included in the monthly payment?",
				a: "Principal and interest, plus any monthly property tax, home insurance and service charge you enter. Figures are shown in £.",
			},
			{
				q: "Does this include Stamp Duty or Council Tax?",
				a: "No. This estimate covers the mortgage itself — Stamp Duty Land Tax, conveyancing fees and Council Tax are separate and not included.",
			},
			{
				q: "Is my data uploaded?",
				a: "No. Everything is calculated locally in your browser; nothing you type leaves your device.",
			},
		],
	},
	tax: {
		description:
			"Estimate your UK income tax by band and see why your effective rate is lower than your top marginal rate. Amounts are shown in £.",
		disclaimer:
			"For general information only — not tax advice. Uses simplified 2024/25 UK income-tax bands (England, Wales & Northern Ireland) and excludes National Insurance, Scottish rates, and the personal-allowance taper above £100,000.",
	},
};
