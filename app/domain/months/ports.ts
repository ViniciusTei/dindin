import type { Month } from "./entity";
import type { Ym } from "./types";

export type { Month } from "./entity";

export interface MonthsRepo {
  listByHousehold(householdId: string): Promise<Month[]>;
  create(params: { id: string; householdId: string; ym: Ym }): Promise<void>;
}
