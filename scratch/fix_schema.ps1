$path = "backend/prisma/schema.prisma"
$content = Get-Content $path -Raw

# Fix Hotel relations
$content = $content -replace "agency      Agency   @relation\(fields: \[agencyId\], references: \[id\], onDelete: Cascade\)", "agency      Agency?  @relation(fields: [agencyId], references: [id], onDelete: SetNull)`n  services    HotelService[]"
$content = $content -replace "availabilities RoomAvailability\[\]`n  reviews     Review\[\]", "reviews     Review[]`n  packages    Package[]" # Cleaning up double availabilities if any

# Fix Room fields
$content = $content -replace "capacity    Int", "capacity    Int`n  quantity    Int      @default(1)"

Set-Content $path $content -NoNewline
