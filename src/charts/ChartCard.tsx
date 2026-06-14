import { lazy, Suspense, useRef } from "react";
import type { ChartData, VizSpec } from "../engine/types";
import { track } from "../lib/analytics";
import DonutChart from "./DonutChart";
import BarChart from "./BarChart";
import DataTable from "./DataTable";
import AmortizationTable from "./AmortizationTable";

// uPlot pulls in canvas drawing code — load it lazily so it doesn't block first paint.
const UPlotChart = lazy(() => import("./UPlotChart"));

interface Props {
	viz: VizSpec;
	data: ChartData;
	/** Passed through from Calculator for analytics; optional for standalone use. */
	calculatorId?: string;
}

const STACKED = new Set(["amortization", "growth_area"]);

function ChartBody({ viz, data }: Props) {
	switch (viz.type) {
		case "breakdown_donut":
			return <DonutChart data={data} />;
		case "tax_bracket_bar":
			return <BarChart data={data} percent={viz.id === "rate-compare"} />;
		case "amortization_table":
			return <AmortizationTable data={data} />;
		default:
			return (
				<Suspense fallback={<div style={{ height: 280 }} aria-hidden="true" />}>
					<UPlotChart data={data} stacked={STACKED.has(viz.type)} />
				</Suspense>
			);
	}
}

/**
 * One chart + its always-present data-table fallback. The chart container has a
 * reserved height to prevent layout shift (PRD §8 CLS budget).
 */
export default function ChartCard({ viz, data, calculatorId }: Props) {
	// Fire `chart_interaction` exactly once, on the user's first hover/tap.
	// Privacy: only the chart id + (optional) calculatorId — never any data values.
	const interacted = useRef(false);
	const onFirstInteraction = () => {
		if (interacted.current) return;
		interacted.current = true;
		track("chart_interaction", {
			chart: viz.id,
			...(calculatorId ? { calculatorId } : {}),
		});
	};

	return (
		<figure
			className="chart-card"
			onPointerEnter={onFirstInteraction}
			onPointerDown={onFirstInteraction}
		>
			<figcaption>
				<h3>{viz.title}</h3>
				{viz.description && <p className="chart-desc">{viz.description}</p>}
			</figcaption>
			<div className="chart-body" style={{ minHeight: 280 }}>
				<ChartBody viz={viz} data={data} />
			</div>
			{viz.type !== "amortization_table" && (
				<details className="chart-table">
					<summary>View data table</summary>
					<DataTable data={data} />
				</details>
			)}
		</figure>
	);
}
