import { useMemo } from "react";
import type { ChartData } from "../engine/types";
import type { AmortRow } from "../engine/finance";
import { formatCurrency } from "../engine/format";

interface Props {
	data: ChartData;
}

interface YearGroup {
	year: number;
	rows: AmortRow[];
	paymentCents: number;
	principalCents: number;
	interestCents: number;
	endBalanceCents: number;
}

/** Bucket the flat monthly schedule into year groups (12 months each). */
function groupByYear(schedule: AmortRow[]): YearGroup[] {
	const groups: YearGroup[] = [];
	for (const row of schedule) {
		const y = Math.ceil(row.month / 12);
		let g = groups[y - 1];
		if (!g) {
			g = {
				year: y,
				rows: [],
				paymentCents: 0,
				principalCents: 0,
				interestCents: 0,
				endBalanceCents: 0,
			};
			groups[y - 1] = g;
		}
		g.rows.push(row);
		g.paymentCents += row.paymentCents;
		g.principalCents += row.principalCents;
		g.interestCents += row.interestCents;
		g.endBalanceCents = row.balanceCents; // last month of the year wins
	}
	return groups.filter(Boolean);
}

/**
 * Full amortization schedule. Renders one accessible <table> per year inside a
 * scrollable region; each year is an expandable <details> so the DOM for the
 * monthly rows is collapsed by default and the page stays light even for a
 * 360-month loan.
 */
export default function AmortizationTable({ data }: Props) {
	const schedule = (data.meta?.schedule as AmortRow[] | undefined) ?? [];
	const years = useMemo(() => groupByYear(schedule), [schedule]);

	if (schedule.length === 0) {
		return <p className="amort-empty">No amortization schedule for these inputs.</p>;
	}

	return (
		<div
			className="amort-table-scroll"
			style={{ maxHeight: 420, overflowY: "auto" }}
			role="region"
			aria-label="Full amortization schedule"
			tabIndex={0}
		>
			{years.map((g) => (
				<details key={g.year} className="amort-year">
					<summary>
						<span className="amort-year-label">Year {g.year}</span>
						<span className="amort-year-summary">
							Principal {formatCurrency(g.principalCents)} · Interest{" "}
							{formatCurrency(g.interestCents)} · Balance{" "}
							{formatCurrency(g.endBalanceCents)}
						</span>
					</summary>
					<table className="data-table amort-months">
						<thead>
							<tr>
								<th scope="col">Month</th>
								<th scope="col">Payment</th>
								<th scope="col">Principal</th>
								<th scope="col">Interest</th>
								<th scope="col">Balance</th>
							</tr>
						</thead>
						<tbody>
							{g.rows.map((r) => (
								<tr key={r.month}>
									<th scope="row">{r.month}</th>
									<td>{formatCurrency(r.paymentCents)}</td>
									<td>{formatCurrency(r.principalCents)}</td>
									<td>{formatCurrency(r.interestCents)}</td>
									<td>{formatCurrency(r.balanceCents)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</details>
			))}
		</div>
	);
}
