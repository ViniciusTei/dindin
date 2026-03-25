import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import type { TransactionRunner } from "~/domain/shared/transaction";
import { env } from "~/lib/env.server";
import * as schema from "~/db/schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export type DbClient = typeof db;
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbExecutor = DbClient | DbTransaction;

export function resolveClient(tx?: DbExecutor): DbExecutor {
  return tx ?? db;
}

export const drizzleTransactionRunner: TransactionRunner<DbTransaction> = {
  async run(work) {
    return db.transaction(async (tx) => work(tx));
  },
};
