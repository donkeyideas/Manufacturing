-- Migration: Add admin users, login audit logs, and enhance demo access codes

-- ─── Admin Users ───
CREATE TABLE IF NOT EXISTS "admin_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "password_hash" text NOT NULL,
  "first_name" varchar(100) NOT NULL,
  "last_name" varchar(100) NOT NULL,
  "is_active" boolean DEFAULT true,
  "last_login_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ─── Login Audit Logs ───
CREATE TABLE IF NOT EXISTS "login_audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "email" varchar(255) NOT NULL,
  "user_type" varchar(20) NOT NULL,
  "user_id" uuid,
  "success" boolean NOT NULL,
  "ip_address" varchar(45),
  "user_agent" text,
  "failure_reason" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- ─── Add label column to demo_access_codes ───
ALTER TABLE "demo_access_codes" ADD COLUMN IF NOT EXISTS "label" varchar(255);

-- ─── Update demo_access_codes.created_by to reference admin_users ───
-- Drop old FK if exists, add new one
ALTER TABLE "demo_access_codes" DROP CONSTRAINT IF EXISTS "demo_access_codes_created_by_users_id_fk";
ALTER TABLE "demo_access_codes" ADD CONSTRAINT "demo_access_codes_created_by_admin_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "admin_users"("id") ON DELETE SET NULL;

-- ─── Indexes ───
CREATE INDEX IF NOT EXISTS "idx_login_audit_email" ON "login_audit_logs" ("email");
CREATE INDEX IF NOT EXISTS "idx_login_audit_created" ON "login_audit_logs" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_login_audit_user_type" ON "login_audit_logs" ("user_type");
