# 金融计算器站 · 产品设计文档（PRD）

> 版本 v0.1（draft） · 单人公司 / 一人全栈 · 主攻金融高 CPC 计算器 + 业界最强交互式可视化
> 本文档承接前序竞品分析结论：在「计算器 > 发票/简历 > PDF」的排序中，选定**金融垂直计算器**为首发产品。
> 阅读对象：你自己（产品 + 工程 + SEO + 变现一肩挑）。所以本文不写废话，每节都尽量落到可执行。

---

## 0. 一句话定位与核心赌注

**做"全网交互体验最好、图表最强、零暗黑模式"的金融计算器站，用一套 config-driven 计算引擎把单个计算器规模化成数千个高质量长尾页面，靠金融高 CPC 广告 + 可嵌入 widget 反链变现。**

三个押注（任意一个不成立都要重新评估）：

1. **可视化是差异化护城河**——现有头部（calculator.net、Omni Calculator、Bankrate 嵌入式）的图表都很弱。你的数据可视化专长能在这里做出代差，这是别人短期抄不走的体验壁垒，也是 linkable asset 的来源。
2. **交互式工具比纯文本答案更抗 AI Overviews**——纯"X 是多少"的信息型查询正在被 AI 直接吞掉，但"输入我的参数、实时算、看图"的交互工具 AI 难以完全替代。我们刻意把产品做成"工具"而非"文章"。
3. **config 化能把单人产能放大**——计算器的输入/公式/输出/图表/文案高度结构化，可以抽象成声明式 schema，一次建引擎、长期堆内容。这正是你数据平台的主场。

---

## 1. 问题、机会与目标用户

### 1.1 机会
- 金融类计算器查询是全网搜索量最大、CPC 最高的工具词簇之一（mortgage/loan/refinance/retirement/tax；mortgage 相关词美国月搜索量级达千万、refinance 类 CPC 可达数十美元）。
- 头部强但体验老旧；用户在 calculator.net / Bankrate 上得到的是"一个数字 + 一张丑表"，缺少可探索的交互与可视化。
- 金融 niche 的广告 RPM（$20–50）是娱乐类（$1–5）的 5–10 倍，少量流量即可产生可观收入。

### 1.2 目标用户（Persona）
| Persona | 场景 | 想要什么 | 我们怎么赢 |
|---|---|---|---|
| **购房者 Homebuyer** | 算月供、比较利率、看提前还款省多少 | 快速算 + 直观看"利息 vs 本金"如何随时间变化 | 交互式 amortization 图 + 提前还款情景对比 |
| **借款人 Borrower** | 车贷/个人贷月供与总利息 | 月供、总成本、不同期限对比 | 期限敏感性图 + 多方案并排 |
| **退休规划者 Planner** | 退休能攒多少、够不够花 | 复利增长投影、不确定性区间 | 复利增长堆叠图 + Monte Carlo 扇形图 |
| **嵌入方 Publisher** | 金融博客/中介想在自己页面放一个计算器 | 免费、好看、可嵌入的 widget | 提供 embed widget（=反链 + 品牌分发） |

### 1.3 目标（Goals）
- G1：用一套引擎在 6 个月内上线 ≥ 30 个高质量核心计算器 + ≥ 数百个长尾变体页，且**每页有独特计算结果与图表**（防 HCU）。
- G2：核心计算器的交互/可视化体验在主观评测中明显优于 calculator.net / Omni。
- G3：建立**至少 2 个非 SEO 获客渠道**（embed widget 分发、邮件列表），降低对 Google 自然流量的单点依赖。

### 1.4 非目标（Non-Goals，明确不做）
- ❌ 不做账号体系 / 登录（MVP 阶段计算器无需登录，降低摩擦、保护隐私、省成本）。
- ❌ 不做服务端存储用户财务数据（全部 client-side 计算，数据不出浏览器——既是隐私卖点也是合规护身符）。
- ❌ 不做暗黑模式订阅（不抄 Zety 那套"做完才发现要付费"，反过来把"真免费 + 透明"当卖点）。
- ❌ 不提供个性化投资建议（合规红线：我们给的是计算工具与通用信息，不是 financial advice；页面需有 disclaimer）。

---

## 2. 成功指标（Metrics）

**North Star：月度计算完成次数（Calculations Completed / month）**——它同时代表流量规模、工具被真正使用（而非跳出）、以及广告/embed 价值。

