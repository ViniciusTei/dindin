import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL || 'postgres://financeiro_user:financeiro_pass@localhost:5432/financeiro_dev';
const pool = new Pool({ connectionString: databaseUrl });

const householdId = process.argv[2] || '9c9e0caa-3ccd-4396-9c8c-9b7ff6dd9f12';

(async () => {
  const res = await pool.query(
    `select id, description, amount_cents, occurred_at, created_at from transactions where household_id = $1 order by created_at desc limit 20`,
    [householdId]
  );
  console.log('found', res.rows.length, 'transactions for household', householdId);
  for (const row of res.rows) {
    console.log(JSON.stringify(row));
  }
  await pool.end();
})();
