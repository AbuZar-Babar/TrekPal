-- Add vehicle registration and driver details
ALTER TABLE "vehicles"
  ADD COLUMN IF NOT EXISTS "vehicleNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "driverName" TEXT,
  ADD COLUMN IF NOT EXISTS "driverPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "driverLicense" TEXT;
