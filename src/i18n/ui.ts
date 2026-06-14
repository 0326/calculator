// UI chrome strings per locale. Brand renders as "财富计算器" in Chinese (FinCalc elsewhere).
// Keep this small and complete for all locales so the layout works the moment a locale is added.

import type { Locale } from "./config";

export interface UIStrings {
	brand: string;
	tagline: string;
	navMortgage: string;
	navLoan: string;
	navRetirement: string;
	navTax: string;
	home: string;
	privacy: string;
	allCalculators: string;
	footer: string;
	// page chrome
	howItWorks: string;
	popularVariants: string;
	faqHeading: string;
	relatedHeading: string;
	embedHeading: string;
	embedDesc: string;
	viewDataTable: string;
	searchPlaceholder: string;
	searchEmpty: string;
	language: string;
	heroTitle: string;
	heroLede: string;
}

const EN: UIStrings = {
	brand: "FinCalc",
	tagline: "Free financial calculators — computed privately in your browser.",
	navMortgage: "Mortgage",
	navLoan: "Loan",
	navRetirement: "Retirement",
	navTax: "Tax",
	home: "Home",
	privacy: "Privacy",
	allCalculators: "All calculators",
	footer:
		"Free financial calculators. All calculations run in your browser — your data never leaves your device. For general information only, not financial, investment, or tax advice.",
	howItWorks: "How this works",
	popularVariants: "Popular variants",
	faqHeading: "Frequently asked questions",
	relatedHeading: "Related calculators",
	embedHeading: "Put this calculator on your site",
	embedDesc: "Free, responsive, and always up to date. Copy the embed code:",
	viewDataTable: "View data table",
	searchPlaceholder: "Search calculators…",
	searchEmpty: "No calculators match your search.",
	language: "Language",
	heroTitle: "Financial calculators that actually show you the math",
	heroLede:
		"Interactive, beautifully charted, and completely private — every number is computed in your browser and never sent anywhere. No sign-up, no paywall, no dark patterns.",
};

const ZH: UIStrings = {
	brand: "财富计算器",
	tagline: "免费金融计算器——全部在你的浏览器本地计算。",
	navMortgage: "房贷",
	navLoan: "贷款",
	navRetirement: "退休",
	navTax: "个税",
	home: "首页",
	privacy: "隐私政策",
	allCalculators: "全部计算器",
	footer:
		"免费金融计算器。所有计算都在你的浏览器中完成——你的数据不会离开你的设备。仅供参考，不构成金融、投资或税务建议。",
	howItWorks: "工作原理",
	popularVariants: "热门变体",
	faqHeading: "常见问题",
	relatedHeading: "相关计算器",
	embedHeading: "把这个计算器放到你的网站",
	embedDesc: "免费、自适应、始终最新。复制以下嵌入代码：",
	viewDataTable: "查看数据表",
	searchPlaceholder: "搜索计算器……",
	searchEmpty: "没有匹配的计算器。",
	language: "语言",
	heroTitle: "真正让你看见计算过程的金融计算器",
	heroLede:
		"交互式、图表精美、完全私密——每个数字都在你的浏览器中计算，绝不外传。无需注册、没有付费墙、没有暗黑模式。",
};

// UK: English copy, GBP currency handled by formatter. Tweak terminology lightly.
const EN_GB: UIStrings = {
	...EN,
	brand: "FinCalc",
	tagline: "Free financial calculators — computed privately in your browser.",
	navMortgage: "Mortgage",
};

// Canada: English copy, CAD currency handled by formatter.
const EN_CA: UIStrings = { ...EN };

export const UI: Record<Locale, UIStrings> = {
	en: EN,
	zh: ZH,
	"en-gb": EN_GB,
	"en-ca": EN_CA,
};

export function ui(locale: Locale): UIStrings {
	return UI[locale] ?? EN;
}
