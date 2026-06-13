// Config-driven calculator engine — type definitions (PRD §5.1).
// Framework-agnostic: no React / Astro imports here. Reused by site + embed + future API.

export type LocaleCode = "en-US" | "en-GB" | "zh-CN";

export interface LocaleConfig {
	code: LocaleCode;
	currency: string; // ISO 4217, e.g. "USD"
	label: string;
}

export type InputType =
	| "number"
	| "currency"
	| "percent"
	| "select"
	| "slider"
	| "toggle";

export interface SelectOption {
	label: string;
	value: string | number;
}

export type InputValues = Record<string, number | string | boolean>;

export interface Preset {
	id: string; // becomes the long-tail variant slug segment
	label: string;
	values: Partial<InputValues>;
	blurb: string; // unique copy for the variant page (HCU gate input)
}

export interface InputField {
	id: string;
	label: string;
	type: InputType;
	default: number | string | boolean;
	min?: number;
	max?: number;
	step?: number;
	unit?: string;
	help?: string;
	options?: SelectOption[];
	/** Inline validation: return an error string or null. */
	validate?: (value: number | string | boolean, all: InputValues) => string | null;
	presets?: Preset[];
}

export type OutputFormat =
	| "currency"
	| "percent"
	| "number"
	| "months"
	| "date"
	| "text";

export type OutputValues = Record<string, number | string>;

export interface OutputField {
	id: string;
	label: string;
	format: OutputFormat;
	emphasize?: boolean;
	help?: string;
}

/** Result of a compute(): display-ready outputs + raw detail for charts. */
export interface ComputeResult {
	outputs: OutputValues;
	/** Arrays/objects (schedules, projections) consumed by visualizations. */
	detail: Record<string, unknown>;
}

export type ComputeFn = (v: InputValues) => ComputeResult;

export interface ChartSeries {
	label: string;
	values: number[];
	color?: string;
}

export interface ChartSegment {
	label: string;
	value: number;
	color?: string;
}

export interface ChartData {
	x?: number[];
	series?: ChartSeries[];
	segments?: ChartSegment[];
	xLabel?: string;
	yLabel?: string;
	meta?: Record<string, unknown>;
}

export type VizType =
	| "amortization"
	| "breakdown_donut"
	| "growth_area"
	| "sensitivity_line"
	| "scenario_compare"
	| "monte_carlo_fan"
	| "tax_bracket_bar";

export interface VizSpec {
	id: string;
	type: VizType;
	title: string;
	description?: string;
	interactive: boolean;
	dataMapping: (result: ComputeResult, inputs: InputValues) => ChartData;
}

export interface FAQItem {
	q: string;
	a: string;
}

export interface ContentBlocks {
	intro: string;
	/** Page-unique interpretation of the numbers (anti-HCU, PRD §4.3). */
	explain: (result: ComputeResult, inputs: InputValues) => string;
	faq: FAQItem[];
	disclaimer: string;
}

export interface StructuredData {
	applicationCategory: string; // schema.org WebApplication category
}

export type Category =
	| "mortgage"
	| "loan"
	| "retirement"
	| "tax"
	| "investment";

export interface CalculatorDef {
	id: string;
	slug: string;
	title: string;
	category: Category;
	description: string;
	locales: LocaleConfig[];
	inputs: InputField[];
	compute: ComputeFn;
	outputs: OutputField[];
	visualizations: VizSpec[];
	content: ContentBlocks;
	related: string[];
	schemaOrg: StructuredData;
}

/** Default value map derived from a calculator's input fields. */
export function defaultsOf(def: CalculatorDef): InputValues {
	const v: InputValues = {};
	for (const f of def.inputs) v[f.id] = f.default;
	return v;
}
