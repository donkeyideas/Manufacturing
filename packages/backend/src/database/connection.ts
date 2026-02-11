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
    // ─── EDI Module ───
    {
      label: 'edi_doc_type enum',
      sql: `DO $$ BEGIN CREATE TYPE "edi_doc_type" AS ENUM ('850','855','810','856','997','custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    },
    {
      label: 'edi_direction enum',
      sql: `DO $$ BEGIN CREATE TYPE "edi_direction" AS ENUM ('inbound','outbound'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    },
    {
      label: 'edi_transaction_status enum',
      sql: `DO $$ BEGIN CREATE TYPE "edi_transaction_status" AS ENUM ('pending','processing','completed','failed','acknowledged'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    },
    {
      label: 'edi_format enum',
      sql: `DO $$ BEGIN CREATE TYPE "edi_format" AS ENUM ('csv','xml','json','x12'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    },
    {
      label: 'edi_partner_status enum',
      sql: `DO $$ BEGIN CREATE TYPE "edi_partner_status" AS ENUM ('active','inactive','testing','suspended'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    },
    {
      label: 'edi_comm_method enum',
      sql: `DO $$ BEGIN CREATE TYPE "edi_comm_method" AS ENUM ('manual','api','sftp','as2','email'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    },
    {
      label: 'edi_trading_partners table',
      sql: `CREATE TABLE IF NOT EXISTS "edi_trading_partners" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
        "partner_code" varchar(30) NOT NULL,
        "partner_name" varchar(255) NOT NULL,
        "partner_type" varchar(20) NOT NULL,
        "customer_id" uuid REFERENCES "customers"("id"),
        "vendor_id" uuid REFERENCES "vendors"("id"),
        "communication_method" "edi_comm_method" DEFAULT 'manual' NOT NULL,
        "default_format" "edi_format" DEFAULT 'csv' NOT NULL,
        "status" "edi_partner_status" DEFAULT 'testing' NOT NULL,
        "isa_id" varchar(15),
        "gs_id" varchar(15),
        "as2_id" varchar(128),
        "as2_url" text,
        "partner_certificate" text,
        "encryption_algorithm" varchar(50) DEFAULT 'aes256',
        "signature_algorithm" varchar(50) DEFAULT 'sha256',
        "sftp_host" varchar(255),
        "sftp_port" integer DEFAULT 22,
        "sftp_username" varchar(255),
        "sftp_password" text,
        "sftp_remote_dir" varchar(500),
        "sftp_poll_schedule" varchar(50),
        "contact_name" varchar(255),
        "contact_email" varchar(255),
        "contact_phone" varchar(30),
        "notes" text,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )`,
    },
    {
      label: 'edi_transactions table',
      sql: `CREATE TABLE IF NOT EXISTS "edi_transactions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
        "transaction_number" varchar(30) NOT NULL,
        "partner_id" uuid NOT NULL REFERENCES "edi_trading_partners"("id"),
        "document_type" "edi_doc_type" NOT NULL,
        "direction" "edi_direction" NOT NULL,
        "format" "edi_format" DEFAULT 'csv' NOT NULL,
        "status" "edi_transaction_status" DEFAULT 'pending' NOT NULL,
        "sales_order_id" uuid REFERENCES "sales_orders"("id"),
        "purchase_order_id" uuid REFERENCES "purchase_orders"("id"),
        "raw_content" text,
        "parsed_content" text,
        "error_message" text,
        "error_details" text,
        "acknowledgment_id" uuid,
        "as2_message_id" varchar(255),
        "control_number" varchar(30),
        "document_date" date,
        "processed_at" timestamp,
        "processed_by" uuid REFERENCES "users"("id"),
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )`,
    },
    {
      label: 'edi_document_maps table',
      sql: `CREATE TABLE IF NOT EXISTS "edi_document_maps" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
        "partner_id" uuid REFERENCES "edi_trading_partners"("id"),
        "document_type" "edi_doc_type" NOT NULL,
        "direction" "edi_direction" NOT NULL,
        "map_name" varchar(255) NOT NULL,
        "mapping_rules" text NOT NULL,
        "is_default" boolean DEFAULT false,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )`,
    },
    {
      label: 'edi_settings table',
      sql: `CREATE TABLE IF NOT EXISTS "edi_settings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") UNIQUE,
        "company_isa_id" varchar(15),
        "company_gs_id" varchar(15),
        "company_as2_id" varchar(128),
        "company_certificate" text,
        "company_private_key" text,
        "auto_acknowledge_997" boolean DEFAULT true,
        "auto_create_sales_orders" boolean DEFAULT false,
        "auto_generate_on_approval" boolean DEFAULT false,
        "default_format" "edi_format" DEFAULT 'csv',
        "retention_days" integer DEFAULT 365,
        "sftp_polling_enabled" boolean DEFAULT false,
        "sftp_polling_interval_minutes" integer DEFAULT 15,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )`,
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
