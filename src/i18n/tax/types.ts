import type { TaxBracket } from "../../engine/finance";

/** Per-region income-tax configuration (rule adaptation, PRD §4.4). */
export interface RegionTax {
	/** Brackets keyed by filing status; use "default" when a region has no statuses. */
	brackets: Record<string, TaxBracket[]>;
	/** Short note shown in the disclaimer for this region. */
	note?: string;
}
