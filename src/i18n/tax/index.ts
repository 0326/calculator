import type { Locale } from "../config";
import type { RegionTax } from "./types";
import { EN_TAX } from "./en";
import { ZH_TAX } from "./zh";
import { EN_GB_TAX } from "./en-gb";
import { EN_CA_TAX } from "./en-ca";

export type { RegionTax } from "./types";

export const TAX_BY_LOCALE: Record<Locale, RegionTax> = {
	en: EN_TAX,
	zh: ZH_TAX,
	"en-gb": EN_GB_TAX,
	"en-ca": EN_CA_TAX,
};

export function regionTax(locale: Locale): RegionTax {
	return TAX_BY_LOCALE[locale] ?? EN_TAX;
}
