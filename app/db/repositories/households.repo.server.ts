import crypto from "node:crypto";

import { db } from "~/db/db.server";
import { categories, households, memberships } from "~/db/schema";
import type { SetupHouseholdsRepo } from "~/domain/setup/ports";

function createId(): string {
  return crypto.randomUUID();
}

const DEFAULT_CATEGORIES = [
  "Aluguel",
  "Luz",
  "Água",
  "Internet",
  "Cartão",
  "Mercado",
  "Outros",
];

export const householdsRepo: SetupHouseholdsRepo = {
  async createHouseholdWithAdmin(params) {
    const householdId = createId();
    await db.insert(households).values({
      id: householdId,
      name: params.name ?? "Casa",
    });

    await db.insert(memberships).values({
      householdId,
      userId: params.adminUserId,
      role: "admin",
    });

    for (const name of DEFAULT_CATEGORIES) {
      await db.insert(categories).values({
        id: createId(),
        householdId,
        name,
      });
    }

    return { householdId };
  },
};
