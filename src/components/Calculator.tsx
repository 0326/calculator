import { useMemo, useState } from "react";
import { byId } from "../engine/registry";
import { defaultsOf, type InputField, type InputValues } from "../engine/types";
import { formatOutput } from "../engine/format";
import ChartCard from "../charts/ChartCard";

interface Props {
	calculatorId: string;
	/** Optional overrides for long-tail variant pages / embeds. */
	initialValues?: Partial<InputValues>;
	/** Hide intro/explain prose (used inside compact embeds). */
	compact?: boolean;
}

function Field({
	field,
	value,
	error,
	onChange,
}: {
	field: InputField;
	value: number | string | boolean;
	error: string | null;
	onChange: (v: number | string | boolean) => void;
}) {
	const id = `f-${field.id}`;
	const common = { id, "aria-label": field.label } as const;

	let control: React.ReactNode;
	if (field.type === "select") {
		control = (
			<select {...common} value={String(value)} onChange={(e) => onChange(e.target.value)}>
				{field.options?.map((o) => (
					<option key={String(o.value)} value={String(o.value)}>
						{o.label}
					</option>
				))}
			</select>
		);
	} else if (field.type === "toggle") {
		control = (
			<input
				{...common}
				type="checkbox"
				checked={Boolean(value)}
				onChange={(e) => onChange(e.target.checked)}
			/>
		);
	} else if (field.type === "slider") {
		control = (
			<div className="slider-row">
				<input
					{...common}
					type="range"
					min={field.min}
					max={field.max}
					step={field.step}
					value={Number(value)}
					onChange={(e) => onChange(Number(e.target.value))}
				/>
				<output>
					{Number(value)}
					{field.unit ? ` ${field.unit}` : ""}
				</output>
			</div>
		);
	} else {
		control = (
			<div className={`input-affix${field.unit === "$" ? " has-left" : ""}${field.unit && field.unit !== "$" ? " has-right" : ""}`}>
				{field.unit === "$" && <span className="affix affix-left">$</span>}
				<input
					{...common}
					type="number"
					inputMode="decimal"
					min={field.min}
					max={field.max}
					step={field.step}
					value={Number(value)}
					onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
				/>
				{field.unit && field.unit !== "$" && <span className="affix affix-right">{field.unit}</span>}
			</div>
		);
	}

	return (
		<div className={`field${error ? " field-error" : ""}`}>
			<label htmlFor={id}>{field.label}</label>
			{control}
			{field.help && !error && <small className="help">{field.help}</small>}
			{error && <small className="err">{error}</small>}
		</div>
	);
}

export default function Calculator({ calculatorId, initialValues, compact }: Props) {
	const def = byId(calculatorId);
	const [values, setValues] = useState<InputValues>(() => {
		const base: InputValues = def ? defaultsOf(def) : {};
		if (initialValues) {
			for (const [k, v] of Object.entries(initialValues)) {
				if (v !== undefined) base[k] = v;
			}
		}
		return base;
	});

	const result = useMemo(() => (def ? def.compute(values) : null), [def, values]);

	if (!def || !result) return <div className="calc-error">Calculator not found.</div>;

	const errors: Record<string, string | null> = {};
	for (const f of def.inputs) {
		errors[f.id] = f.validate ? f.validate(values[f.id], values) : null;
	}

	const set = (id: string, v: number | string | boolean) =>
		setValues((prev) => ({ ...prev, [id]: v }));

	const primary = def.outputs.find((o) => o.emphasize) ?? def.outputs[0];
	const secondary = def.outputs.filter((o) => o.id !== primary.id);

	return (
		<div className="calculator">
			<div className="calc-grid">
				<form className="calc-inputs" onSubmit={(e) => e.preventDefault()} aria-label={`${def.title} inputs`}>
					{def.inputs.map((f) => (
						<Field
							key={f.id}
							field={f}
							value={values[f.id]}
							error={errors[f.id]}
							onChange={(v) => set(f.id, v)}
						/>
					))}
				</form>

				<div className="calc-results" aria-live="polite">
					<div className="result-primary">
						<span className="result-label">{primary.label}</span>
						<span className="result-value">
							{formatOutput(result.outputs[primary.id], primary.format)}
						</span>
					</div>
					<dl className="result-list">
						{secondary.map((o) => (
							<div key={o.id} className="result-item">
								<dt>{o.label}</dt>
								<dd>{formatOutput(result.outputs[o.id], o.format)}</dd>
							</div>
						))}
					</dl>
				</div>
			</div>

			{!compact && (
				<p className="calc-explain">{def.content.explain(result, values)}</p>
			)}

			<div className="charts">
				{def.visualizations.map((viz) => (
					<ChartCard key={viz.id} viz={viz} data={viz.dataMapping(result, values)} />
				))}
			</div>
		</div>
	);
}
