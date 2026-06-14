// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

// Pure static output → zero server compute (PRD §9), maximal CWV.
// Cloudflare hosts the built static assets (see wrangler.json).
export default defineConfig({
	site: "https://example.com",
	output: "static",
	i18n: {
		defaultLocale: "en",
		locales: ["en", "zh", "en-gb", "en-ca"],
		routing: { prefixDefaultLocale: false },
	},
	integrations: [
		react(),
		sitemap({
			i18n: {
				defaultLocale: "en",
				locales: { en: "en-US", zh: "zh-CN", "en-gb": "en-GB", "en-ca": "en-CA" },
			},
		}),
	],
	build: {
		inlineStylesheets: "auto",
	},
	vite: {
		// uPlot ships its own CSS; keep it out of SSR transforms.
		ssr: {
			noExternal: ["uplot"],
		},
	},
});
