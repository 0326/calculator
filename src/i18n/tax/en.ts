import type { RegionTax } from "./types";

const D = (dollars: number) => dollars * 100; // dollars → cents

// 2024 U.S. federal brackets by filing status (upper bounds in cents; null = top bracket).
export const EN_TAX: RegionTax = {
	brackets: {
		single: [
			{ upToCents: D(11600), ratePct: 10 },
			{ upToCents: D(47150), ratePct: 12 },
			{ upToCents: D(100525), ratePct: 22 },
			{ upToCents: D(191950), ratePct: 24 },
			{ upToCents: D(243725), ratePct: 32 },
			{ upToCents: D(609350), ratePct: 35 },
			{ upToCents: null, ratePct: 37 },
		],
		married: [
			{ upToCents: D(23200), ratePct: 10 },
			{ upToCents: D(94300), ratePct: 12 },
			{ upToCents: D(201050), ratePct: 22 },
			{ upToCents: D(383900), ratePct: 24 },
			{ upToCents: D(487450), ratePct: 32 },
			{ upToCents: D(731200), ratePct: 35 },
			{ upToCents: null, ratePct: 37 },
		],
	},
	note: "Simplified 2024 U.S. federal brackets; excludes state tax, credits, and deductions.",
};
