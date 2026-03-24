import 'dotenv/config';
import { Pool } from 'pg';
import argon2 from 'argon2';

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const res = await pool.query("select password_hash from users where username='e2e_manual_admin'");
  console.log('row count', res.rowCount);
  if (res.rowCount === 0) return;
  const stored = res.rows[0].password_hash;
  const computed = await argon2.hash('password123', { salt: Buffer.from(process.env.SESSION_SECRET) });
  console.log('stored === computed?', stored === computed);
  console.log('stored:', stored);
  console.log('computed:', computed);
  await pool.end();
})();
