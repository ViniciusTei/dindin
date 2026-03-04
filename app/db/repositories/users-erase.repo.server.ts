import { and, eq, sql } from "drizzle-orm";

import { db } from "~/db/db.server";
import { households, memberships, users } from "~/db/schema";
import type { UsersEraseRepo } from "~/domain/users/ports";

export const usersEraseRepo: UsersEraseRepo = {
  async eraseUserData(params) {
    return db.transaction(async (tx) => {
      const exists = await tx.query.users.findFirst({
        where: (t, { eq }) => eq(t.id, params.userId),
        columns: { id: true },
      });

      if (!exists) return { deleted: false };

      const membershipRows = await tx
        .select({ householdId: memberships.householdId })
        .from(memberships)
        .where(eq(memberships.userId, params.userId));

      const householdIds = Array.from(new Set(membershipRows.map((r) => r.householdId)));

      for (const householdId of householdIds) {
        const countRows = await tx
          .select({ count: sql<number>`count(*)` })
          .from(memberships)
          .where(eq(memberships.householdId, householdId));

        const membershipCount = Number(countRows[0]?.count ?? 0);

        if (membershipCount <= 1) {
          await tx.delete(households).where(eq(households.id, householdId));
        } else {
          await tx
            .delete(memberships)
            .where(and(eq(memberships.householdId, householdId), eq(memberships.userId, params.userId)));
        }
      }

      await tx.delete(users).where(eq(users.id, params.userId));

      return { deleted: true };
    });
  },
};
