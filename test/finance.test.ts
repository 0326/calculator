import { describe, it, expect } from "vitest";
import {
	monthlyPaymentCents,
	amortize,
	futureValue,
	taxOwed,
	monthlyRate,
	type TaxBracket,
} from "../src/engine/finance";

const D = (dollars: number) => dollars * 100; // dollars → cents

describe("monthlyPaymentCents", () => {
	it("matches the textbook payment for $200k @ 6% / 30yr (~$1,199.10)", () => {
		const m = monthlyPaymentCents(D(200000), 6, 360);
		expect(m).toBeGreaterThanOrEqual(D(1199.0));
		expect(m).toBeLessThanOrEqual(D(1199.2));
	});

	it("degrades to P/n when the rate is 0", () => {
		expect(monthlyPaymentCents(D(120000), 0, 360)).toBe(D(333.33));
	});

	it("returns 0 for non-positive principal or term", () => {
		expect(monthlyPaymentCents(0, 6, 360)).toBe(0);
		expect(monthlyPaymentCents(D(100000), 6, 0)).toBe(0);
		expect(monthlyPaymentCents(-1, 6, 360)).toBe(0);
	});

	it("monthlyRate converts annual percent to a monthly fraction", () => {
		expect(monthlyRate(12)).toBeCloseTo(0.01, 10);
		expect(monthlyRate(0)).toBe(0);
	});
});

describe("amortize", () => {
	it("repays exactly the principal and lands the balance at 0", () => {
		const loan = D(200000);
		const a = amortize(loan, 6, 360);
		expect(a.payoffMonths).toBe(360);
		const principalRepaid = a.schedule.reduce((s, r) => s + r.principalCents, 0);
		expect(principalRepaid).toBe(loan);
		expect(a.schedule[a.schedule.length - 1].balanceCents).toBe(0);
		expect(a.totalInterestCents).toBeGreaterThan(0);
		// total paid = principal + interest
		expect(a.totalPaidCents).toBe(loan + a.totalInterestCents);
	});

	it("charges no interest at a 0% rate", () => {
		const a = amortize(D(120000), 0, 360);
		expect(a.totalInterestCents).toBe(0);
		expect(a.payoffMonths).toBe(360);
		expect(a.schedule[a.schedule.length - 1].balanceCents).toBe(0);
	});

	it("extra payments shorten the term and cut total interest", () => {
		const loan = D(300000);
		const base = amortize(loan, 6.5, 360);
		const withExtra = amortize(loan, 6.5, 360, D(300));
		expect(withExtra.payoffMonths).toBeLessThan(base.payoffMonths);
		expect(withExtra.totalInterestCents).toBeLessThan(base.totalInterestCents);
		// still repays the full principal
		const repaid = withExtra.schedule.reduce((s, r) => s + r.principalCents, 0);
		expect(repaid).toBe(loan);
	});

	it("honors a one-time extra payment at month 1", () => {
		const loan = D(300000);
		const a = amortize(loan, 6.5, 360, 0, D(20000));
		expect(a.schedule[0].principalCents).toBeGreaterThan(D(20000));
		expect(a.payoffMonths).toBeLessThan(360);
	});

	it("handles a zero / empty loan gracefully", () => {
		const a = amortize(0, 6, 360);
		expect(a.schedule).toHaveLength(0);
		expect(a.payoffMonths).toBe(0);
		expect(a.totalInterestCents).toBe(0);
	});
});

describe("futureValue", () => {
	it("with 0% return equals contributions only", () => {
		const fv = futureValue(0, 0, 10, D(100));
		expect(fv.fvCents).toBe(D(100) * 120);
		expect(fv.totalContributedCents).toBe(D(100) * 120);
		expect(fv.totalGrowthCents).toBe(0);
	});

	it("compounds a lump sum (~$10k @ 5% / 10yr ≈ $16,470)", () => {
		const fv = futureValue(D(10000), 5, 10, 0);
		expect(fv.fvCents).toBeGreaterThanOrEqual(D(16450));
		expect(fv.fvCents).toBeLessThanOrEqual(D(16490));
		expect(fv.totalGrowthCents).toBeGreaterThan(0);
	});

	it("produces growth above contributions with a positive return", () => {
		const fv = futureValue(D(25000), 7, 30, D(500));
		expect(fv.totalGrowthCents).toBeGreaterThan(0);
		expect(fv.fvCents).toBe(fv.totalContributedCents + fv.totalGrowthCents);
		expect(fv.schedule).toHaveLength(360);
	});

	it("handles 0 years (no months) returning the starting balance", () => {
		const fv = futureValue(D(5000), 7, 0, D(100));
		expect(fv.fvCents).toBe(D(5000));
		expect(fv.schedule).toHaveLength(0);
	});
});

describe("taxOwed (2024 single brackets)", () => {
	const single: TaxBracket[] = [
		{ upToCents: D(11600), ratePct: 10 },
		{ upToCents: D(47150), ratePct: 12 },
		{ upToCents: D(100525), ratePct: 22 },
		{ upToCents: null, ratePct: 24 },
	];

	it("computes $85k single = $13,753 with 22% marginal / ~16.18% effective", () => {
		const r = taxOwed(D(85000), single);
		expect(r.totalTaxCents).toBe(D(13753));
		expect(r.marginalRatePct).toBe(22);
		expect(r.effectiveRatePct).toBeCloseTo(16.18, 1);
	});

	it("returns zero tax and zero effective rate at zero income", () => {
		const r = taxOwed(0, single);
		expect(r.totalTaxCents).toBe(0);
		expect(r.effectiveRatePct).toBe(0);
		expect(r.marginalRatePct).toBe(0);
	});

	it("only the lowest bracket applies for low income", () => {
		const r = taxOwed(D(10000), single);
		expect(r.totalTaxCents).toBe(D(1000)); // 10% of 10k
		expect(r.marginalRatePct).toBe(10);
	});

	it("reaches the top open-ended bracket for high income", () => {
		const r = taxOwed(D(250000), single);
		expect(r.marginalRatePct).toBe(24);
		expect(r.totalTaxCents).toBeGreaterThan(0);
	});
});