支撑指标：
- 自然搜索：indexed pages、ranking keywords、organic sessions、点击率（关注 AI Overviews 对 CTR 的侵蚀）。
- 参与度：计算完成率（进入页 → 完成一次计算）、图表交互率、平均停留时长（直接影响广告 RPM）。
- 变现：Ad RPM、月广告收入、embed widget 安装数（=反链数）。
- 技术健康：Core Web Vitals（LCP < 2.5s / INP < 200ms / CLS < 0.1，**CWV 直接影响 SEO 排名**）。
- 韧性：直接访问占比、邮件订阅数、品牌词搜索量（衡量"去 Google 依赖度"）。

---

## 3. 产品范围与分期

| 阶段 | 时间 | 交付 | 通过门槛（gate） |
|---|---|---|---|
| **Phase 0：引擎 + 旗舰** | 0–6 周 | config-driven 计算引擎 + 1 个旗舰（Mortgage）做到极致 + 站点骨架 + CWV 达标 | Mortgage 页体验主观胜过 calculator.net；CWV 全绿 |
| **Phase 1：核心矩阵** | 6 周–3 月 | 30 个核心金融计算器 + 结构化数据 + AdSense 接入 + embed widget | 自然流量起量、indexed、首批长尾词上首页 |
| **Phase 2：programmatic 规模化** | 3–9 月 | 数据 × 模板批量生成长尾变体页（地理/参数/对比）+ linkable data 报告 | 流量达 Mediavine 门槛（约 5 万 sessions/月）→ 切换广告网络 |
| **Phase 3：护城河** | 9 月+ | widget 分发网络 + 邮件列表 + 可选 API/premium | 非 SEO 渠道占比 > 20% |

---

## 4. 信息架构 & SEO 架构（这是流量命脉）

### 4.1 URL 结构（决定 programmatic SEO 上限）
```
/                              首页（精选计算器 + 搜索）
/mortgage-calculator           旗舰计算器（核心词，单独顶级路径）
/loan-calculator
/retirement-calculator
/calculators/<category>/       分类 hub 页（聚合 + 内链枢纽）
/mortgage-calculator/<variant> 长尾变体（如 /by-state/california, /15-year, /with-extra-payments）
/compare/<a>-vs-<b>            对比页（高意图，如 15-year-vs-30-year-mortgage）
/guides/<slug>                 配套指南（GEO/被引用素材，也做内链）
/<locale>/...                  本地化（见 4.4）
/embed/<calculator-id>         可嵌入 widget 入口
```

### 4.2 页面类型（Page Types）
1. **Calculator Page（核心）**：首屏即工具，下方是结果可视化、解释、FAQ、相关计算器内链。
2. **Category Hub**：聚合某类计算器，做内链枢纽与品类词排名。
3. **Comparison Page**：`X vs Y`（如 15 年 vs 30 年贷款），高商业意图、易出图、易被引用。
4. **Guide / Data Report**：用于 GEO（被 AI/媒体引用）与建反链的 linkable asset。

### 4.3 防 HCU（薄内容惩罚）的硬规则 ⚠️
programmatic SEO 的死法就是"千页同模板只换变量"。每个生成页**必须满足至少 2 条**：
- 有**该页独有的计算结果/数据表/图表**（不是仅替换标题里的城市名）。
- 有针对该变体的**实质性独特文案**（该州税率说明、该期限的利弊、该利率下的实际数字解读）。
- 有**该变体特有的内链与 FAQ**。
- 规则：不能为铺页而铺页——**没有真实搜索需求或无法产出独特价值的变体，就不生成**。宁可 500 个强页，不要 50,000 个弱页。

### 4.4 本地化架构（差异化机会）
- 子目录策略 `/<locale>/`（如 `/zh/`, `/en-gb/`）+ 正确 `hreflang`。
- 金融计算高度依赖**地域规则**（税率、利率惯例、货币、术语），本地化不是翻译而是**规则适配**——这恰好是头部英文站的薄弱处。中文市场、各国税制是被服务不足的子赛道。

---

## 5. 核心架构：Config-Driven 计算引擎（你的主场）

把"一个计算器"抽象成**声明式 schema**，引擎负责渲染输入、跑计算、出图、生成 SEO 内容。这样新增计算器 = 写一份 config，而非写一个页面。

