# FinCalc — Lighthouse / Core Web Vitals Audit

**Unit 8 — CWV / Lighthouse audit + quick wins**
Date: 2026-06-14 · Auditor: automated (Lighthouse 13.4.0, headless Chrome)
Target: live preview deploy
`https://feat-fincalc-engine-and-site-calculator.winniringy.workers.dev`

## Method

Full Lighthouse runs (mobile emulation, default throttling) were executed against
the **live deploy** — option (a), the preferred path — for the home page (`/`) and
the mortgage page (`/mortgage-calculator`). A compact machine-readable summary of
both runs (scores, metrics, failing audits) is saved in
`docs/lighthouse/summary.json`. (Full ~800 KB raw reports were generated during the
audit but not committed to keep the repo lean; regenerate with the command below.)

A local `npm run build` was also done to inspect the static output
(`dist/_astro` bundle sizes, island deferral, ad-slot height reservation, font
strategy). Both data sources agree.

Reproduce:

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
npx lighthouse <url> --quiet \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new --no-sandbox" \
  --output=json --output-path=docs/lighthouse/<page>.json
```

## Scores

| Category        | Home | Mortgage | Target          |
| --------------- | ---- | -------- | --------------- |
| Performance     | 100  | 100      | high (CWV pass) |
| Accessibility   | 97   | 98       | ≥ 90            |
| Best Practices  | 96   | 96       | ≥ 90            |
| SEO             | 66\* | 66\*     | ≥ 90            |

\* **The SEO score is a preview-deploy artifact, not a code defect** — see Finding 1.

## Core Web Vitals vs PRD budget

| Metric                  | Home   | Mortgage | PRD budget | Verdict |
| ----------------------- | ------ | -------- | ---------- | ------- |
| LCP                     | 1.2 s  | 0.8 s    | < 2.5 s    | PASS    |
| CLS                     | 0      | 0        | < 0.1      | PASS    |
| TBT (INP proxy in lab)  | 0 ms   | 0 ms     | INP <200ms | PASS    |
| Max Potential FID       | 20 ms  | 30 ms    | —          | PASS    |
| FCP                     | 1.2 s  | 0.8 s    | —          | good    |
| Speed Index             | 2.5 s  | 2.3 s    | —          | good    |
| Time to Interactive     | 1.2 s  | 0.8 s    | —          | good    |
| Total transfer weight   | 6 KiB  | 114 KiB  | —          | good    |

INP cannot be measured in a lab run (it needs field/RUM data). **TBT = 0 ms** is
the standard lab proxy and is excellent; combined with the deferred-hydration
architecture (below) the INP < 200 ms budget is very likely met in the field.

**All three CWV thresholds pass with large headroom on both pages.** This is the
direct result of the architecture, confirmed in the built output:

- **Home page ships zero JavaScript.** `dist/index.html` is 4.2 KB, references one
  6.5 KB stylesheet plus a 355-byte inline `<style>`, and loads **no** `<script src>`
  / no React client. LCP is the hero `<h1>` (text), so it paints immediately.
- **Calculator island is deferred** — rendered with `client:idle`, confirmed as
  `<astro-island client="idle">` in the built mortgage HTML. The React runtime
  (~58 KB gz), Calculator (~12 KB gz) and uPlot (~24 KB gz) load only after the
  page is idle, so they never block LCP or inflate TBT.
- **Ad slots reserve fixed height** — `.ad-leaderboard { height: 90px }` and
  `.ad-rectangle { height: 250px }` are present as real boxes in the static HTML
  (`src/components/AdSlot.astro`), so swapping in real ad units later will not
  cause layout shift. Chart bodies also reserve height (`.chart-body { min-height: 280px }`).
  Result: CLS = 0.
- **System font stack, no web fonts** (`global.css`: `-apple-system, …`), so there
  is zero font-blocking and no FOUT/CLS from fonts.
- **No `<img>` tags anywhere** — illustrations are inline SVG with explicit
  `width`/`height` (charts) — so there is no unsized-image CLS risk.

## Findings (prioritized)

### 1. SEO 66 — `is-crawlable` fails: `x-robots-tag: noindex` (P0 for prod, but NOT a code bug)
The live preview responds with the header `x-robots-tag: noindex` (verified with
`curl -I`). Lighthouse's `is-crawlable` audit fails, and that single audit is what
drags SEO from ~92 down to 66. This header is injected by the `*.workers.dev`
**preview** environment, not by the app code (the app's `robots.txt` correctly
says `Allow: /`, and canonical/hreflang/OG/JSON-LD tags are all present and
correct). **Action:** confirm the production deploy does **not** send
`x-robots-tag: noindex`. Once the header is gone, SEO should score ~92+. No code
change in this repo is needed. *(Out of scope for this unit — flagged for the
deploy/infra owner.)*

### 2. Missing favicon → 404 console error (P2) — FIXED (quick win)
`/favicon.svg` and `/favicon.ico` both returned 404 on the live deploy. This
produced the "Failed to load resource: 404" console error that fails the
`errors-in-console` Best-Practices audit, and wasted one request per page.
**Fixed in this PR:** added `public/favicon.svg` and a
`<link rel="icon" type="image/svg+xml">` in `src/layouts/Base.astro`. Verified the
file is emitted to `dist/favicon.svg` and linked on both pages after build.

### 3. `heading-order` — `<h1>` jumps to `<h3>` on card grids (P3) — RECOMMENDATION, not applied
The home and category card grids render card titles as `<h3>` directly under the
page `<h1>`, skipping `<h2>` (`HomeView.astro`, `CategoryView.astro`, `404.astro`).
This fails the `heading-order` accessibility audit (Accessibility is still 97–98
because it is a minor item). **Not applied here** because the fix requires changing
the heading level in 3 components *and* updating the `.calc-card h3` CSS selectors
in `global.css` — that is a cross-cutting change, not a trivial one-liner, and the
task scope is explicitly "trivial, safe quick-wins only." Recommend a small
follow-up: change card titles to `<h2>` and update the matching CSS selectors, or
add a visually-hidden `<h2>` section heading above each grid.

### 4. `server-response-time` / `document-latency` ~600 ms (P3) — infra, not code
Lighthouse reports the root document took ~600 ms TTFB on the preview. For static
assets on Cloudflare this should be tens of ms once on the production CDN /
custom domain (preview workers.dev edge can be slower and cold). Re-measure on the
production domain; no code change needed.

### 5. `unused-javascript` on mortgage (P3) — acceptable
Flagged ~50% unused JS, dominated by the React runtime and uPlot that load on
`client:idle`. Because hydration is deferred, this does **not** affect LCP/TBT
(both are 0/optimal). Not worth a risky refactor. A future optional win would be
swapping uPlot/React for a lighter interaction layer, but that is a Phase 2+
architecture decision, out of scope.

## Quick wins applied in this PR

| Fix | File(s) | Effect |
| --- | ------- | ------ |
| Added favicon + `<link rel="icon">` | `public/favicon.svg`, `src/layouts/Base.astro` | Removes 404 console error (Best-Practices), eliminates a wasted request |

Nothing else needed a quick fix: ad slots already reserve height, the calculator
island is already deferred, there are no `<img>` to size, the embed iframe already
has `loading="lazy"`, and no web fonts are loaded (no `preconnect`/`dns-prefetch`
to add). The site is already at the performance ceiling.

## Recommendations (larger / out-of-scope items)

1. **(P0, infra)** Ensure production does not send `x-robots-tag: noindex` — this is
   the only thing standing between the site and a ~92+ SEO score.
2. **(P3, a11y)** Fix `heading-order` on card grids (Finding 3) in a dedicated small PR.
3. **(P3, infra)** Re-run Lighthouse against the production custom domain to capture
   real TTFB and to collect field INP via RUM once traffic exists.
4. **(monitoring)** Wire Lighthouse CI (or `unlighthouse`) into the deploy pipeline so
   the CWV budget is enforced on every PR, given CWV ≈ SEO traffic in this niche.

## Conclusion

Performance is **100/100 on both pages** and **all Core Web Vitals pass the PRD
budget with wide margins** (LCP 0.8–1.2 s, CLS 0, TBT 0 ms). The zero-JS home page,
deferred (`client:idle`) calculator island, height-reserved ad slots, and
system-font strategy are doing exactly what the PRD asked for. The only material
non-perf gap is the preview deploy's `noindex` header, which is an infrastructure
setting rather than a code defect.
