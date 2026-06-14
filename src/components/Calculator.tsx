import { useEffect, useMemo, useRef, useState } from "react";
import { byId } from "../engine/registry";
import { track } from "../lib/analytics";
import { defaultsOf, type InputField, type InputValues } from "../engine/types";
import { formatOutput } from "../engine/format";
import { type Locale, formatLocaleOf } from "../i18n/config";
import { calcContent, localizedExplain } from "../i18n/content";
import ChartCard from "../charts/ChartCard";

interface Props {
	calculatorId: string;
	/** Optional overrides for long-tail variant pages / embeds. */
	initialValues?: Partial<InputValues>;
	/** Hide intro/explain prose (used inside compact embeds). */
	compact?: boolean;
	locale?: Locale;
}

function Field({
	field,
	label,
	value,
	error,
	onChange,
}: {
	field: InputField;
	label: string;
	value: number | string | boolean;
	error: string | null;
	onChange: (v: number | string | boolean) => void;
}) {
	const id = `f-${field.id}`;
	const common = { id, "aria-label": label } as const;

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
			<label htmlFor={id}>{label}</label>
			{control}
			{field.help && !error && <small className="help">{field.help}</small>}
			{error && <small className="err">{error}</small>}
		</div>
	);
}

export default function Calculator({ calculatorId, initialValues, compact, locale = "en" }: Props) {
	const def = byId(calculatorId);
	const fl = formatLocaleOf(locale);
	const l10n = def ? calcContent(def.id, locale) : {};
	const [values, setValues] = useState<InputValues>(() => {
		const base: InputValues = def ? defaultsOf(def) : {};
		if (initialValues) {
			for (const [k, v] of Object.entries(initialValues)) {
				if (v !== undefined) base[k] = v;
			}
		}
		return base;
	});

	// `_locale` is passed to compute so locale-aware calculators (e.g. tax) can adapt rules.
	const result = useMemo(
		() => (def ? def.compute({ ...values, _locale: locale }) : null),
		[def, values, locale],
	);

	// NORTH-STAR: fire `calc_complete` ~800ms after the user stops changing inputs.
	// Privacy: payload carries ONLY the calculatorId — never the input VALUES.
	// Skip the initial mount so a bare page load (no user interaction) does not
	// count as a completed calculation and inflate the metric.
	const mounted = useRef(false);
	useEffect(() => {
		if (!def || !result) return;
		if (!mounted.current) {
			mounted.current = true;
			return;
		}
		const id = window.setTimeout(() => {
			track("calc_complete", { calculatorId: def.id });
		}, 800);
		return () => window.clearTimeout(id);
		// Re-run whenever inputs (and thus `values`) change; intentionally keyed on
		// `values`/`locale` so each settled edit counts as a completed calculation.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [values, locale, def?.id]);

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
							label={l10n.inputs?.[f.id] ?? f.label}
							value={values[f.id]}
							error={errors[f.id]}
							onChange={(v) => set(f.id, v)}
						/>
					))}
				</form>

				<div className="calc-results" aria-live="polite">
					<div className="result-primary">
						<span className="result-label">{l10n.outputs?.[primary.id] ?? primary.label}</span>
						<span className="result-value">
							{formatOutput(result.outputs[primary.id], primary.format, fl)}
						</span>
					</div>
					<dl className="result-list">
						{secondary.map((o) => (
							<div key={o.id} className="result-item">
								<dt>{l10n.outputs?.[o.id] ?? o.label}</dt>
								<dd>{formatOutput(result.outputs[o.id], o.format, fl)}</dd>
							</div>
						))}
					</dl>
				</div>
			</div>

			{!compact && (
				<p className="calc-explain">{localizedExplain(def, result, values, locale)}</p>
			)}

			<div className="charts">
				{def.visualizations.map((viz) => (
					<ChartCard
							key={viz.id}
							viz={viz}
							data={viz.dataMapping(result, values)}
							calculatorId={def.id}
						/>
				))}
			</div>
		</div>
	);
}
