import type { UsersEraseRepo } from "~/domain/users/ports";

export async function eraseUserData(params: {
  usersEraseRepo: UsersEraseRepo;
  userId: string;
}): Promise<{ ok: true } | { ok: false; error: "NOT_FOUND" }> {
  const result = await params.usersEraseRepo.eraseUserData({ userId: params.userId });
  if (!result.deleted) return { ok: false, error: "NOT_FOUND" };
  return { ok: true };
}
