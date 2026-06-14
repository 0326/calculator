import type { RegionTax } from "./types";
import { EN_TAX } from "./en";

// STUB — placeholder until the "en-CA locale" worker fills Canada federal tax brackets.
// Builds with a fallback set; numbers are NOT Canada-accurate yet.
export const EN_CA_TAX: RegionTax = {
	brackets: { default: EN_TAX.brackets.single },
	note: "TODO: replace with Canada federal income-tax brackets.",
};
