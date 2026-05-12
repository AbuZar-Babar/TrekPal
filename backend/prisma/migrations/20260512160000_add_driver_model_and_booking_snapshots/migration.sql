CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "vehicleProviderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "licenseNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "vehicles" ADD COLUMN "driverId" TEXT;
ALTER TABLE "bookings" ADD COLUMN "driverId" TEXT;
ALTER TABLE "bookings" ADD COLUMN "driverNameSnapshot" TEXT;
ALTER TABLE "bookings" ADD COLUMN "driverPhoneSnapshot" TEXT;
ALTER TABLE "bookings" ADD COLUMN "vehicleNumberSnapshot" TEXT;

INSERT INTO "drivers" (
    "id",
    "vehicleProviderId",
    "name",
    "phone",
    "licenseNumber",
    "status",
    "createdAt",
    "updatedAt"
)
SELECT
    CONCAT('drv_', v."id"),
    v."vehicleProviderId",
    COALESCE(NULLIF(v."driverName", ''), CONCAT(v."make", ' ', v."model", ' Driver')),
    NULLIF(v."driverPhone", ''),
    NULLIF(v."driverLicense", ''),
    'ACTIVE',
    v."createdAt",
    v."updatedAt"
FROM "vehicles" v
WHERE v."vehicleProviderId" IS NOT NULL;

UPDATE "vehicles"
SET "driverId" = CONCAT('drv_', "id")
WHERE "vehicleProviderId" IS NOT NULL;

UPDATE "bookings" b
SET
    "driverId" = v."driverId",
    "driverNameSnapshot" = d."name",
    "driverPhoneSnapshot" = d."phone",
    "vehicleNumberSnapshot" = v."vehicleNumber"
FROM "vehicles" v
LEFT JOIN "drivers" d ON d."id" = v."driverId"
WHERE b."vehicleId" = v."id";

ALTER TABLE "vehicles" ALTER COLUMN "driverId" SET NOT NULL;

ALTER TABLE "vehicles" DROP COLUMN "driverName";
ALTER TABLE "vehicles" DROP COLUMN "driverPhone";
ALTER TABLE "vehicles" DROP COLUMN "driverLicense";

CREATE UNIQUE INDEX "vehicles_driverId_key" ON "vehicles"("driverId");
CREATE INDEX "drivers_vehicleProviderId_idx" ON "drivers"("vehicleProviderId");
CREATE INDEX "bookings_driverId_idx" ON "bookings"("driverId");

ALTER TABLE "drivers" ADD CONSTRAINT "drivers_vehicleProviderId_fkey"
FOREIGN KEY ("vehicleProviderId") REFERENCES "vehicle_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driverId_fkey"
FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_driverId_fkey"
FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
