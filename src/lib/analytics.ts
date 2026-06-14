/**
 * Privacy-friendly analytics — FinCalc.
 *
 * NORTH-STAR METRIC: "Calculations Completed" (the `calc_complete` event).
 * Every other event is supporting context for that number.
 *
 * Privacy guarantees (core brand value — all calculation is client-side):
 *  - NO-OP unless an analytics sink is configured. By default nothing is sent
 *    anywhere except an in-page debug buffer (`window.__fincalc_events`).
 *  - NEVER send PII. NEVER send the user's financial input VALUES. Only event
 *    names + coarse, non-identifying props (e.g. `calculatorId`, a chart id).
 *  - If a privacy-friendly provider is present (Plausible — cookieless, no
 *    cross-site tracking), forward to it. Otherwise just buffer locally.
 *  - SSR-safe: all access to `window` is guarded.
 */

export type AnalyticsProps = Record<string, string | number>;

interface PlausibleFn {
	(event: string, opts?: { props?: AnalyticsProps }): void;
}

declare global {
	interface Window {
		plausible?: PlausibleFn;
		/** Debug/no-op sink. Holds buffered events when no provider is configured. */
		__fincalc_events?: Array<{ event: string; props?: AnalyticsProps; ts: number }>;
	}
}

const MAX_BUFFER = 200;

/**
 * Track a custom event. Privacy-safe by construction: callers must only pass
 * coarse, non-identifying props — never raw financial input values or PII.
 */
export function track(event: string, props?: AnalyticsProps): void {
	if (typeof window === "undefined") return; // SSR no-op

	// Forward to Plausible if configured (privacy-friendly, cookieless).
	if (typeof window.plausible === "function") {
		try {
			window.plausible(event, props ? { props } : undefined);
		} catch {
			/* analytics must never break the app */
		}
		return;
	}

	// Fallback: buffer in-page only. Nothing leaves the device.
	const buf = (window.__fincalc_events ??= []);
	buf.push({ event, props, ts: Date.now() });
	if (buf.length > MAX_BUFFER) buf.splice(0, buf.length - MAX_BUFFER);
}

/**
 * Record a page view. Provider-agnostic entry point used by Base.astro.
 *
 * When Plausible is configured it auto-tracks real pageviews via its own script
 * include, so we deliberately do NOT forward anything to it here (forwarding a
 * custom event literally named "pageview" would create junk in the dashboard).
 * In the no-op/debug path we buffer a marker so local testing can observe it.
 */
export function pageview(): void {
	if (typeof window === "undefined") return; // SSR no-op
	if (typeof window.plausible === "function") return; // Plausible handles pageviews itself

	const buf = (window.__fincalc_events ??= []);
	buf.push({ event: "pageview", ts: Date.now() });
	if (buf.length > MAX_BUFFER) buf.splice(0, buf.length - MAX_BUFFER);
}
