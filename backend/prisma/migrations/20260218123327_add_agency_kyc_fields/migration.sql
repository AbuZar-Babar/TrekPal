/*
  Warnings:

  - A unique constraint covering the columns `[cnic]` on the table `agencies` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "agencies" ADD COLUMN     "cnic" TEXT,
ADD COLUMN     "cnicImageUrl" TEXT,
ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "ownerPhotoUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "agencies_cnic_key" ON "agencies"("cnic");
