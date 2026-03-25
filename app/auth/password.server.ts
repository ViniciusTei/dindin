import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
  // Use argon2 default behavior (generate a random salt and include it in the hash)
  return argon2.hash(password);
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
