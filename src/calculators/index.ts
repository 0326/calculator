import type { CalculatorDef } from "../engine/types";
import { mortgage } from "./mortgage";
import { loan } from "./loan";
import { retirement } from "./retirement";
import { tax } from "./tax";

/** All registered calculators. Adding a calculator = adding a config here. */
export const ALL_CALCULATORS: CalculatorDef[] = [mortgage, loan, retirement, tax];

export { mortgage, loan, retirement, tax };
