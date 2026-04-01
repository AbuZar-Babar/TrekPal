-- Add traveler KYC fields and gate state
ALTER TABLE "users"
ADD COLUMN "travelerKycStatus" TEXT NOT NULL DEFAULT 'NOT_SUBMITTED',
ADD COLUMN "dateOfBirth" TIMESTAMP(3),
ADD COLUMN "city" TEXT,
ADD COLUMN "residentialAddress" TEXT,
ADD COLUMN "emergencyContactName" TEXT,
ADD COLUMN "emergencyContactPhone" TEXT,
ADD COLUMN "cnicFrontImageUrl" TEXT,
ADD COLUMN "selfieImageUrl" TEXT,
ADD COLUMN "kycSubmittedAt" TIMESTAMP(3),
ADD COLUMN "kycVerifiedAt" TIMESTAMP(3);

UPDATE "users"
SET
  "travelerKycStatus" = 'VERIFIED',
  "kycSubmittedAt" = COALESCE("updatedAt", "createdAt"),
  "kycVerifiedAt" = COALESCE("updatedAt", "createdAt")
WHERE "cnicVerified" = true;
