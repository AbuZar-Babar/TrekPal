$path = "backend/prisma/schema.prisma"
$content = Get-Content $path -Raw
$content = $content -replace "agencyId    String\?", "agencyId    String?`n  email       String?  @unique`n  authUid     String?  @unique"
$content = $content -replace "amenities   String\[\] // Array of amenities", "amenities   String[] // Array of amenities`n  businessDocUrl     String?`n  locationImageUrl   String?"
$content = $content -replace "agency      Agency\?  @relation\(fields: \[agencyId\], references: \[id\], onDelete: SetNull\)", "agency      Agency?  @relation(fields: [agencyId], references: [id], onDelete: SetNull)`n  services    HotelService[]"
$content = $content -replace "bookings    Booking\[\]", "bookings    Booking[]`n  availabilities RoomAvailability[]"

$newModels = @"

model RoomAvailability {
  id        String   @id @default(cuid())
  roomId    String
  date      DateTime
  available Int      // Number of rooms free on this specific night
  
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  @@unique([roomId, date])
  @@map("room_availabilities")
}

model HotelService {
  id        String   @id @default(cuid())
  hotelId   String
  name      String   // e.g., WiFi, Breakfast, Pool
  price     Float    @default(0)
  
  hotel     Hotel    @relation(fields: [hotelId], references: [id], onDelete: Cascade)
  @@map("hotel_services")
}
"@

$content = $content + $newModels
Set-Content $path $content -NoNewline
