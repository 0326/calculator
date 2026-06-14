// Canada (en-CA) content overrides. Copy stays English; the formatter renders C$ automatically.
// Minimal pass: only what differs from the English source config (English is the fallback).

import type { LocaleContent } from "./index";

export const EN_CA: LocaleContent = {
	tax: {
		// Canada federal brackets don't vary by filing status, so frame this as the federal estimate.
		disclaimer:
			"For general information only — not tax advice. Uses simplified 2024 Canada FEDERAL brackets and excludes provincial/territorial tax, the basic personal amount, and other credits.",
	},
};
