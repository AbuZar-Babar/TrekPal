-- AlterTable
ALTER TABLE "packages"
ADD COLUMN "hotelId" TEXT,
ADD COLUMN "vehicleId" TEXT;

-- CreateIndex
CREATE INDEX "packages_hotelId_idx" ON "packages"("hotelId");

-- CreateIndex
CREATE INDEX "packages_vehicleId_idx" ON "packages"("vehicleId");

-- AddForeignKey
ALTER TABLE "packages"
ADD CONSTRAINT "packages_hotelId_fkey"
FOREIGN KEY ("hotelId") REFERENCES "hotels"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packages"
ADD CONSTRAINT "packages_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
