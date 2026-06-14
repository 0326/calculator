import type { RegionTax } from "./types";
import { EN_TAX } from "./en";

// STUB — placeholder until the "zh content + China IIT" worker fills China individual-income-tax
// brackets (cumulative annual comprehensive income brackets). Falls back to a "default" set so the
// page builds; numbers are NOT China-accurate yet.
export const ZH_TAX: RegionTax = {
	brackets: { default: EN_TAX.brackets.single },
	note: "TODO: replace with China individual income tax (IIT) brackets.",
};
