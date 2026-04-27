# Independent Hotel System & Marketplace Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the TrekPal ecosystem into an independent hotel marketplace where hotels register directly, manage inventory by date, and offer services to all agencies and travelers.

**Architecture:**
1. **Schema**: Decouple `Hotel` from `Agency`, add `RoomAvailability` (calendar-based), and `HotelService` models.
2. **Registration**: Implement a secure signup flow for Hotels with document uploads (business docs, images).
3. **Approval**: Admin dashboard for vetting and approving independent hotels.
4. **Bidding**: Update the bidding system to show "Hotel Base Prices" to agencies for transparency.
5. **Inventory**: Real-time room availability tracking that decrements per booking night.

**Tech Stack:** Prisma, PostgreSQL, Node.js/Express, Vite/React.

---

## Phase 1: Database Refactoring & Migration

### Task 1: Update Schema for Independence & Inventory
**Files:**
- Modify: `backend/prisma/schema.prisma`

**Step 1: Update Hotel Model**
- Make `agencyId` optional.
- Add `businessDocUrl`, `locationImageUrl`.
- Add `services` relation.

**Step 2: Add RoomAvailability Model**
Track rooms per night to prevent overbooking.

```prisma
model RoomAvailability {
  id        String   @id @default(cuid())
  roomId    String
  date      DateTime
  available Int      // Number of rooms free on this specific night
  
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  @@unique([roomId, date])
}
```

**Step 3: Add HotelService Model**
```prisma
model HotelService {
  id        String   @id @default(cuid())
  hotelId   String
  name      String   // e.g., WiFi, Breakfast, Pool
  price     Float    @default(0)
  
  hotel     Hotel    @relation(fields: [hotelId], references: [id], onDelete: Cascade)
}
```

**Step 4: Run Migration**
Run: `npx prisma migrate dev --name independent_hotel_system`

---

### Task 2: Data Migration Script
**Files:**
- [NEW] `backend/scripts/migrate-hotels.ts`

**Step 1: Create script to "Free" hotels**
Iterate through existing hotels and ensure they have valid `authUid` (or placeholder for now) and are marked as independent.

---

## Phase 2: Hotel Portal & Registration

### Task 3: Hotel Signup & Document Upload
**Files:**
- [NEW] `hotel-portal/src/modules/auth/Register.tsx`

**Step 1: Implement Document Upload**
Fields for Business License, Location Images, and Identity Docs.

---

## Phase 3: Admin Approval Dashboard

### Task 4: Admin Vetting UI
**Files:**
- [NEW] `admin-portal/src/modules/hotels/ApprovalList.tsx`

---

## Phase 4: Marketplace & Bidding

### Task 5: Bidding Transparency
**Files:**
- Modify: `agency-portal/src/modules/bids/BidForm.tsx`

**Step 1: Show Hotel Base Price**
When an agency is bidding on a `TripRequest` that includes a hotel, fetch and display the hotel's room price for the requested dates.

---

## Memory & Progress Tracking
Progress will be tracked in `docs/progress/hotel-marketplace-migration.md`.
Current State: Phase 2 / Task 3 (In Progress).
