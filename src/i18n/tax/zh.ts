import type { RegionTax } from "./types";

const Y = (yuan: number) => yuan * 100; // yuan → cents

// China individual income tax (IIT), annual comprehensive-income tax-rate table.
// Brackets apply to annual TAXABLE income (应纳税所得额) = gross comprehensive income
// minus the ¥60,000/year standard basic deduction (and any further deductions).
// China has no joint filing, so a single "default" status covers everyone.
// Upper bounds are in cents (yuan*100); null = top bracket.
export const ZH_TAX: RegionTax = {
	brackets: {
		default: [
			{ upToCents: Y(36000), ratePct: 3 },
			{ upToCents: Y(144000), ratePct: 10 },
			{ upToCents: Y(300000), ratePct: 20 },
			{ upToCents: Y(420000), ratePct: 25 },
			{ upToCents: Y(660000), ratePct: 30 },
			{ upToCents: Y(960000), ratePct: 35 },
			{ upToCents: null, ratePct: 45 },
		],
	},
	note: "中国个人所得税年度综合所得税率表。基本减除费用每年 6 万元先从综合所得中扣除；此处对扣除后的应纳税所得额计税，未含专项附加扣除等其他项目。",
};
