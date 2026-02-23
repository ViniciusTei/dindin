import type { PasswordHasher, UsersRepo } from "../ports";

export type CreateLocalUserResult =
  | { ok: true }
  | { ok: false; error: "INVALID_INPUT" | "ALREADY_EXISTS" };

export async function createLocalUser(params: {
  usersRepo: UsersRepo;
  passwordHasher: PasswordHasher;
  idFactory: () => string;
  username: string;
  password: string;
  isAdmin: boolean;
}): Promise<CreateLocalUserResult> {
  const username = params.username.trim();
  const password = params.password;

  if (!username || password.length < 8) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  const exists = await params.usersRepo.existsByUsername(username);
  if (exists) return { ok: false, error: "ALREADY_EXISTS" };

  const passwordHash = await params.passwordHasher.hash(password);
  await params.usersRepo.create({
    id: params.idFactory(),
    username,
    passwordHash,
    isAdmin: params.isAdmin,
  });

  return { ok: true };
}
