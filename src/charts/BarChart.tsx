import type { ChartData } from "../engine/types";
import { colorAt } from "../lib/colors";

interface Props {
	data: ChartData;
	height?: number;
	/** Format the value label; defaults to currency. */
	percent?: boolean;
}

/** Hand-drawn SVG bar chart for tax brackets / rate comparison — zero-dep, SSR-friendly. */
export default function BarChart({ data, height = 240, percent = false }: Props) {
	const segments = (data.segments ?? []).filter((s) => Number.isFinite(s.value));
	const max = Math.max(1, ...segments.map((s) => s.value));
	const fmt = (v: number) =>
		percent ? `${v.toFixed(2)}%` : `$${Math.round(v).toLocaleString()}`;

	const w = 520;
	const pad = 40;
	const barGap = 14;
	const barW = segments.length ? (w - pad * 2 - barGap * (segments.length - 1)) / segments.length : 0;
	const chartH = height - 50;

	return (
		<svg
			width="100%"
			viewBox={`0 0 ${w} ${height}`}
			role="img"
			aria-label="Bar chart"
			style={{ maxWidth: w }}
		>
			{segments.map((s, i) => {
				const h = (s.value / max) * chartH;
				const x = pad + i * (barW + barGap);
				const y = chartH - h + 10;
				return (
					<g key={i}>
						<rect x={x} y={y} width={barW} height={h} rx={4} fill={colorAt(i)} />
						<text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="12" fontWeight="600" fill="#0f172a">
							{fmt(s.value)}
						</text>
						<text x={x + barW / 2} y={height - 16} textAnchor="middle" fontSize="12" fill="#64748b">
							{s.label}
						</text>
					</g>
				);
			})}
		</svg>
	);
}
