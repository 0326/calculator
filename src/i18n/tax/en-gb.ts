import type { RegionTax } from "./types";

const P = (pounds: number) => pounds * 100; // pounds → pence

// 2024/25 UK income-tax bands (England, Wales & Northern Ireland), in pence.
// Progressive bands modelled as a single `default` status:
//   - Personal allowance: £0–£12,570 taxed at 0%
//   - Basic rate:         £12,570–£50,270 at 20%
//   - Higher rate:        £50,270–£125,140 at 40%
//   - Additional rate:    above £125,140 at 45%
export const EN_GB_TAX: RegionTax = {
	brackets: {
		default: [
			{ upToCents: P(12570), ratePct: 0 },
			{ upToCents: P(50270), ratePct: 20 },
			{ upToCents: P(125140), ratePct: 40 },
			{ upToCents: null, ratePct: 45 },
		],
	},
	note:
		"Simplified 2024/25 UK income-tax bands for England, Wales & Northern Ireland. " +
		"Excludes National Insurance, Scottish rates, and the personal-allowance taper that " +
		"reduces the £12,570 allowance by £1 for every £2 of income above £100,000.",
};
