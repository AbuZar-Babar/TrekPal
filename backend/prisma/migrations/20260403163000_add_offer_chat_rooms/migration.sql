ALTER TABLE "trip_groups"
ADD COLUMN "packageId" TEXT;

CREATE UNIQUE INDEX "trip_groups_packageId_key" ON "trip_groups"("packageId");

ALTER TABLE "trip_groups"
ADD CONSTRAINT "trip_groups_packageId_fkey"
FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages"
ADD COLUMN "agencyId" TEXT,
ADD COLUMN "senderType" TEXT NOT NULL DEFAULT 'TRAVELER';

ALTER TABLE "messages"
ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "messages"
ADD CONSTRAINT "messages_agencyId_fkey"
FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