### 5.1 Calculator 定义 schema（TypeScript 示意）
```ts
interface CalculatorDef {
  id: string;                 // "mortgage"
  slug: string;               // "mortgage-calculator"
  category: "mortgage" | "loan" | "retirement" | "tax" | "investment";
  locales: LocaleConfig[];    // 各地区规则适配

  inputs: InputField[];       // 声明式输入
  compute: (v: Inputs) => Outputs;   // 纯函数，确定性、可单测
  outputs: OutputField[];     // 结果字段 + 格式化

  visualizations: VizSpec[];  // 该计算器配的图（差异化核心）
  content: ContentBlocks;     // SEO 文案、解释、FAQ（支持模板变量）
  related: string[];          // 相关计算器 id（内链）
  schemaOrg: StructuredData;  // 结构化数据
}

interface InputField {
  id: string; label: string;
  type: "number" | "currency" | "percent" | "select" | "slider" | "toggle";
  default: number | string;
  min?: number; max?: number; step?: number; unit?: string;
  validate?: (v) => string | null;   // 内联校验
  presets?: Preset[];                 // 用于生成长尾变体页
}

interface VizSpec {
  type: "amortization" | "breakdown_donut" | "growth_area"
      | "sensitivity_line" | "scenario_compare" | "monte_carlo_fan"
      | "tax_bracket_bar";
  dataMapping: (outputs: Outputs) => ChartData;
  interactive: boolean;       // hover/拖拽/切换情景
}
```

### 5.2 计算引擎原则
- **纯函数 + 确定性 + 100% 单元测试覆盖**：金融计算错一位小数就是信任崩塌。每个 `compute` 配一组黄金测试用例（含边界：0 利率、超长期限、负数防御）。
- **全部 client-side 运行**：数据不出浏览器 → 隐私卖点 + 零服务端算力成本 → 单人可承受海量免费用户。
- **金额用整数分（cents）运算**避免浮点误差，展示层再格式化。
- **引擎与 UI 解耦**：同一份 compute 既驱动网页，也驱动 embed widget 与（未来）API。

### 5.3 关键金融公式（内置、需测试）
- **等额本息月供**：`M = P · r(1+r)^n / [(1+r)^n − 1]`，其中 `P`=本金、`r`=月利率（年利率/12）、`n`=总期数（年×12）。边界：`r=0` 时退化为 `M = P/n`。
- **摊还（amortization）**：每期 `利息 = 余额 · r`，`本金 = M − 利息`，`余额 −= 本金`，迭代至 0。
- **复利终值（退休/投资，含定投）**：`FV = P(1+r)^n + PMT · [((1+r)^n − 1)/r]`。
- **税率分段**：按 bracket 累进分段累加（本地化为各地区税表）。

---

## 6. 差异化核心：可视化规格（Visualization Spec）

这是产品的灵魂。每类计算器配什么图，定义如下。**性能优先**：图表必须轻、不拖累 CWV（见 §8）。

| 计算器 | 必备可视化 | 交互 | 为什么赢 |
|---|---|---|---|
| **Mortgage** | ① Amortization 堆叠面积图（本金 vs 利息随时间）② 月供构成 donut ③ 提前还款情景对比 ④ 利率敏感性曲线 | 拖动利率/期限实时重绘；切换"含/不含提前还款" | 头部只给一张静态摊还表；我们让用户"看见"利息如何被时间吃掉 |
| **Loan** | ① 总成本构成 ② 期限对比（36/48/60 月并排）③ 敏感性 | 滑块拖期限即时对比 | "短期省利息但月供高"被可视化，决策更直观 |
| **Retirement / Investment** | ① 复利增长堆叠面积（本金 vs 收益）② Monte Carlo 扇形图（不确定区间）③ 提取可持续性 | 调整年化收益看扇形变化 | 把"不确定性"可视化，是几乎没人做好的点，天然 linkable |
| **Tax** | ① 分段 bracket 堆叠条 ② 边际 vs 有效税率对比 | 切换 filing status / 收入档 | "为什么我的有效税率低于税档"一图说清 |

可视化技术取向：
- 鉴于你是可视化专家，建议**自绘 SVG/Canvas 或用极轻量库**（如 uPlot / visx / 自研 D3 子集），**避免重型图表库拖垮 LCP/INP**。这正好把"别人用 Chart.js 套个默认样式"的差距拉开成代差。
- 所有图必须：移动端可用、可 hover/tap 取值、`prefers-reduced-motion` 友好、有可访问的数据表 fallback（a11y + SEO）。

---

## 7. 旗舰样例规格：Mortgage Calculator（Phase 0 做到极致）

**输入**：房价/贷款额、首付、年利率、贷款期限（15/20/30 年 + 自定义）、起始日期、房产税、保险、HOA、提前还款（每月额外/一次性）。

**输出**：月供（含税险拆分）、总利息、总还款、还清日期、提前还款节省的利息与缩短的月数。

