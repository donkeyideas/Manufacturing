import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/erp_v3',
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  ...(isProduction && { ssl: { rejectUnauthorized: false } }),
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

export const db = drizzle(pool);
export { pool };

export async function checkConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (err) {
    console.error('[DB] Connection check failed:', (err as Error).message);
    return false;
  }
}
