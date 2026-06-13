# 金融计算器站 · 技术方案与开发路径（Tech Plan）

> 配套文档：[prd.md](./prd.md) · 版本 v1.0 · 落地负责人：一人全栈
> 本文把 PRD 的产品赌注翻译成可执行的技术架构、目录结构、关键决策与逐阶段开发路径。

---

## 0. 决策摘要（已拍板）

| 决策点 | 选择 | 依据 |
|---|---|---|
| 渲染框架 | **Astro islands**（保留 Cloudflare 托管） | PRD §9 首选；默认零 JS + SSG + 只 hydrate 计算器岛 → CWV 上限最高，而 CWV=流量 |
| 图表方案 | **uPlot + 轻量手绘 SVG**（不上 Chart.js） | uPlot 扛时间序列（Canvas、~40KB、千点不卡）；donut/分段条用零依赖手绘 SVG（visx 不支持 React 19，且 SVG 更轻、可 SSR） |
| 计算逻辑 | 纯 TS 纯函数、整数分运算、client-side、100% 单测 | PRD §5.2；信任根基 + 零服务端算力 |
| 工程形态 | **单一 Astro 应用 + 内部纯 TS 模块边界**（非 pnpm 多包） | 单人自主推进降工具风险；`src/engine` 仍是框架无关、可被 embed/未来 API 复用，decoupling 不丢 |
| 托管 | Cloudflare（`@astrojs/cloudflare` 适配器） | 保留现有 CF 投入；静态托管 + CDN + 边缘函数 |

> 工程形态相对 PRD §9「monorepo」的务实偏离：用目录边界代替多包发布。`src/engine` 不依赖任何渲染框架，embed widget 通过独立 Vite lib 构建复用同一份引擎，达成 PRD §5.2「引擎与 UI 解耦」的实质目标，且省去 workspace 工具开销。若后续要对外发布引擎为 npm 包，可零摩擦抽包。

---

## 1. 现状与冲突（为什么要调整模板）

初始仓库是 Cloudflare 官方 **Vite-React SPA 模板**：`wrangler.json` 的 `not_found_handling: "single-page-application"` + `main.tsx` 的 `createRoot().render()` = 纯客户端渲染。这与 PRD 命脉直接冲突：

- 纯 SPA 只有一个 HTML 壳，**长尾页无独立可索引内容** → programmatic SEO（PRD §4）无从谈起。
- 首屏等 JS 下载执行才出内容 → **LCP 天然差**，违反 PRD §8 性能预算。
- 全站强制整个 React 运行时 → 做不到 PRD §8「默认零 JS、只 hydrate 计算器岛」。

仓库当时只有模板样板、无业务代码，故零成本切换到 Astro，**只换渲染层，保留 Cloudflare 托管**。

---

## 2. 系统架构

```
┌──────────────────────── Astro 应用 (output: static, 少量 hybrid) ────────────────────┐
│  pages/  —— SSG 出每页独立静态 HTML（核心词页 / 长尾变体 / 对比页 / hub / 指南）        │
│    └─ 文案 / FAQ / 内链 / 结构化数据：零 JS 纯静态                                      │
│    └─ <Calculator> 岛：client:visible / client:idle 才 hydrate（React）                │
│         └─ 图表岛：uPlot (面积/线/扇形) · visx (donut/分段条) · <table> SSR fallback    │
│                                                                                       │
│  src/engine/   ←──── 纯 TS 纯函数引擎（护城河）：types · money(cents) · finance · registry│
│  src/calculators/ ←─ 每个计算器一份声明式 config（inputs/compute/outputs/viz/content）  │
│  src/charts/   ←──── React 图表组件（按岛加载）                                          │
│  src/embed/    ←──── 独立 Vite lib 构建的 widget，复用同一份 engine                      │
└───────────────────────────── @astrojs/cloudflare → Cloudflare Workers + CDN ──────────┘
```

数据流：`config.inputs` → 渲染输入控件 → 用户输入（debounce）→ `config.compute(values)`（纯函数，整数分）→ `outputs` → 格式化展示 + `viz.dataMapping(outputs)` → 图表 + 数据表 fallback。同一条链路驱动网页与 embed。

---

## 3. 目录结构

