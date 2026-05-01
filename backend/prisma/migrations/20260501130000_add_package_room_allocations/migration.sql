CREATE TABLE "package_room_allocations" (
  "id" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "reservedRooms" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "package_room_allocations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "package_room_allocations_packageId_roomId_key"
ON "package_room_allocations"("packageId", "roomId");

CREATE INDEX "package_room_allocations_roomId_idx"
ON "package_room_allocations"("roomId");

ALTER TABLE "package_room_allocations"
ADD CONSTRAINT "package_room_allocations_packageId_fkey"
FOREIGN KEY ("packageId") REFERENCES "packages"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "package_room_allocations"
ADD CONSTRAINT "package_room_allocations_roomId_fkey"
FOREIGN KEY ("roomId") REFERENCES "rooms"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
