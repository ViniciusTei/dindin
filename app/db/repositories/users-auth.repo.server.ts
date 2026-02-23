import { db } from "~/db/db.server";
import type { AuthUsersRepo } from "~/domain/auth/ports";

export const authUsersRepo: AuthUsersRepo = {
  async findByUsername(username: string) {
    const user = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.username, username),
      columns: { id: true, username: true, passwordHash: true },
    });

    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
    };
  },
};
