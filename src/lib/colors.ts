// Shared chart palette (UI side). Kept out of the engine so compute stays presentation-free.
// Light, high-contrast, no dark mode (PRD §8 anti-dark-pattern brand stance).

export const SERIES_COLORS = [
	"#2563eb", // blue   — primary / principal / contributed
	"#f59e0b", // amber  — interest / growth
	"#10b981", // green  — optimistic / savings
	"#ef4444", // red    — conservative / cost
	"#8b5cf6", // violet
	"#0891b2", // cyan
];

export function colorAt(i: number): string {
	return SERIES_COLORS[i % SERIES_COLORS.length];
}
