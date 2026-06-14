import type { ChartData } from "../engine/types";

interface Props {
	data: ChartData;
	/** Cap rows for series tables so long schedules don't bloat the DOM. */
	maxRows?: number;
}

function sampleIndices(n: number, max: number): number[] {
	if (n <= max) return Array.from({ length: n }, (_, i) => i);
	const out: number[] = [];
	for (let i = 0; i < max; i++) out.push(Math.round((i * (n - 1)) / (max - 1)));
	return [...new Set(out)];
}

const money = (v: number) => `$${Math.round(v).toLocaleString()}`;

/**
 * Accessible data-table fallback for every chart (PRD §6: a11y + SEO + no-JS).
 * Server-rendered as part of the island, so the data exists without any JavaScript.
 */
export default function DataTable({ data, maxRows = 24 }: Props) {
	if (data.segments?.length) {
		return (
			<table className="data-table">
				<thead>
					<tr>
						<th scope="col">Category</th>
						<th scope="col">Value</th>
					</tr>
				</thead>
				<tbody>
					{data.segments.map((s, i) => (
						<tr key={i}>
							<th scope="row">{s.label}</th>
							<td>{money(s.value)}</td>
						</tr>
					))}
				</tbody>
			</table>
		);
	}

	const series = data.series ?? [];
	const x = data.x ?? series[0]?.values.map((_, i) => i) ?? [];
	const idx = sampleIndices(x.length, maxRows);
	return (
		<table className="data-table">
			<thead>
				<tr>
					<th scope="col">{data.xLabel ?? "#"}</th>
					{series.map((s) => (
						<th scope="col" key={s.label}>
							{s.label}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{idx.map((i) => (
					<tr key={i}>
						<th scope="row">{typeof x[i] === "number" ? Math.round(x[i] as number) : x[i]}</th>
						{series.map((s) => (
							<td key={s.label}>{money(s.values[i] ?? 0)}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}
