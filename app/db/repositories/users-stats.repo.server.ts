import { db } from "~/db/db.server";
import { users } from "~/db/schema";

import type { SetupUsersStatsRepo } from "~/domain/setup/ports";

export const usersStatsRepo: SetupUsersStatsRepo = {
  async hasAnyUsers(): Promise<boolean> {
    const result = await db.select({ id: users.id }).from(users).limit(1);
    return result.length > 0;
  },
};
