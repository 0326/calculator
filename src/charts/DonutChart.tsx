import { useState } from "react";
import type { ChartData } from "../engine/types";
import { colorAt } from "../lib/colors";

interface Props {
	data: ChartData;
	size?: number;
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
	const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
	const [x0, y0] = p(a0);
	const [x1, y1] = p(a1);
	const large = a1 - a0 > Math.PI ? 1 : 0;
	return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

/** Hand-drawn SVG donut — zero-dep, SSR-friendly, React-19 safe. */
export default function DonutChart({ data, size = 240 }: Props) {
	const segments = (data.segments ?? []).filter((s) => s.value > 0);
	const total = segments.reduce((s, x) => s + x.value, 0);
	const [hover, setHover] = useState<number | null>(null);
	const cx = size / 2;
	const cy = size / 2;
	const r = size / 2 - 16;
	const stroke = 28;

	let angle = -Math.PI / 2;
	const paths = segments.map((seg, i) => {
		const frac = total > 0 ? seg.value / total : 0;
		const a0 = angle;
		const a1 = angle + frac * Math.PI * 2;
		angle = a1;
		return { d: arc(cx, cy, r, a0, Math.min(a1, a0 + Math.PI * 1.9999)), color: colorAt(i), i, frac, seg };
	});

	const active = hover != null ? segments[hover] : null;

	return (
		<div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				role="img"
				aria-label="Payment breakdown donut chart"
			>
				{paths.map((p) => (
					<path
						key={p.i}
						d={p.d}
						fill="none"
						stroke={p.color}
						strokeWidth={hover === p.i ? stroke + 6 : stroke}
						strokeLinecap="butt"
						onMouseEnter={() => setHover(p.i)}
						onMouseLeave={() => setHover(null)}
						style={{ cursor: "pointer", transition: "stroke-width .12s" }}
					/>
				))}
				<text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fill="#64748b">
					{active ? active.label : "Total"}
				</text>
				<text x={cx} y={cy + 16} textAnchor="middle" fontSize="17" fontWeight="700" fill="#0f172a">
					{active
						? `${Math.round((active.value / total) * 100)}%`
						: `$${Math.round(total).toLocaleString()}`}
				</text>
			</svg>
			<ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14 }}>
				{paths.map((p) => (
					<li
						key={p.i}
						onMouseEnter={() => setHover(p.i)}
						onMouseLeave={() => setHover(null)}
						style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0", cursor: "pointer" }}
					>
						<span style={{ width: 12, height: 12, borderRadius: 3, background: p.color, display: "inline-block" }} />
						<span style={{ color: "#334155" }}>{p.seg.label}</span>
						<span style={{ marginLeft: "auto", fontWeight: 600, color: "#0f172a" }}>
							${Math.round(p.seg.value).toLocaleString()}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