**可视化**：§6 中 Mortgage 四图全上。

**页面结构（首屏即工具）**：
1. 首屏：计算器输入 + 即时结果（**绝不把广告放在工具上方**）。
2. 结果区：四张交互图。
3. 解释区：本页参数下的数字解读（独特文案）。
4. FAQ（结构化数据）。
5. 相关计算器内链 + 该计算器的长尾变体入口（15-year / by-state / with-extra-payments）。
6. embed widget 按钮（"把这个计算器放到你的网站"）。

**边界用例**：0% 利率、首付 ≥ 房价、利率/期限极端值、提前还款 > 余额——全部需优雅处理并有测试。

---

## 8. UX / 性能 / 可访问性原则

- **首屏即用**：进页 0 操作即可看到默认计算结果，输入即时重算（debounce）。
- **Mobile-first**：金融查询移动端占比高；滑块/数字键盘优化；图表触屏可用。
- **性能预算（硬指标，因为 = SEO）**：LCP < 2.5s、INP < 200ms、CLS < 0.1。手段：SSG/预渲染、计算器作为 island 局部 hydrate、图表懒加载、**给广告位预留固定高度防 CLS**、字体 `font-display: swap`、零阻塞第三方脚本。
- **可访问性**：键盘可达、ARIA 标注、对比度达标、图表有数据表 fallback。
- **反暗黑模式（品牌资产）**：无强制注册、无隐藏付费墙、无静默续费；如未来收费，必须明确同意 + 扣费前提醒 + 一键取消（见 §10 合规）。

---

## 9. 技术架构

| 关注点 | 选型与理由 |
|---|---|
| **渲染框架** | 首选 **Astro**（islands 架构，默认零 JS，只 hydrate 计算器岛 → CWV 极佳 → SEO 极佳）；备选 Next.js（RSC + client islands）。计算器站 = 大量静态内容 + 局部交互，Astro 几乎是为此而生。 |
| **计算逻辑** | 纯 TypeScript 纯函数，client-side 运行，与渲染解耦，复用到 widget/API。 |
| **图表** | 轻量自绘 SVG/Canvas（你的强项），避免重库。 |
| **页面生成** | 构建期从**数据源（calculator config × locale × preset 矩阵）静态生成**长尾页；增量再生（ISR/按需构建）应对规模。 |
| **托管** | 静态托管 + CDN（Cloudflare Pages / Netlify / Vercel），**零服务端计算成本**。 |
| **数据层** | calculator config + 地域规则表 + 内容片段，存为结构化数据（你数据平台的舒适区）；programmatic 页由此矩阵生成。 |
| **i18n** | 子目录 + hreflang + 地域规则适配层。 |
| **分析** | 隐私友好分析（Plausible/自建）+ 自定义事件（计算完成、图表交互、embed 安装）——用你的报表引擎做内部 dashboard。 |

> 注：框架与图表方案是带理由的**推荐**，不是教条。你比我更懂自己的栈；上面真正硬的约束只有一条——**任何选型都不能牺牲 CWV，因为 CWV 在这个赛道直接等于流量**。

---

## 10. 变现设计

### 10.1 主模型：展示广告（金融高 RPM）
- **广告位策略**：sticky 侧栏（桌面）、结果区下方 in-content、文末——**永远不在计算器工具上方**（工具必须秒用）。所有广告容器**预留固定高度防 CLS**。
- **广告网络进阶**：起步 Google AdSense → 流量达标后切 **Mediavine（约 5 万 sessions/月门槛）** 或 **Raptive/AdThrive（约 10 万 pageviews/月）**，金融 niche RPM 可达 $20–50。
- **单位经济示意**：50 万 pageviews/月 × $15 RPM ≈ **$7,500/月**；金融垂直 RPM 拉到 $30 则翻倍。少量优质流量即可盈利，这是选金融 niche 的全部理由。

### 10.2 增长 + 反链：可嵌入 widget
- 提供 embed `<script>` / iframe，让金融博客/中介免费放计算器 → 每个安装 = 一条 dofollow 反链 + 品牌曝光（复刻 MortgageCalculator.org 模式）。这是 Phase 1 就要做的增长飞轮。

### 10.3 可选后期：affiliate / lead-gen / API / premium
- mortgage/refinance lead-gen 单价极高，但合规重，谨慎且需 disclaimer。
- 给开发者的计算 API（复用引擎），或去广告/高级图表的 premium——**仅当流量验证后**再加，且若做订阅必须"干净订阅"。