```
calculator/
├─ docs/                     prd.md · tech-plan.md
├─ astro.config.mjs          Astro + cloudflare + react + sitemap
├─ wrangler.json             指向 Astro 构建产物
├─ vitest.config.ts          引擎单测
├─ vite.embed.config.ts      embed widget lib 构建
├─ src/
│  ├─ engine/                ★ 框架无关核心
│  │  ├─ types.ts            CalculatorDef / InputField / VizSpec / Outputs …
│  │  ├─ money.ts            整数分运算 + 格式化
│  │  ├─ finance.ts          月供 / 摊还 / 复利终值 / 税率分段（纯函数）
│  │  ├─ format.ts           货币 / 百分比 / 期限本地化格式
│  │  ├─ registry.ts         计算器注册表 + 按 slug/category 查询
│  │  └─ index.ts
│  ├─ calculators/           每个计算器一份 config
│  │  ├─ mortgage.ts  loan.ts  retirement.ts  tax.ts
│  │  └─ index.ts            汇总注册
│  ├─ charts/                React 图表岛 + 数据表 fallback
│  ├─ components/            Calculator.tsx（输入+即时计算+图表编排）· 输入控件 · SEO 组件
│  ├─ content/               文案片段 · 长尾 preset · locale 规则表
│  ├─ layouts/  Base.astro
│  ├─ pages/                 见 §4 路由
│  └─ embed/  entry.tsx      widget 入口
├─ test/                     引擎黄金用例
└─ public/                   静态资源 · robots.txt
```

---

## 4. 路由与 SEO 架构（对齐 PRD §4）

| 路由 | Astro 文件 | 生成方式 |
|---|---|---|
| `/` 首页 | `pages/index.astro` | 静态，精选计算器 + 搜索 |
| `/<slug>` 核心计算器 | `pages/[slug].astro` | `getStaticPaths` 从 registry 出每个核心计算器 |
| `/calculators/<category>` hub | `pages/calculators/[category].astro` | 按 category 聚合，内链枢纽 |
| `/<slug>/<variant>` 长尾 | `pages/[slug]/[variant].astro` | config × preset 矩阵，**构建期 HCU gate 守门** |
| `/compare/<a>-vs-<b>` 对比 | `pages/compare/[pair].astro` | 声明式对比对 |
| `/guides/<slug>` 指南 | `pages/guides/[slug].astro` | 内容集合 |
| `/embed/<id>` widget | `pages/embed/[id].astro` | 极简外壳，加载 widget bundle |
| `/<locale>/…` 本地化 | i18n 路由 | 子目录 + hreflang + locale 规则适配 |

**结构化数据**：每页注入 `WebApplication`/`SoftwareApplication` + `FAQPage` + `BreadcrumbList`。`@astrojs/sitemap` 出 sitemap，`robots.txt` + hreflang。

**防 HCU 构建期硬 gate（PRD §4.3）**：`pages/[slug]/[variant].astro` 的 `getStaticPaths` 内对每个候选变体跑 `qualifies(variant)` —— 必须满足「独有计算结果/数据表」+「实质独特文案」中至少 2 条，否则**不产出该页**。宁少勿滥写进代码，不靠自觉。

---

## 5. 计算引擎（护城河，PRD §5）

- **类型**：落地 PRD §5.1 的 `CalculatorDef`，`compute: (Inputs) => Outputs` 为纯函数。
- **整数分运算**：所有金额以 cents（整数）参与运算，避免浮点误差；展示层 `format.ts` 再转货币串。
- **内置公式（`finance.ts`，全部单测）**：
  - 等额本息月供 `M = P·r(1+r)^n / ((1+r)^n − 1)`，`r=0` 退化为 `P/n`。
  - 摊还迭代：每期 `利息=余额·r`，`本金=M−利息`，`余额−=本金`，末期吸收舍入残差归零。
  - 复利终值含定投 `FV = P(1+r)^n + PMT·((1+r)^n − 1)/r`。
  - 税率分段累进累加（locale 税表驱动）。
- **黄金用例 + 100% 覆盖**（Vitest）：含边界——0 利率、首付≥房价、提前还款>余额、极端期限、负数防御。金融算错一位小数即信任崩塌。

---

## 6. 图表层（差异化灵魂，PRD §6）

| 图 | 库 | 计算器 |
|---|---|---|
| 摊还堆叠面积（本金 vs 利息） | uPlot | Mortgage / Loan |
| 利率/期限敏感性曲线 | uPlot | Mortgage / Loan |
| 复利增长堆叠面积 | uPlot | Retirement |
| Monte Carlo 扇形（不确定区间） | uPlot (bands) | Retirement |
| 月供构成 donut | 手绘 SVG (arc) | Mortgage |
| 税率分段堆叠条 | 手绘 SVG (rect) | Tax |
| 提前还款情景对比 | uPlot 多序列 | Mortgage |

