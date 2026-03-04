import { MonthAlreadyExistsError } from "~/domain/months/errors";

import type { AuthUsersRepo, PasswordVerifier } from "~/domain/auth/ports";
import type { InvitesRepo } from "~/domain/invites/ports";
import type { Month, MonthsRepo } from "~/domain/months/ports";
import type { CategoriesRepo } from "~/domain/categories/ports";
import { CategoryAlreadyExistsError, CategoryNotFoundError } from "~/domain/categories/errors";
import type { AccountsRepo } from "~/domain/accounts/ports";
import { AccountAlreadyExistsError, AccountNotFoundError } from "~/domain/accounts/errors";
import type { PasswordHasher, UsersEraseRepo, UsersRepo } from "~/domain/users/ports";
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

export function makeUsersEraseRepo(seed?: { deleted?: boolean }) {
  const repo: UsersEraseRepo = {
    async eraseUserData() {
      return { deleted: seed?.deleted ?? true };
    },
  };
  return repo;
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

export function makeCategoriesRepo(seed?: { householdId?: string; categories?: Array<{ id: string; name: string }> }) {
  const householdId = seed?.householdId ?? "household-1";
  const categories = (seed?.categories ?? []).map((c) => ({
    id: c.id,
    householdId,
    name: c.name,
    createdAt: new Date(),
  }));

  const repo: CategoriesRepo = {
    async listByHousehold(hId) {
      return categories.filter((c) => c.householdId === hId).slice();
    },
    async create(params) {
      const exists = categories.some(
        (c) => c.householdId === params.householdId && c.name.toLowerCase() === params.name.toLowerCase()
      );
      if (exists) throw new CategoryAlreadyExistsError();
      categories.push({ id: params.id, householdId: params.householdId, name: params.name, createdAt: new Date() });
    },
    async rename(params) {
      const idx = categories.findIndex((c) => c.householdId === params.householdId && c.id === params.categoryId);
      if (idx === -1) throw new CategoryNotFoundError();

      const exists = categories.some(
        (c) => c.householdId === params.householdId && c.id !== params.categoryId && c.name.toLowerCase() === params.name.toLowerCase()
      );
      if (exists) throw new CategoryAlreadyExistsError();

      categories[idx] = { ...categories[idx], name: params.name };
    },
    async delete(params) {
      const idx = categories.findIndex((c) => c.householdId === params.householdId && c.id === params.categoryId);
      if (idx === -1) throw new CategoryNotFoundError();
      categories.splice(idx, 1);
    },
  };

  return { repo, categories, householdId };
}

export function makeAccountsRepo(seed?: {
  userId?: string;
  accounts?: Array<{ id: string; name: string; initialBalanceCents?: number }>;
  txCountsByAccountId?: Record<string, number>;
}) {
  const userId = seed?.userId ?? "user-1";
  const accounts = (seed?.accounts ?? []).map((a) => ({
    id: a.id,
    userId,
    name: a.name,
    initialBalanceCents: a.initialBalanceCents ?? 0,
    createdAt: new Date(),
  }));
  const txCountsByAccountId = { ...(seed?.txCountsByAccountId ?? {}) };

  const repo: AccountsRepo = {
    async listByUser(uId) {
      return accounts
        .filter((a) => a.userId === uId)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    async create(params) {
      const exists = accounts.some(
        (a) => a.userId === params.userId && a.name.toLowerCase() === params.name.toLowerCase()
      );
      if (exists) throw new AccountAlreadyExistsError();
      accounts.push({
        id: params.id,
        userId: params.userId,
        name: params.name,
        initialBalanceCents: params.initialBalanceCents,
        createdAt: new Date(),
      });
    },
    async rename(params) {
      const idx = accounts.findIndex((a) => a.userId === params.userId && a.id === params.accountId);
      if (idx === -1) throw new AccountNotFoundError();

      const exists = accounts.some(
        (a) =>
          a.userId === params.userId &&
          a.id !== params.accountId &&
          a.name.toLowerCase() === params.name.toLowerCase()
      );
      if (exists) throw new AccountAlreadyExistsError();

      accounts[idx] = { ...accounts[idx], name: params.name };
    },
    async delete(params) {
      const idx = accounts.findIndex((a) => a.userId === params.userId && a.id === params.accountId);
      if (idx === -1) throw new AccountNotFoundError();
      accounts.splice(idx, 1);
    },
    async countTransactionsByAccount(params) {
      if (params.userId !== userId) return 0;
      return txCountsByAccountId[params.accountId] ?? 0;
    },
  };

  return { repo, accounts, userId, txCountsByAccountId };
}
