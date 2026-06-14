// Chinese (zh-CN) calculator content. Seeded with the Mortgage flagship to prove the pipeline;
// Worker "zh content + China IIT" expands to loan/retirement/tax and adds China income-tax brackets.

import type { LocaleContent } from "./index";

export const ZH: LocaleContent = {
	mortgage: {
		title: "房贷计算器",
		description:
			"估算每月房贷还款，查看本金与利息如何随时间变化，并了解额外还款能为你省下多少——全部在你的浏览器中计算。",
		inputs: {
			homePrice: "房价",
			downPayment: "首付",
			annualRate: "年利率",
			termYears: "贷款期限",
			propertyTaxYearly: "房产税（每年）",
			insuranceYearly: "房屋保险（每年）",
			hoaMonthly: "物业费（每月）",
			extraMonthly: "每月额外还款",
			extraOnce: "一次性额外还款",
		},
		outputs: {
			monthlyPayment: "每月还款",
			principalInterest: "本金和利息",
			monthlyTax: "房产税",
			monthlyInsurance: "保险",
			loanAmount: "贷款金额",
			totalInterest: "总利息",
			totalCost: "还款总额",
			payoffTime: "还清时间",
			interestSaved: "节省利息（额外还款）",
			monthsSaved: "缩短时间（额外还款）",
		},
		intro:
			"输入你的数字，每月还款、摊还和还清日期会即时更新。所有计算都在你的浏览器本地完成，不会发送到任何服务器。",
		explainTemplate:
			"在 {loanAmount} 的贷款下，你每月的本金和利息为 {principalInterest}，含税险的每月总还款为 {monthlyPayment}。在整个期限内你将支付 {totalInterest} 的利息。",
		faq: [
			{ q: "每月还款包含哪些部分？", a: "包含本金和利息，以及你填写的每月房产税、房屋保险和物业费。" },
			{ q: "额外还款为什么能省钱？", a: "每一笔额外还款都直接冲抵本金，未来的利息按更小的余额计算，因此能减少总利息并缩短还款期数。" },
			{ q: "我的数据会被上传吗？", a: "不会。所有计算都在你的浏览器中进行，你输入的内容不会离开你的设备。" },
		],
		disclaimer: "仅供参考——非财务建议。实际贷款条款、税费和保险因机构和地区而异。",
	},
	// TODO(worker): loan, retirement, tax + China individual-income-tax brackets.
};
