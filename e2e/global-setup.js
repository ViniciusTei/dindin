import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { Pool } from 'pg';
import argon2 from 'argon2';

export default async function globalSetup(config) {
  const databaseUrl = process.env.DATABASE_URL || 'postgres://financeiro_user:financeiro_pass@localhost:5432/financeiro_dev';
  const pool = new Pool({ connectionString: databaseUrl });

  const adminUsername = process.env.E2E_SETUP_ADMIN_USERNAME || 'e2e_shared_admin';
  const memberUsername = process.env.E2E_SETUP_MEMBER_USERNAME || 'e2e_shared_member';
  const password = process.env.E2E_SETUP_PASSWORD || 'password123';
  const householdName = process.env.E2E_SETUP_HOUSEHOLD_NAME || 'E2E Shared House';

  // Ensure admin user
  const adminRes = await pool.query('select id from users where username = $1 limit 1', [adminUsername]);
  let adminId;
  if (adminRes.rows.length === 0) {
    adminId = crypto.randomUUID();
    const hash = await argon2.hash(password);
    await pool.query('insert into users (id, username, password_hash, is_admin) values ($1, $2, $3, $4)', [adminId, adminUsername, hash, true]);
    console.log('[e2e global-setup] created admin', adminUsername);
  } else {
    adminId = adminRes.rows[0].id;
    console.log('[e2e global-setup] admin exists', adminUsername);
  }

  // Ensure member user
  const memberRes = await pool.query('select id from users where username = $1 limit 1', [memberUsername]);
  let memberId;
  if (memberRes.rows.length === 0) {
    memberId = crypto.randomUUID();
    const hash = await argon2.hash(password);
    await pool.query('insert into users (id, username, password_hash, is_admin) values ($1, $2, $3, $4)', [memberId, memberUsername, hash, false]);
    console.log('[e2e global-setup] created member', memberUsername);
  } else {
    memberId = memberRes.rows[0].id;
    console.log('[e2e global-setup] member exists', memberUsername);
  }

  // Ensure household
  const householdRes = await pool.query('select id from households where name = $1 limit 1', [householdName]);
  let householdId;
  if (householdRes.rows.length === 0) {
    householdId = crypto.randomUUID();
    await pool.query('insert into households (id, name) values ($1, $2)', [householdId, householdName]);
    console.log('[e2e global-setup] created household', householdName);
  } else {
    householdId = householdRes.rows[0].id;
    console.log('[e2e global-setup] household exists', householdName);
  }

  // Ensure admin membership
  const memRes = await pool.query('select 1 from memberships where household_id = $1 and user_id = $2 limit 1', [householdId, adminId]);
  if (memRes.rows.length === 0) {
    await pool.query('insert into memberships (household_id, user_id, role) values ($1, $2, $3)', [householdId, adminId, 'admin']);
    console.log('[e2e global-setup] added admin membership');
  }

  // Ensure default categories
  const DEFAULT_CATEGORIES = [
    'Aluguel',
    'Luz',
    'Água',
    'Internet',
    'Cartão',
    'Mercado',
    'Outros',
  ];

  for (const name of DEFAULT_CATEGORIES) {
    await pool.query(
      `INSERT INTO categories (id, household_id, name)
       SELECT $1, $2, $3
       WHERE NOT EXISTS (SELECT 1 FROM categories WHERE household_id = $2 AND name = $3)`,
      [crypto.randomUUID(), householdId, name]
    );
  }

  const out = {
    admin: { id: adminId, username: adminUsername, password },
    member: { id: memberId, username: memberUsername, password },
    householdId,
    categoryName: DEFAULT_CATEGORIES[0],
  };

  const outPath = path.resolve(process.cwd(), 'e2e', '.setup-credentials.json');
  await fs.writeFile(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('[e2e global-setup] wrote', outPath);

  await pool.end();
}
