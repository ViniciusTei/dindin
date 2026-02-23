import { db } from "~/db/db.server";
import { months } from "~/db/schema";
import { MonthAlreadyExistsError } from "~/domain/months/errors";
import type { MonthsRepo } from "~/domain/months/ports";
import type { Month, MonthStatus } from "~/domain/months/entity";
import type { Ym } from "~/domain/months/types";

export const monthsRepo: MonthsRepo = {
  async listByHousehold(householdId: string): Promise<Month[]> {
    const list = await db.query.months.findMany({
      where: (t, { eq }) => eq(t.householdId, householdId),
      orderBy: (t, { desc }) => desc(t.ym),
    });

    return list.map((m) => ({
      id: m.id,
      householdId: m.householdId,
      ym: m.ym as Ym,
      status: m.status as MonthStatus,
    }));
  },

  async create(params: { id: string; householdId: string; ym: Ym }) {
    try {
      await db.insert(months).values({
        id: params.id,
        householdId: params.householdId,
        ym: params.ym,
        status: "open",
      });
    } catch {
      throw new MonthAlreadyExistsError();
    }
  },
};