### 10.4 合规红线 ⚠️（来自竞品分析，务必遵守）
- **不提供个性化投资/财务建议**；页面挂"仅供参考、非财务建议"disclaimer。
- **AdSense 政策**：避免薄内容/自动生成页触发拒登；隐私政策 + cookie 同意（默认最小化）齐全。
- **若未来做订阅**：ROSCA + 各州自动续费法 + Visa/Mastercard negative-option 规则仍在收紧（FTC Click-to-Cancel 虽被撤销但正重启立法）。必须明确同意、扣费前提醒、一键取消，否则面临高拒付率与 MATCH 黑名单、丧失支付通道。**MVP 不碰订阅可完全回避此风险。**

---

## 11. SEO & 内容 & GEO 策略

- **关键词分层**：核心词（mortgage calculator）走旗舰独立路径；商业意图词（refinance、15-vs-30）做对比页；长尾（by-state、特定利率/额度）走 programmatic。
- **结构化数据**：`WebApplication`/`SoftwareApplication` + `FAQPage` + `BreadcrumbList`，提升富结果与被引用概率。
- **内链**：category hub 做枢纽，calculator ↔ variant ↔ guide 三向互链。
- **反链**：embed widget（规模化）+ data report（如"各州真实月供负担报告"，可零外联自然获链，复刻 StandOut CV 的 linkable asset 打法）。
- **GEO / 抗 AI Overviews**（结构性风险，必须主动设计）：
  - 把产品做成**交互工具**（需用户输入参数）而非纯文本答案——AI 难完全替代。
  - 内容结构化（清晰直答 + 数据表 + FAQ），即便被 AI 引用，我们也是被引来源。
  - 主动建**非 SEO 渠道**（邮件、社区、widget 分发、品牌词），把"全靠 Google"降为"Google 之一"。

---

## 12. 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| **AI Overviews 吞噬信息型流量** | 高（CTR 结构性下滑） | 工具化而非文章化；建非 SEO 渠道；监控含 AIO 查询的 CTR，必要时把重心移向"需复杂输入"的页面 |
| **HCU 薄内容惩罚** | 高（programmatic 翻车） | 严守 §4.3 硬规则：每页独特数据/图/文案；宁少勿滥 |
| **AdSense 拒登/封号** | 中 | 实质内容 + 合规隐私政策；流量起来后转 Mediavine 降依赖 |
| **单一 SEO 渠道依赖** | 高 | Phase 3 强制建 embed 分发 + 邮件，目标非 SEO 占比 > 20% |
| **头部正面竞争** | 中 | 不抢核心词正面战场，靠可视化体验 + 长尾 + 本地化 + widget 侧翼包抄 |
| **单人产能瓶颈** | 中 | config 化把内容生产工程化；图表组件化复用 |

---

## 13. 待定决策（需你拍板）

1. **首发地域 / 语言**：先做英文（流量大、RPM 高、竞争惨）还是中文（你熟、竞争小、RPM 低）？建议英文金融为主战场、中文作差异化第二战线。
2. **首发垂直顺序**：mortgage → loan → retirement → tax 的优先级是否认可？（按搜索量 × CPC × 出图潜力排的）
3. **图表自绘 vs 轻量库**：你倾向哪种？影响 Phase 0 工期。
4. **品牌名 / 域名**：计算器站直接访问占比高、域名即品牌资产（参考 PDF.ai 花 $10K 买域名），是否预算购入精确匹配/强记忆域名？
5. **是否一开始就埋 embed widget 架构**：建议是（引擎解耦后边际成本低，且是反链飞轮起点）。

---

## 14. 验收 / 评审清单（Phase 0 Definition of Done）

- [ ] 计算引擎抽象完成，Mortgage compute 100% 单测覆盖含边界用例
- [ ] Mortgage 页四图交互可用、移动端可用、a11y fallback 完整
- [ ] CWV 全绿（LCP/INP/CLS 达标），Lighthouse SEO 100
- [ ] 结构化数据校验通过（Rich Results Test）
- [ ] 隐私政策 + disclaimer + cookie 同意就位
- [ ] embed widget 原型可在外站运行
- [ ] 主观对比：Mortgage 页体验明显优于 calculator.net / Omni（自评 + 找 3 个真实用户盲测）

---

*下一步可基于本 PRD 直接产出：① calculator config 的完整 TypeScript 类型 + Mortgage 的参考实现；② 站点 IA 的完整 URL/页面清单；③ Phase 0 的逐周开发计划。需要哪个先做，告诉我。*
