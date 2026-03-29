import type { PasswordHasher, PasswordVerifier, UserPasswordRepo } from "../ports";

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; error: "INVALID_INPUT" | "WRONG_CURRENT_PASSWORD" | "SAME_PASSWORD" };

export async function changePassword(params: {
  userPasswordRepo: UserPasswordRepo;
  passwordVerifier: PasswordVerifier;
  passwordHasher: PasswordHasher;
  userId: string;
  currentPasswordHash: string;
  currentPassword: string;
  newPassword: string;
}): Promise<ChangePasswordResult> {
  const { currentPassword, newPassword } = params;

  if (!currentPassword || newPassword.length < 8) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  const isCurrentValid = await params.passwordVerifier.verify({
    hash: params.currentPasswordHash,
    password: currentPassword,
  });
  if (!isCurrentValid) {
    return { ok: false, error: "WRONG_CURRENT_PASSWORD" };
  }

  const isSamePassword = await params.passwordVerifier.verify({
    hash: params.currentPasswordHash,
    password: newPassword,
  });
  if (isSamePassword) {
    return { ok: false, error: "SAME_PASSWORD" };
  }

  const newHash = await params.passwordHasher.hash(newPassword);
  await params.userPasswordRepo.updatePasswordHash(params.userId, newHash);

  return { ok: true };
}
