import crypto from "node:crypto";

import { db } from "~/db/db.server";
import { users } from "~/db/schema";
import { hashPassword, verifyPassword } from "~/auth/password.server";

function createId(): string {
  return crypto.randomUUID();
}

export async function countUsers(): Promise<number> {
  const result = await db.select({ id: users.id }).from(users).limit(1);
  return result.length;
}

export async function createLocalUser(params: {
  username: string;
  password: string;
  isAdmin?: boolean;
}): Promise<{ id: string } | null> {
  const existing = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.username, params.username),
  });
  if (existing) return null;

  const id = createId();
  const passwordHash = await hashPassword(params.password);

  await db.insert(users).values({
    id,
    username: params.username,
    passwordHash,
    isAdmin: params.isAdmin ?? false,
  });

  return { id };
}

export async function verifyLogin(params: {
  username: string;
  password: string;
}): Promise<{ id: string } | null> {
  const user = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.username, params.username),
  });
  if (!user) return null;

  const ok = await verifyPassword(user.passwordHash, params.password);
  if (!ok) return null;

  return { id: user.id };
}
