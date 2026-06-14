# FinCalc — Financial Calculator Site

Config-driven financial calculators with the clearest interactive charts on the web.
100% free, no sign-up, and **every calculation runs in the browser** — financial data never
leaves the device. Built for Core Web Vitals (which, in this niche, equals traffic).

See [docs/prd.md](docs/prd.md) for the product strategy and [docs/tech-plan.md](docs/tech-plan.md)
for the architecture and roadmap.

## Stack

- **Astro** (static output, islands) — zero JS by default; only the calculator hydrates.
- **React 19** islands for interactive calculators + charts.
- **uPlot** (time-series) + hand-drawn **SVG** (donut / bars) — lightweight, CWV-friendly.
- **Pure-TS engine** (`src/engine`) — framework-agnostic, integer-cents math, fully tested.
- **Cloudflare** static hosting (`wrangler.json`).

## Architecture

```
src/engine/       Pure-TS calc engine: types · money (cents) · finance · format · registry
src/calculators/  One declarative config per calculator (mortgage / loan / retirement / tax)
src/charts/       React chart islands (uPlot + SVG) + accessible data-table fallback
src/components/   Calculator island, Astro page shell, JSON-LD, ad slots
src/pages/        SSG routes: core calculators, long-tail variants, hubs, comparisons, embeds
src/content/      Comparison specs (and future locale rules / copy)
test/             Vitest golden cases for the engine (the trust root)
```

Adding a calculator = adding one config file in `src/calculators/` and registering it.

## Commands

```bash
npm install
npm run dev        # local dev server
npm test           # engine golden tests (must stay green)
npm run check      # Astro + TypeScript type check
npm run build      # static build → dist/
npm run preview    # serve the production build
npm run deploy     # build + wrangler deploy to Cloudflare
```

## Key properties

- **Privacy:** no accounts, no server-side storage; all math is client-side.
- **SEO:** every page is static HTML with `WebApplication` + `FAQPage` + `BreadcrumbList`
  structured data, a sitemap, and unique per-page computed results (anti-HCU gate in the
  variant route, `src/engine/registry.ts`).
- **Embed:** `/embed/<id>` + `public/embed.js` loader — partners drop in a calculator,
  each install is a backlink.
- **Compliance:** "not financial advice" disclaimers, privacy policy, no dark patterns,
  no subscriptions.

> For general information only — not financial, investment, or tax advice.
