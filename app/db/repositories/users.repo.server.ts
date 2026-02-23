import { db } from "~/db/db.server";
import { users } from "~/db/schema";
import type { UserSummary } from "~/domain/users/entity";
import type { UsersRepo } from "~/domain/users/ports";

export const usersRepo: UsersRepo = {
  async listSummaries(): Promise<UserSummary[]> {
    const rows = await db.query.users.findMany({
      columns: { id: true, username: true, isAdmin: true, createdAt: true },
      orderBy: (t, { asc }) => asc(t.createdAt),
    });

    return rows.map((u) => ({
      id: u.id,
      username: u.username,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
    }));
  },

  async existsByUsername(username: string): Promise<boolean> {
    const row = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.username, username),
      columns: { id: true },
    });
    return Boolean(row);
  },

  async create(params) {
    await db.insert(users).values({
      id: params.id,
      username: params.username,
      passwordHash: params.passwordHash,
      isAdmin: params.isAdmin,
    });
  },
};
