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
    {
      label: 'contact_messages table',
      sql: `CREATE TABLE IF NOT EXISTS "contact_messages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "sender" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "company" varchar(255),
        "phone" varchar(50),
        "location" varchar(255),
        "subject" varchar(500) NOT NULL,
        "body" text NOT NULL,
        "is_read" boolean DEFAULT false NOT NULL,
        "is_starred" boolean DEFAULT false NOT NULL,
        "status" varchar(20) DEFAULT 'new' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )`,
    },
    {
      label: 'admin_blog_posts table',
      sql: `CREATE TABLE IF NOT EXISTS "admin_blog_posts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "title" varchar(500) NOT NULL,
        "slug" varchar(500) NOT NULL,
        "content" text DEFAULT '' NOT NULL,
        "excerpt" text,
        "status" "blog_post_status" DEFAULT 'draft' NOT NULL,
        "category" varchar(100),
        "tags" text,
        "featured_image_url" text,
        "seo_title" varchar(255),
        "seo_description" text,
        "seo_keywords" text,
        "og_image_url" text,
        "word_count" integer DEFAULT 0,
        "view_count" integer DEFAULT 0,
        "seo_score" integer DEFAULT 0,
        "author_name" varchar(255),
        "published_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )`,
    },
    {
      label: 'admin_settings table',
      sql: `CREATE TABLE IF NOT EXISTS "admin_settings" (
        "key" varchar(255) PRIMARY KEY NOT NULL,
        "value" text NOT NULL,
        "category" varchar(100) NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )`,
    },
    {
      label: 'seed admin_settings defaults',
      sql: `INSERT INTO "admin_settings" ("key", "value", "category") VALUES
        ('platform_name', 'Manufacturing ERP', 'general'),
        ('support_email', 'support@erp-platform.com', 'general'),
        ('default_timezone', 'UTC-5 (Eastern)', 'general'),
        ('default_currency', 'USD', 'general'),
        ('maintenance_window', 'Sundays 2:00 AM - 4:00 AM EST', 'general'),
        ('api_version', 'v3.0.0', 'general'),
        ('smtp_server', 'smtp.sendgrid.net', 'email'),
        ('smtp_port', '587 (TLS)', 'email'),
        ('from_address', 'no-reply@erp-platform.com', 'email'),
        ('report_recipients', 'admin@erp-platform.com, ops@erp-platform.com', 'email'),
        ('notify_new_tenant', 'true', 'notifications'),
        ('notify_subscription_changes', 'true', 'notifications'),
        ('notify_failed_payments', 'true', 'notifications'),
        ('notify_system_alerts', 'true', 'notifications'),
        ('notify_weekly_digest', 'false', 'notifications'),
        ('notify_demo_code_usage', 'true', 'notifications')
      ON CONFLICT ("key") DO NOTHING`,
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
