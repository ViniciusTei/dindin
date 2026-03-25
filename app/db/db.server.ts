import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import { env } from "~/lib/env.server";
import * as schema from "~/db/schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

type TxClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function resolveClient(tx?: unknown) {
  return (tx as TxClient | undefined) ?? db;
}
