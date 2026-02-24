import { MonthAlreadyExistsError } from "~/domain/months/errors";

import type { AuthUsersRepo, PasswordVerifier } from "~/domain/auth/ports";
import type { InvitesRepo } from "~/domain/invites/ports";
import type { Month, MonthsRepo } from "~/domain/months/ports";
import type { PasswordHasher, UsersRepo } from "~/domain/users/ports";
import type { UserSummary } from "~/domain/users/entity";

export function makeIdFactory(prefix = "id") {
  let i = 0;
  return () => `${prefix}-${++i}`;
}

export function makeNow(iso = "2026-02-23T00:00:00.000Z") {
  const fixed = new Date(iso);
  return () => new Date(fixed);
}

export function makeUsersRepo(seed?: { users?: UserSummary[] }) {
  const users: UserSummary[] = [...(seed?.users ?? [])];

  const repo: UsersRepo = {
    async listSummaries() {
      return [...users];
    },
    async existsByUsername(username: string) {
      return users.some((u) => u.username === username);
    },
    async create(params) {
      users.push({
        id: params.id,
        username: params.username,
        isAdmin: params.isAdmin,
        createdAt: new Date(),
      });
    },
  };

  return {
    repo,
    users,
  };
}

export function makePasswordHasher(hashPrefix = "hash") {
  const hasher: PasswordHasher = {
    async hash(password: string) {
      return `${hashPrefix}:${password}`;
    },
  };
  return hasher;
}

export function makeAuthUsersRepo(seed: { users: Array<{ id: string; username: string; passwordHash: string }> }) {
  const users = [...seed.users];
  const repo: AuthUsersRepo = {
    async findByUsername(username: string) {
      return users.find((u) => u.username === username) ?? null;
    },
  };
  return repo;
}

export function makePasswordVerifier(verifyFn: (params: { hash: string; password: string }) => boolean | Promise<boolean>) {
  const verifier: PasswordVerifier = {
    async verify(params) {
      return verifyFn(params);
    },
  };
  return verifier;
}

export function makeMonthsRepo() {
  const monthsByHousehold = new Map<string, Month[]>();

  const repo: MonthsRepo = {
    async listByHousehold(householdId: string) {
      return [...(monthsByHousehold.get(householdId) ?? [])];
    },
    async create(params) {
      const list = monthsByHousehold.get(params.householdId) ?? [];
      if (list.some((m) => m.ym === params.ym)) throw new MonthAlreadyExistsError();
      list.push({
        id: params.id,
        householdId: params.householdId,
        ym: params.ym,
        status: "open",
      });
      monthsByHousehold.set(params.householdId, list);
    },
  };

  return {
    repo,
    monthsByHousehold,
  };
}

export function makeInvitesRepo(seed?: {
  create?: { token?: string; expiresAt?: Date };
  accept?: { ok: true; householdId: string } | { ok: false; reason: "invalid" | "full" };
}) {
  const repo: InvitesRepo = {
    async createInviteLink(params) {
      const token = seed?.create?.token ?? `token:${params.householdId}:${params.createdByUserId}`;
      const expiresAt = seed?.create?.expiresAt ?? new Date(Date.now() + params.ttlHours * 60 * 60 * 1000);
      return { token, expiresAt };
    },
    async acceptInviteLink() {
      return seed?.accept ?? { ok: true, householdId: "household-1" };
    },
  };

  return repo;
}
