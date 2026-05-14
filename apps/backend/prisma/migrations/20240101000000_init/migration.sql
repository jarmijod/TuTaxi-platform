-- CreateEnums
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
CREATE TYPE "DriverStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE');
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE');
CREATE TYPE "RideStatus" AS ENUM ('SEARCHING_DRIVER', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'WAITING_PASSENGER', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable roles
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" TEXT NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable refresh_tokens
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable otp_codes
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable devices
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "device_name" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable drivers
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "license_image" TEXT,
    "status" "DriverStatus" NOT NULL DEFAULT 'OFFLINE',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "total_trips" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable vehicles
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driver_id" TEXT NOT NULL,
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable rides
CREATE TABLE "rides" (
    "id" TEXT NOT NULL,
    "origin_address" TEXT NOT NULL,
    "destination_address" TEXT NOT NULL,
    "origin_lat" DOUBLE PRECISION NOT NULL,
    "origin_lng" DOUBLE PRECISION NOT NULL,
    "destination_lat" DOUBLE PRECISION NOT NULL,
    "destination_lng" DOUBLE PRECISION NOT NULL,
    "distance" DOUBLE PRECISION,
    "duration" INTEGER,
    "price" DOUBLE PRECISION,
    "status" "RideStatus" NOT NULL DEFAULT 'SEARCHING_DRIVER',
    "cancel_reason" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_id" TEXT NOT NULL,
    "driver_id" TEXT,
    CONSTRAINT "rides_pkey" PRIMARY KEY ("id")
);

-- CreateTable ride_locations
CREATE TABLE "ride_locations" (
    "id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ride_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    CONSTRAINT "ride_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable ride_status_history
CREATE TABLE "ride_status_history" (
    "id" TEXT NOT NULL,
    "status" "RideStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ride_id" TEXT NOT NULL,
    CONSTRAINT "ride_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE UNIQUE INDEX "drivers_license_number_key" ON "drivers"("license_number");
CREATE UNIQUE INDEX "drivers_user_id_key" ON "drivers"("user_id");
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");

-- AddForeignKeys
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rides" ADD CONSTRAINT "rides_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "rides" ADD CONSTRAINT "rides_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ride_locations" ADD CONSTRAINT "ride_locations_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ride_locations" ADD CONSTRAINT "ride_locations_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ride_status_history" ADD CONSTRAINT "ride_status_history_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "rides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed roles
INSERT INTO "roles" ("id", "name", "permissions", "updated_at") VALUES
  (gen_random_uuid(), 'ADMIN', ARRAY['*'], NOW()),
  (gen_random_uuid(), 'CLIENT', ARRAY['trips:create', 'trips:read', 'profile:update'], NOW()),
  (gen_random_uuid(), 'DRIVER', ARRAY['trips:accept', 'trips:read', 'profile:update', 'vehicle:manage'], NOW());
