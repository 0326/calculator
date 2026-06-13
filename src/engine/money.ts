// Integer-cents money helpers (PRD §5.2).
// All monetary math runs on integer cents to avoid float drift; display layer formats.

/** Dollars (float) → integer cents. */
export function toCents(dollars: number): number {
	return Math.round(dollars * 100);
}

/** Integer cents → dollars (float), for display only. */
export function toDollars(cents: number): number {
	return cents / 100;
}

/** Round any fractional cents to a whole cent. */
export function roundCents(cents: number): number {
	return Math.round(cents);
}

/** Clamp to a non-negative integer-cent amount. */
export function nonNeg(cents: number): number {
	return cents < 0 ? 0 : Math.round(cents);
}
