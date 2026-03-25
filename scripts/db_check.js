import { Pool } from 'pg';
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://financeiro_user:financeiro_pass@localhost:5432/financeiro_dev' });
  const purchaseId = '36dd4e7d-8366-4d2a-84f3-5eb5f3021a9c';
  const transactionId = 'fcc4050f-0009-4d24-9a13-e2c70a5864ce';
  try {
    const res1 = await pool.query('select id from transactions where id=$1', [transactionId]);
    const res2 = await pool.query('select id from credit_card_purchases where id=$1', [purchaseId]);
    console.log('transactions rows:', res1.rowCount);
    console.log('purchases rows:', res2.rowCount);
    console.log('transactions sample:', res1.rows[0]);
    console.log('purchases sample:', res2.rows[0]);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
})();
