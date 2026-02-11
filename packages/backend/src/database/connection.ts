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

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  // Run each migration statement independently so one failure doesn't block others
  const statements = [
    {
      label: 'admin_users table',
      sql: `CREATE TABLE IF NOT EXISTS "admin_users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" varchar(255) UNIQUE NOT NULL,
        "password_hash" text NOT NULL,
        "first_name" varchar(100) NOT NULL,
        "last_name" varchar(100) NOT NULL,
        "is_active" boolean DEFAULT true,
        "last_login_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )`,
    },
    {
      label: 'login_audit_logs table',
      sql: `CREATE TABLE IF NOT EXISTS "login_audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "email" varchar(255) NOT NULL,
        "user_type" varchar(20) NOT NULL,
        "user_id" uuid,
        "success" boolean NOT NULL,
        "ip_address" varchar(45),
        "user_agent" text,
        "failure_reason" varchar(255),
        "created_at" timestamp DEFAULT now() NOT NULL
      )`,
    },
    {
      label: 'demo_access_codes label column',
      sql: `ALTER TABLE "demo_access_codes" ADD COLUMN IF NOT EXISTS "label" varchar(255)`,
    },
    {
      label: 'demo_access_codes FK update',
      sql: `ALTER TABLE "demo_access_codes" DROP CONSTRAINT IF EXISTS "demo_access_codes_created_by_users_id_fk";
            ALTER TABLE "demo_access_codes" ADD CONSTRAINT "demo_access_codes_created_by_admin_users_id_fk"
              FOREIGN KEY ("created_by") REFERENCES "admin_users"("id") ON DELETE SET NULL`,
    },
    {
      label: 'login_audit indexes',
      sql: `CREATE INDEX IF NOT EXISTS "idx_login_audit_email" ON "login_audit_logs" ("email");
            CREATE INDEX IF NOT EXISTS "idx_login_audit_created" ON "login_audit_logs" ("created_at");
            CREATE INDEX IF NOT EXISTS "idx_login_audit_user_type" ON "login_audit_logs" ("user_type")`,
    },
    {
      label: 'seed admin user',
      sql: `INSERT INTO "admin_users" ("email", "password_hash", "first_name", "last_name")
            SELECT 'info@donkeyideas.com', '$2b$12$MwbNilPSjRvyLwKLUm2EKuFrW2z9cznKdcwu3QyL1hwhGqyNeqnpy', 'Admin', 'DonkeyIdeas'
            WHERE NOT EXISTS (SELECT 1 FROM "admin_users" WHERE "email" = 'info@donkeyideas.com')`,
    },
  ];

  try {
    for (const { label, sql } of statements) {
      try {
        await client.query(sql);
      } catch (err) {
        console.warn(`[DB] Migration "${label}" skipped:`, (err as Error).message);
      }
    }
    console.log('[DB] Migrations applied successfully');
  } finally {
    client.release();
  }
}
