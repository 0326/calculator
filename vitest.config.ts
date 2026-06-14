import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["test/**/*.test.ts"],
		coverage: {
			provider: "v8",
			include: ["src/engine/**/*.ts", "src/calculators/**/*.ts"],
			exclude: ["src/engine/index.ts", "**/*.d.ts"],
			thresholds: {
				// Engine is the trust root — keep coverage high (PRD §5.2).
				lines: 85,
				functions: 80,
				branches: 75,
				statements: 85,
			},
		},
	},
});
