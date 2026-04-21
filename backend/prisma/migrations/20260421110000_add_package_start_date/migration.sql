-- AlterTable
ALTER TABLE "packages"
ADD COLUMN "startDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "packages_startDate_idx" ON "packages"("startDate");

