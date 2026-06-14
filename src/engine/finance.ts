// Core financial formulas — pure, deterministic, 100%-tested (PRD §5.3).
// Inputs/outputs are in integer cents unless named otherwise. Rates are annual percents.

import { roundCents } from "./money";

/** Monthly rate from an annual percentage rate. */
export function monthlyRate(annualRatePct: number): number {
	return annualRatePct / 100 / 12;
}

/**
 * Fully-amortizing level monthly payment (equal principal+interest).
 *   M = P·r(1+r)^n / ((1+r)^n − 1);  r=0 → P/n.
 * Returns integer cents (rounded).
 */
export function monthlyPaymentCents(
	principalCents: number,
	annualRatePct: number,
	termMonths: number,
): number {
	if (termMonths <= 0) return 0;
	if (principalCents <= 0) return 0;
	const r = monthlyRate(annualRatePct);
	if (r === 0) return roundCents(principalCents / termMonths);
	const factor = Math.pow(1 + r, termMonths);
	return roundCents((principalCents * r * factor) / (factor - 1));
}

export interface AmortRow {
	month: number; // 1-based
	paymentCents: number;
	interestCents: number;
	principalCents: number;
	balanceCents: number;
}

export interface AmortResult {
	schedule: AmortRow[];
	totalInterestCents: number;
	totalPaidCents: number;
	payoffMonths: number;
}

/**
 * Amortization schedule. Each period: interest = round(balance·r),
 * principal = payment − interest (+ extra), balance −= principal.
 * Supports recurring extra monthly payment and a one-time extra at month 1.
 * Final period absorbs rounding so the balance lands exactly at 0.
 */
export function amortize(
	principalCents: number,
	annualRatePct: number,
	termMonths: number,
	extraMonthlyCents = 0,
	extraOnceCents = 0,
): AmortResult {
	const schedule: AmortRow[] = [];
	let balance = Math.max(0, Math.round(principalCents));
	if (balance === 0 || termMonths <= 0) {
		return { schedule, totalInterestCents: 0, totalPaidCents: 0, payoffMonths: 0 };
	}

	const r = monthlyRate(annualRatePct);
	const basePayment = monthlyPaymentCents(principalCents, annualRatePct, termMonths);
	let totalInterest = 0;
	let totalPaid = 0;

	// Safety cap: an extra payment can only shorten; never exceed the scheduled term.
	const cap = termMonths;
	for (let month = 1; month <= cap && balance > 0; month++) {
		const interest = roundCents(balance * r);
		let extra = extraMonthlyCents;
		if (month === 1) extra += extraOnceCents;

		let principal = basePayment - interest + extra;
		// Guard against negative amortization (payment can't cover interest).
		if (principal <= 0) principal = 0;
		// Final period: don't overpay past the remaining balance.
		if (principal > balance) principal = balance;
		// At the scheduled final month, absorb any rounding residual so the loan
		// closes at exactly 0 (a rounded level payment otherwise leaves a few cents).
		if (month === termMonths) principal = balance;

		const payment = interest + principal;
		balance -= principal;

		totalInterest += interest;
		totalPaid += payment;
		schedule.push({
			month,
			paymentCents: payment,
			interestCents: interest,
			principalCents: principal,
			balanceCents: balance,
		});

		// If the payment can never reduce principal, stop to avoid an infinite-cost loop.
		if (principal === 0) break;
	}

	return {
		schedule,
		totalInterestCents: totalInterest,
		totalPaidCents: totalPaid,
		payoffMonths: schedule.length,
	};
}

export interface FVRow {
	month: number;
	contributedCents: number; // cumulative principal contributed
	balanceCents: number; // total value
	growthCents: number; // balance − contributed
}

export interface FVResult {
	fvCents: number;
	totalContributedCents: number;
	totalGrowthCents: number;
	schedule: FVRow[]; // monthly snapshots
}

/**
 * Future value with monthly compounding and a level monthly contribution.
 *   FV = P(1+r)^n + PMT·((1+r)^n − 1)/r  (closed form; iterative here for the schedule).
 * principalCents = starting balance, monthlyContribCents added at end of each month.
 */
export function futureValue(
	principalCents: number,
	annualRatePct: number,
	years: number,
	monthlyContribCents = 0,
): FVResult {
	const months = Math.round(years * 12);
	const r = monthlyRate(annualRatePct);
	let balance = Math.max(0, Math.round(principalCents));
	let contributed = balance;
	const schedule: FVRow[] = [];

	for (let month = 1; month <= months; month++) {
		balance = roundCents(balance * (1 + r)) + monthlyContribCents;
		contributed += monthlyContribCents;
		schedule.push({
			month,
			contributedCents: contributed,
			balanceCents: balance,
			growthCents: balance - contributed,
		});
	}

	if (months === 0) {
		return {
			fvCents: balance,
			totalContributedCents: contributed,
			totalGrowthCents: balance - contributed,
			schedule,
		};
	}

	return {
		fvCents: balance,
		totalContributedCents: contributed,
		totalGrowthCents: balance - contributed,
		schedule,
	};
}

export interface TaxBracket {
	/** Upper bound of this bracket in cents, or null for the top (infinite) bracket. */
	upToCents: number | null;
	ratePct: number;
}

export interface TaxBracketDetail {
	ratePct: number;
	lowerCents: number;
	upperCents: number | null;
	taxableInBracketCents: number;
	taxCents: number;
}

export interface TaxResult {
	totalTaxCents: number;
	marginalRatePct: number;
	effectiveRatePct: number;
	perBracket: TaxBracketDetail[];
}

/**
 * Progressive tax: sum tax owed across brackets (PRD §5.3).
 * Brackets must be sorted ascending by upToCents (null last).
 */
export function taxOwed(incomeCents: number, brackets: TaxBracket[]): TaxResult {
	const income = Math.max(0, Math.round(incomeCents));
	let lower = 0;
	let totalTax = 0;
	let marginal = 0;
	const perBracket: TaxBracketDetail[] = [];

	for (const b of brackets) {
		const upper = b.upToCents;
		const bracketTop = upper === null ? income : Math.min(upper, income);
		const taxable = Math.max(0, bracketTop - lower);
		const tax = roundCents((taxable * b.ratePct) / 100);
		if (taxable > 0) marginal = b.ratePct;
		totalTax += tax;
		perBracket.push({
			ratePct: b.ratePct,
			lowerCents: lower,
			upperCents: upper,
			taxableInBracketCents: taxable,
			taxCents: tax,
		});
		lower = upper === null ? income : upper;
		if (income <= lower && upper !== null) {
			// Income exhausted; remaining brackets contribute 0 but keep marginal correct.
		}
	}

	const effective = income > 0 ? (totalTax / income) * 100 : 0;
	return {
		totalTaxCents: totalTax,
		marginalRatePct: marginal,
		effectiveRatePct: effective,
		perBracket,
	};
}
