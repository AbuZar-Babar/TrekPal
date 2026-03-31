ALTER TABLE "trip_requests"
ADD COLUMN "tripSpecs" JSONB;

ALTER TABLE "bids"
ADD COLUMN "offerDetails" JSONB,
ADD COLUMN "awaitingActionBy" TEXT NOT NULL DEFAULT 'NONE';

UPDATE "bids"
SET "awaitingActionBy" = CASE
  WHEN "status" = 'PENDING' THEN 'TRAVELER'
  ELSE 'NONE'
END;

CREATE TABLE "bid_revisions" (
  "id" TEXT NOT NULL,
  "bidId" TEXT NOT NULL,
  "actorRole" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "description" TEXT,
  "offerDetails" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "bid_revisions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bid_revisions_bidId_createdAt_idx" ON "bid_revisions"("bidId", "createdAt");

ALTER TABLE "bid_revisions"
ADD CONSTRAINT "bid_revisions_bidId_fkey"
FOREIGN KEY ("bidId") REFERENCES "bids"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
