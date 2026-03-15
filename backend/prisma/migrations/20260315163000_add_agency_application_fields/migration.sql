ALTER TABLE "agencies"
ADD COLUMN "officeCity" TEXT,
ADD COLUMN "jurisdiction" TEXT,
ADD COLUMN "legalEntityType" TEXT,
ADD COLUMN "ntn" TEXT,
ADD COLUMN "secpRegistrationNumber" TEXT,
ADD COLUMN "partnershipRegistrationNumber" TEXT,
ADD COLUMN "fieldOfOperations" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "capitalAvailablePkr" INTEGER,
ADD COLUMN "licenseCertificateUrl" TEXT,
ADD COLUMN "ntnCertificateUrl" TEXT,
ADD COLUMN "businessRegistrationProofUrl" TEXT,
ADD COLUMN "officeProofUrl" TEXT,
ADD COLUMN "bankCertificateUrl" TEXT,
ADD COLUMN "additionalSupportingDocumentUrl" TEXT,
ADD COLUMN "applicationSubmittedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "agencies_ntn_key" ON "agencies"("ntn");
