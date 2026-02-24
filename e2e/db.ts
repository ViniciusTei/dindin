import "dotenv/config";

import crypto from "node:crypto";

import argon2 from "argon2";
import { Pool } from "pg";

const DEFAULT_CATEGORIES = [
  "Aluguel",
  "Luz",
  "Água",
  "Internet",
  "Cartão",
  "Mercado",
  "Outros",
];

export type SeedData = {
  runId: string;
  workerIndex: number;
  pool: Pool;
  householdId: string;
  categoryName: string;
  users: {
    admin: { id: string; username: string; password: string };
    member: { id: string; username: string; password: string };
  };
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} não definido (E2E)`);
  return value;
}

function createId() {
  return crypto.randomUUID();
}

export async function seedWorker(params: {
  runId: string;
  workerIndex: number;
}): Promise<SeedData> {
  const databaseUrl = requireEnv("DATABASE_URL");
  const pool = new Pool({ connectionString: databaseUrl });

  const householdId = createId();

  const adminId = createId();
  const memberId = createId();

  const adminUsername = `e2e_${params.runId}_w${params.workerIndex}_admin`;
  const memberUsername = `e2e_${params.runId}_w${params.workerIndex}_member`;

  const adminPassword = "password123";
  const memberPassword = "password123";

  const [adminHash, memberHash] = await Promise.all([
    argon2.hash(adminPassword),
    argon2.hash(memberPassword),
  ]);

  await pool.query(
    "insert into households (id, name) values ($1, $2)",
    [householdId, `E2E ${params.runId} w${params.workerIndex}`]
  );

  await pool.query(
    "insert into users (id, username, password_hash, is_admin) values ($1, $2, $3, $4)",
    [adminId, adminUsername, adminHash, true]
  );
  await pool.query(
    "insert into users (id, username, password_hash, is_admin) values ($1, $2, $3, $4)",
    [memberId, memberUsername, memberHash, false]
  );

  // Apenas o admin começa no household; o member entra via convite.
  await pool.query(
    "insert into memberships (household_id, user_id, role) values ($1, $2, $3)",
    [householdId, adminId, "admin"]
  );

  for (const name of DEFAULT_CATEGORIES) {
    await pool.query(
      "insert into categories (id, household_id, name) values ($1, $2, $3)",
      [createId(), householdId, name]
    );
  }

  return {
    runId: params.runId,
    workerIndex: params.workerIndex,
    pool,
    householdId,
    categoryName: DEFAULT_CATEGORIES[0]!,
    users: {
      admin: { id: adminId, username: adminUsername, password: adminPassword },
      member: { id: memberId, username: memberUsername, password: memberPassword },
    },
  };
}

export async function cleanupWorker(seed: SeedData): Promise<void> {
  try {
    // Ordem pensada para maximizar cascatas e reduzir conflitos.
    await seed.pool.query("delete from households where id = $1", [seed.householdId]);
    await seed.pool.query("delete from users where id = any($1)", [
      [seed.users.admin.id, seed.users.member.id],
    ]);
  } finally {
    await seed.pool.end();
  }
}
