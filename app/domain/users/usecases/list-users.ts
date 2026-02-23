import type { UsersRepo } from "../ports";

export async function listUsers(params: { usersRepo: UsersRepo }) {
  return params.usersRepo.listSummaries();
}
