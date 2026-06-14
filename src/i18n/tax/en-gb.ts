import type { RegionTax } from "./types";
import { EN_TAX } from "./en";

// STUB — placeholder until the "en-GB locale" worker fills UK income-tax bands
// (personal allowance, basic 20% / higher 40% / additional 45%). Builds with a fallback set.
export const EN_GB_TAX: RegionTax = {
	brackets: { default: EN_TAX.brackets.single },
	note: "TODO: replace with UK income-tax bands.",
};
