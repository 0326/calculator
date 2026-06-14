// Chinese (zh-CN) calculator content. Seeded with the Mortgage flagship to prove the pipeline;
// "zh content + China IIT" unit expands to loan/retirement/tax and adds China income-tax brackets.

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

	loan: {
		title: "贷款计算器",
		description:
			"计算汽车贷款或个人消费贷款的每月还款和总利息，并比较不同贷款期限如何改变总成本。",
		inputs: {
			loanAmount: "贷款金额",
			annualRate: "年利率",
			termMonths: "贷款期限（月）",
			extraMonthly: "每月额外还款",
		},
		outputs: {
			monthlyPayment: "每月还款",
			loanAmount: "贷款金额",
			totalInterest: "总利息",
			totalCost: "还款总额",
			payoffTime: "还清时间",
		},
		intro:
			"调整贷款期限，观察其中的权衡：期限越短，每月还款越高，但所付总利息要少得多。所有计算都在你的浏览器中完成。",
		explainTemplate:
			"借款 {loanAmount}，你的每月还款为 {monthlyPayment}，整个期限内共支付 {totalInterest} 的利息，还款总额为 {totalCost}。",
		faq: [
			{
				q: "我该选择较短还是较长的贷款期限？",
				a: "期限越短，每月还款越高，但总利息越低。期限对比图会把两个数字并排展示，方便你选择自己能接受的平衡点。",
			},
			{
				q: "这个计算器适用于车贷和个人消费贷吗？",
				a: "适用。任何固定利率、等额本息的分期贷款都使用相同的计算方法。",
			},
			{
				q: "我的数据会被上传吗？",
				a: "不会。所有计算都在你的浏览器中完成，你输入的内容不会离开你的设备。",
			},
		],
		disclaimer: "仅供参考——非财务建议。你的实际利率和费用取决于贷款机构和个人信用状况。",
	},

	retirement: {
		title: "退休理财计算器",
		description:
			"预测你的储蓄在复利增长和持续定投下可能达到的规模——不仅给出单一乐观结果，还包含一个不确定性区间。",
		inputs: {
			currentSavings: "当前储蓄",
			monthlyContribution: "每月定投",
			annualReturn: "预期年化收益率",
			volatility: "不确定性（±）",
			years: "投资年限",
		},
		outputs: {
			futureValue: "预计市值",
			totalContributed: "累计投入",
			totalGrowth: "投资增值",
			optimistic: "乐观情形",
			pessimistic: "保守情形",
		},
		intro:
			"你看到的不只是单一预测，而是一个区间——因为真实收益每年都在波动。所有数字都在你的浏览器本地计算。",
		explainTemplate:
			"按当前设定，你的预计市值约为 {futureValue}，其中 {totalGrowth} 来自复利增值。视收益高低而定，结果区间大约在 {pessimistic} 到 {optimistic} 之间。",
		faq: [
			{
				q: "为什么展示一个区间而不是单一数字？",
				a: "市场每年的收益并不相同。区间图展示了从保守到乐观的范围，让你围绕不确定性做规划，而不是只盯着一个乐观数字。",
			},
			{
				q: "这算是投资建议吗？",
				a: "不算。这只是一个通用的预测工具，未考虑税费、通胀和你的个人情况，不构成投资建议。",
			},
			{
				q: "我的数据会被上传吗？",
				a: "不会。所有计算都在你的浏览器中完成，你输入的内容不会离开你的设备。",
			},
		],
		disclaimer: "仅供参考——非投资建议。预测仅为示意，不保证未来收益。",
	},

	tax: {
		title: "个人所得税计算器",
		description:
			"按累进税率档位估算你的个人所得税，并理解为什么你的实际税负（实际税率）低于最高边际税率。",
		inputs: {
			income: "应纳税所得额",
			filingStatus: "计税方式",
		},
		outputs: {
			totalTax: "应纳税额",
			afterTax: "税后收入",
			marginalRate: "边际税率",
			effectiveRate: "实际税率",
		},
		intro:
			"输入你的应纳税所得额，即可按档位查看应纳税额，并理解为什么实际税率远低于边际税率。计算在你的浏览器中完成。",
		explainTemplate:
			"在 {totalTax} 的应纳税额下，你的最高边际税率为 {marginalRate}；但由于只有最高部分的收入按该税率计征，你的实际税率仅为 {effectiveRate}。",
		faq: [
			{
				q: "为什么我的实际税率低于所在的税率档位？",
				a: "税率是按档累进的：每一档只对落入该档区间的收入部分计税。实际税率是应纳税额除以全部收入，因此总是低于你的最高档税率。",
			},
			{
				q: "这里的应纳税所得额是指什么？",
				a: "中国综合所得在减去每年 6 万元基本减除费用（以及专项扣除、专项附加扣除等）后，才得到应纳税所得额。本工具直接对你填入的应纳税所得额计税。",
			},
			{
				q: "结果包含专项附加扣除或地方税费吗？",
				a: "不包含。这是基于年度综合所得税率表的简化估算，未计入专项附加扣除、社保公积金及其他调整，不构成税务建议。",
			},
		],
		disclaimer:
			"仅供参考——非税务建议。采用简化的中国个人所得税年度综合所得税率表，未计入专项附加扣除、社保及其他扣除项。",
	},
};
