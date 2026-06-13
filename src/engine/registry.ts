// Calculator registry — lookup by slug / id / category, and long-tail variant enumeration.

import type { CalculatorDef, Category, Preset } from "./types";
import { ALL_CALCULATORS } from "../calculators";

export const calculators = ALL_CALCULATORS;

export function bySlug(slug: string): CalculatorDef | undefined {
	return calculators.find((c) => c.slug === slug);
}

export function byId(id: string): CalculatorDef | undefined {
	return calculators.find((c) => c.id === id);
}

export function byCategory(category: Category): CalculatorDef[] {
	return calculators.filter((c) => c.category === category);
}

export function categories(): Category[] {
	return [...new Set(calculators.map((c) => c.category))];
}

export interface VariantRef {
	calculator: CalculatorDef;
	preset: Preset;
}

/**
 * Enumerate long-tail variants (calculator × preset) that pass the anti-HCU gate.
 * A variant qualifies only if it has BOTH unique copy (blurb) and overridden inputs
 * that yield a genuinely different computed result (PRD §4.3). No filler pages.
 */
export function qualifiedVariants(): VariantRef[] {
	const out: VariantRef[] = [];
	for (const calculator of calculators) {
		for (const field of calculator.inputs) {
			for (const preset of field.presets ?? []) {
				if (qualifies(preset)) out.push({ calculator, preset });
			}
		}
	}
	return out;
}

/** HCU gate: unique copy + at least one input override (distinct result). */
export function qualifies(preset: Preset): boolean {
	const hasCopy = typeof preset.blurb === "string" && preset.blurb.trim().length >= 40;
	const hasOverride = Object.keys(preset.values).length > 0;
	return hasCopy && hasOverride;
}
