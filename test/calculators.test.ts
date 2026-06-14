import { describe, it, expect } from "vitest";
import { ALL_CALCULATORS } from "../src/calculators";
import { defaultsOf } from "../src/engine/types";
import { bySlug, byCategory, qualifiedVariants, qualifies } from "../src/engine/registry";
import { mortgage } from "../src/calculators/mortgage";
import { tax } from "../src/calculators/tax";

describe("registry", () => {
	it("looks calculators up by slug and category", () => {
		expect(bySlug("mortgage-calculator")?.id).toBe("mortgage");
		expect(bySlug("nope")).toBeUndefined();
		expect(byCategory("mortgage").length).toBeGreaterThan(0);
	});

	it("only emits long-tail variants that pass the anti-HCU gate", () => {
		const variants = qualifiedVariants();
		expect(variants.length).toBeGreaterThan(0);
		for (const v of variants) {
			expect(qualifies(v.preset)).toBe(true);
			expect(v.preset.blurb.length).toBeGreaterThanOrEqual(40);
			expect(Object.keys(v.preset.values).length).toBeGreaterThan(0);
		}
	});

	it("rejects a preset with thin copy or no overrides", () => {
		expect(qualifies({ id: "x", label: "X", values: { a: 1 }, blurb: "too short" })).toBe(false);
		expect(
			qualifies({ id: "x", label: "X", values: {}, blurb: "a".repeat(50) }),
		).toBe(false);
	});
});

describe("every calculator config is internally consistent", () => {
	for (const calc of ALL_CALCULATORS) {
		describe(calc.id, () => {
			const defaults = defaultsOf(calc);
			const result = calc.compute(defaults);

			it("computes outputs for all declared output fields", () => {
				for (const f of calc.outputs) {
					expect(result.outputs[f.id], `${calc.id}.${f.id}`).toBeDefined();
					// "date"/"text" outputs are display strings; everything else is numeric cents.
					const expected = f.format === "date" || f.format === "text" ? "string" : "number";
					expect(typeof result.outputs[f.id], `${calc.id}.${f.id}`).toBe(expected);
				}
			});

			it("every visualization produces non-empty chart data", () => {
				for (const viz of calc.visualizations) {
					const data = viz.dataMapping(result, defaults);
					const hasSeries = (data.series?.length ?? 0) > 0;
					const hasSegments = (data.segments?.length ?? 0) > 0;
					// Table-style vizzes carry their rows in meta rather than series/segments.
					const hasMeta = data.meta != null && Object.keys(data.meta).length > 0;
					expect(hasSeries || hasSegments || hasMeta, `${calc.id}:${viz.id}`).toBe(true);
				}
			});

			it("explain() returns page-unique prose", () => {
				const text = calc.content.explain(result, defaults);
				expect(text.length).toBeGreaterThan(40);
			});

			it("has FAQ + disclaimer for SEO/compliance", () => {
				expect(calc.content.faq.length).toBeGreaterThan(0);
				expect(calc.content.disclaimer.length).toBeGreaterThan(0);
			});
		});
	}
});

describe("mortgage edge cases (PRD §7)", () => {
	it("clamps down payment ≥ home price to a zero loan", () => {
		const r = mortgage.compute({
			...defaultsOf(mortgage),
			homePrice: 300000,
			downPayment: 350000,
		});
		expect(r.outputs.loanAmount).toBe(0);
		expect(r.outputs.principalInterest).toBe(0);
	});

	it("surfaces interest savings when extra payments are added", () => {
		const r = mortgage.compute({
			...defaultsOf(mortgage),
			extraMonthly: 300,
		});
		expect(r.outputs.interestSaved as number).toBeGreaterThan(0);
		expect(r.outputs.monthsSaved as number).toBeGreaterThan(0);
	});

	it("handles a 0% interest rate", () => {
		const r = mortgage.compute({ ...defaultsOf(mortgage), annualRate: 0 });
		expect(r.outputs.totalInterest).toBe(0);
		expect(r.outputs.principalInterest as number).toBeGreaterThan(0);
	});

	it("computes the payoff calendar date from start year + term", () => {
		// 30-year loan starting Jan 2025 → 360 payments → last is Dec 2054.
		const r = mortgage.compute({ ...defaultsOf(mortgage), startYear: 2025 });
		expect(r.outputs.payoffDate).toBe("Dec 2054");
	});

	it("brings the payoff date forward when extra payments shorten the loan", () => {
		const base = mortgage.compute({ ...defaultsOf(mortgage), startYear: 2025 });
		const fast = mortgage.compute({
			...defaultsOf(mortgage),
			startYear: 2025,
			extraMonthly: 500,
		});
		expect(fast.outputs.payoffTime as number).toBeLessThan(base.outputs.payoffTime as number);
		// Earlier payoff ⇒ a strictly earlier (not equal) date string.
		expect(fast.outputs.payoffDate).not.toBe(base.outputs.payoffDate);
	});

	it("exposes a full monthly amortization schedule for the table viz", () => {
		const r = mortgage.compute(defaultsOf(mortgage));
		const tableViz = mortgage.visualizations.find((v) => v.type === "amortization_table");
		expect(tableViz).toBeDefined();
		const data = tableViz!.dataMapping(r, defaultsOf(mortgage));
		const schedule = data.meta?.schedule as { month: number }[] | undefined;
		expect(schedule?.length).toBe(360);
		expect(schedule?.[0].month).toBe(1);
	});
});

describe("tax marginal vs effective", () => {
	it("effective rate is below marginal for mid income", () => {
		const r = tax.compute({ income: 85000, filingStatus: "single" });
		expect(r.outputs.effectiveRate as number).toBeLessThan(r.outputs.marginalRate as number);
	});

	it("married brackets tax less than single at the same income", () => {
		const single = tax.compute({ income: 120000, filingStatus: "single" });
		const married = tax.compute({ income: 120000, filingStatus: "married" });
		expect(married.outputs.totalTax as number).toBeLessThan(single.outputs.totalTax as number);
	});
});