规则（全部强制）：图表组件按岛 `client:visible` 加载；每张图配**服务端渲染 `<table>` fallback**（a11y + SEO + 无 JS 也有数据）；`prefers-reduced-motion` 友好；移动端 tap 取值；广告位/图表容器**预留固定高度防 CLS**。

---

## 7. 性能 / 可访问性 / 合规（PRD §8 §10.4）

- **CWV 硬预算**：LCP<2.5s、INP<200ms、CLS<0.1。手段：SSG、岛局部 hydrate、图表懒加载、`font-display:swap`、广告位固定高度、零阻塞第三方脚本。
- **首屏即用**：默认参数即出结果与图，输入 debounce 即时重算。
- **a11y**：键盘可达、ARIA、对比度达标、图表 `<table>` fallback。
- **反暗黑模式**：无强制注册、无隐藏付费墙；隐私政策 + 「仅供参考，非财务建议」disclaimer + 最小化 cookie 同意。**MVP 不碰订阅**，回避 ROSCA/自动续费合规风险。
- **数据不出浏览器**：全部 client-side 计算 = 隐私卖点 + 零服务端成本。

---

## 8. 变现接入（PRD §10）

- 广告位策略：sticky 侧栏（桌面）+ 结果区下 in-content + 文末；**永不在工具上方**；容器固定高度防 CLS。起步 AdSense slot 占位组件，达标后切 Mediavine/Raptive。
- embed widget：`/embed/<id>` + loader `<script>`/iframe，复用引擎 → 每次安装 = 一条 dofollow 反链。Phase 1 上线。

---

## 9. 开发路径（对齐 PRD 分期；本仓库一次性把各 phase 的能力骨架打通）

> 自主批量开发策略：不是按 9 个月日历推进，而是把 **各 phase 的核心能力**在代码层一次打通成可运行、可部署、可扩展的底座，后续堆 config 即堆内容。

**Phase 0 — 引擎 + Mortgage 旗舰（已做能力）**
- monorepo→单应用脚手架：Astro + `@astrojs/cloudflare` + React 岛 + Vitest + sitemap。
- `src/engine`：类型 + finance 公式 + 整数分 + registry，黄金用例 100% 覆盖含边界。
- Mortgage config：完整 inputs/compute/outputs/viz/content。
- `<Calculator>` 岛：首屏即用、debounce 即时重算、内联校验。
- Mortgage 四图（摊还面积 / donut / 提前还款对比 / 利率敏感性）+ 数据表 fallback。
- 页面组装：解释区独特文案 + FAQ 结构化 + 内链 + disclaimer + 隐私/cookie。

**Phase 1 — 核心矩阵（能力）**
- 扩 Loan / Retirement / Tax 三个计算器 config + 各自图表 + 单测。
- category hub 页 + 三向内链 + 全站结构化数据 + sitemap。
- AdSense 广告位占位组件（固定高度）。
- embed widget 原型（独立 lib 构建，复用引擎）。

**Phase 2 — programmatic 规模化（能力）**
- `pages/[slug]/[variant].astro` + preset 矩阵 + **HCU gate**，演示从 config 批量出独特长尾页。
- `pages/compare/[pair].astro` 对比页。
- locale 规则适配层骨架 + hreflang。

**Phase 3 — 护城河（能力骨架）**
- embed 分发入口 + 邮件订阅占位 + 内部事件埋点（计算完成/图表交互/embed 安装）接口。
- 隐私友好分析对接点（Plausible/CF Web Analytics）。

---

## 10. 质量门槛（CI 与验收）

- `npm test`：引擎黄金用例必须全绿、关键 compute 100% 覆盖。
- `npm run build`：Astro 构建通过、类型检查通过。
- Lighthouse：SEO 100、CWV 全绿（部署后核验）。
- 结构化数据：Rich Results Test 通过。
- Phase 0 DoD（PRD §14）逐项核对。

---

## 11. 后续可扩展点

- 引擎抽成独立 npm 包对外发布（当前已是纯 TS、零框架依赖，可零摩擦抽离）。
- 计算 API（复用引擎跑在 CF Worker 边缘）。
- 更多 locale 税表/利率惯例适配。
- data report linkable asset 生成器（如「各州真实月供负担报告」）。
