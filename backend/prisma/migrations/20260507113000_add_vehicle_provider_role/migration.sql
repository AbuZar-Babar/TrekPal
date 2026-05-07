-- CreateTable
CREATE TABLE "vehicle_providers" (
    "id" TEXT NOT NULL,
    "authUid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "officeCity" TEXT,
    "license" TEXT,
    "ntn" TEXT,
    "ownerName" TEXT,
    "cnic" TEXT,
    "cnicImageUrl" TEXT,
    "ownerPhotoUrl" TEXT,
    "licenseCertificateUrl" TEXT,
    "ntnCertificateUrl" TEXT,
    "officeProofUrl" TEXT,
    "bankCertificateUrl" TEXT,
    "additionalSupportingDocumentUrl" TEXT,
    "applicationSubmittedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_providers_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN "vehicleProviderId" TEXT;

-- Remove all legacy agency-owned vehicle records as requested
DELETE FROM "vehicles" WHERE "agencyId" IS NOT NULL;

-- Drop legacy ownership column and enforce provider-only ownership
ALTER TABLE "vehicles" DROP CONSTRAINT IF EXISTS "vehicles_agencyId_fkey";
ALTER TABLE "vehicles" DROP COLUMN IF EXISTS "agencyId";
ALTER TABLE "vehicles" ALTER COLUMN "vehicleProviderId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_providers_authUid_key" ON "vehicle_providers"("authUid");
CREATE UNIQUE INDEX "vehicle_providers_email_key" ON "vehicle_providers"("email");
CREATE UNIQUE INDEX "vehicle_providers_license_key" ON "vehicle_providers"("license");
CREATE UNIQUE INDEX "vehicle_providers_ntn_key" ON "vehicle_providers"("ntn");
CREATE UNIQUE INDEX "vehicle_providers_cnic_key" ON "vehicle_providers"("cnic");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vehicleProviderId_fkey"
FOREIGN KEY ("vehicleProviderId") REFERENCES "vehicle_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
