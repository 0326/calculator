import type { RegionTax } from "./types";

const D = (dollars: number) => dollars * 100; // dollars → cents (CAD)

// 2024 Canada FEDERAL income-tax brackets (upper bounds in CAD cents; null = top bracket).
// Single "default" status — federal brackets do not vary by filing status.
export const EN_CA_TAX: RegionTax = {
	brackets: {
		default: [
			{ upToCents: D(55867), ratePct: 15 },
			{ upToCents: D(111733), ratePct: 20.5 },
			{ upToCents: D(173205), ratePct: 26 },
			{ upToCents: D(246752), ratePct: 29 },
			{ upToCents: null, ratePct: 33 },
		],
	},
	note: "Simplified 2024 Canada FEDERAL brackets only — excludes provincial/territorial tax, the basic personal amount, and other credits.",
};
