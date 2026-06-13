import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import type { ChartData } from "../engine/types";
import { colorAt } from "../lib/colors";

interface Props {
	data: ChartData;
	stacked?: boolean;
	height?: number;
	currency?: boolean;
}

/** Cumulative-stack a set of series so fills draw as a stacked area (top→bottom). */
function buildSeriesData(data: ChartData, stacked: boolean): number[][] {
	const series = data.series ?? [];
	if (!stacked) return series.map((s) => s.values);
	// Cumulative sums: result[i] = sum of series[0..i].
	const cum: number[][] = [];
	for (let i = 0; i < series.length; i++) {
		const prev = cum[i - 1];
		cum.push(series[i].values.map((v, j) => (prev ? prev[j] : 0) + v));
	}
	return cum;
}

function fmtMoney(n: number): string {
	const abs = Math.abs(n);
	if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
	if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
	return `$${n.toFixed(0)}`;
}

/**
 * Lightweight uPlot wrapper. Canvas-rendered, ~40KB, handles thousands of points
 * without hurting INP. Drawn client-side only (needs DOM); the data-table fallback
 * in ChartCard covers SSR / no-JS / a11y.
 */
export default function UPlotChart({ data, stacked = false, height = 280, currency = true }: Props) {
	const ref = useRef<HTMLDivElement>(null);
	const plotRef = useRef<uPlot | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const x = data.x ?? (data.series?.[0]?.values.map((_, i) => i) ?? []);
		const ys = buildSeriesData(data, stacked);
		const aligned: uPlot.AlignedData = [x, ...ys];

		// Draw stacked series top→bottom so each fill leaves its own band visible.
		const order = stacked ? ys.map((_, i) => i).reverse() : ys.map((_, i) => i);
		const seriesOpts: uPlot.Series[] = [{}];
		for (const i of order) {
			const c = colorAt(i);
			seriesOpts.push({
				label: data.series?.[i]?.label ?? `S${i}`,
				stroke: c,
				width: 2,
				fill: stacked ? `${c}33` : undefined,
				points: { show: false },
				value: (_u, v) => (v == null ? "—" : currency ? fmtMoney(v) : String(Math.round(v))),
			});
		}

		const opts: uPlot.Options = {
			width: el.clientWidth || 600,
			height,
			padding: [12, 8, 4, 8],
			legend: { show: true },
			cursor: { points: { size: 6 } },
			scales: { x: { time: false } },
			axes: [
				{
					label: data.xLabel,
					stroke: "#475569",
					grid: { stroke: "#eef2f7" },
					ticks: { stroke: "#cbd5e1" },
				},
				{
					stroke: "#475569",
					grid: { stroke: "#eef2f7" },
					ticks: { stroke: "#cbd5e1" },
					values: (_u, vals) => vals.map((v) => (currency ? fmtMoney(v) : String(v))),
				},
			],
			series: seriesOpts,
		};

		// Stacked fills must paint largest-first; reorder aligned data to match.
		const orderedData: uPlot.AlignedData = stacked
			? [x, ...order.map((i) => ys[i])]
			: aligned;

		const plot = new uPlot(opts, orderedData, el);
		plotRef.current = plot;

		const onResize = () => plot.setSize({ width: el.clientWidth || 600, height });
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
			plot.destroy();
			plotRef.current = null;
		};
	}, [data, stacked, height, currency]);

	return <div ref={ref} style={{ width: "100%", height }} />;
}
