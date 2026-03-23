import argon2 from "argon2";
import { env } from "~/lib/env.server";

if (!env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not set");
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { salt: Buffer.from(env.SESSION_SECRET) });
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    const hashToCompare = await hashPassword(password);
    if (hash === hashToCompare) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
