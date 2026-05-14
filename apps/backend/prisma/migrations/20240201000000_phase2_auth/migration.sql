-- Drop old enum and recreate
DROP TYPE IF EXISTS "RoleType";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateTable roles
CREATE TABLE IF NOT EXISTS "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");

-- Alter users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
ALTER TABLE "users" DROP COLUMN IF EXISTS "is_active";

-- CreateTable refresh_tokens
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateTable otp_codes
CREATE TABLE IF NOT EXISTS "otp_codes" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable devices
CREATE TABLE IF NOT EXISTS "devices" (
    "id" TEXT NOT NULL,
    "device_name" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- Add license_image to drivers
ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "license_image" TEXT;

-- AddForeignKeys
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default roles
INSERT INTO "roles" ("id", "name", "permissions", "updated_at") VALUES
  (gen_random_uuid(), 'ADMIN', ARRAY['*'], NOW()),
  (gen_random_uuid(), 'CLIENT', ARRAY['trips:create', 'trips:read', 'profile:update'], NOW()),
  (gen_random_uuid(), 'DRIVER', ARRAY['trips:accept', 'trips:read', 'profile:update', 'vehicle:manage'], NOW())
ON CONFLICT ("name") DO NOTHING;

-- Set role_id for existing users
UPDATE "users" SET "role_id" = (SELECT "id" FROM "roles" WHERE "name" = 'CLIENT') WHERE "role_id" IS NULL;

-- Make role_id NOT NULL after setting defaults
ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON UPDATE CASCADE;
