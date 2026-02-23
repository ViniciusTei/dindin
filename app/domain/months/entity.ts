import type { Ym } from "./types";

export type MonthStatus = "open" | "closed";

export type Month = {
  id: string;
  householdId: string;
  ym: Ym;
  status: MonthStatus;
};
