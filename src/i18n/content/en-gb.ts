// UK (en-GB) content overrides. Copy is English; the formatter renders £ automatically.
// Worker "en-GB locale" adds UK terminology tweaks and UK income-tax bands for the tax calculator.

import type { LocaleContent } from "./index";

export const EN_GB: LocaleContent = {
	mortgage: {
		inputs: { downPayment: "Deposit" },
	},
	// TODO(worker): UK terminology pass + UK income-tax bands (personal allowance, basic/higher/additional).
};
