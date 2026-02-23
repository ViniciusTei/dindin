import type { AuthUsersRepo, PasswordVerifier } from "../ports";

export type LoginLocalResult =
  | { ok: true; userId: string }
  | { ok: false; error: "INVALID_LOGIN" };

export async function loginLocal(params: {
  usersRepo: AuthUsersRepo;
  passwordVerifier: PasswordVerifier;
  username: string;
  password: string;
}): Promise<LoginLocalResult> {
  const username = params.username.trim();
  const password = params.password;

  const user = await params.usersRepo.findByUsername(username);
  if (!user) return { ok: false, error: "INVALID_LOGIN" };

  const ok = await params.passwordVerifier.verify({
    hash: user.passwordHash,
    password,
  });

  if (!ok) return { ok: false, error: "INVALID_LOGIN" };
  return { ok: true, userId: user.id };
}
