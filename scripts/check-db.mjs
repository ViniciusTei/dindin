import 'dotenv/config';
import { Pool } from 'pg';

(async () => {
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const res = await pool.query('select count(*)::int as cnt from users');
    console.log(res.rows);
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
