# TrekPal — Features & Functionalities

> Auto-generated from source code analysis · Last updated: April 2026
> Covers all four sub-applications: **Backend API**, **Traveler App**, **Agency Portal**, **Admin Portal**

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Data Models](#3-data-models)
4. [Backend API](#4-backend-api)
5. [Traveler Mobile App (Flutter)](#5-traveler-mobile-app-flutter)
6. [Agency Portal (React)](#6-agency-portal-react)
7. [Admin Portal (React)](#7-admin-portal-react)
8. [Real-Time Features (Socket.IO)](#8-real-time-features-socketio)
9. [Cross-Cutting Concerns](#9-cross-cutting-concerns)
10. [Pending & Roadmap Items](#10-pending--roadmap-items)

---

## 1. System Architecture Overview

TrekPal is a full-stack, multi-tenant travel management ecosystem with three client surfaces connected to a single backend API.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐  │
│  │ Traveler App │  │ Agency Portal │  │  Admin Portal    │  │
│  │  (Flutter)   │  │ React + Vite  │  │  React + Vite    │  │
│  │  Android/iOS │  │ localhost:5173 │  │  localhost:5174  │  │
│  └──────┬───────┘  └──────┬────────┘  └────────┬─────────┘  │
└─────────┼────────────────┼───────────────────-─┼────────────┘
          │ HTTP + WS      │ HTTP + WS            │ HTTP
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend API (localhost:3000)                   │
│  Node.js 18+ · Express · TypeScript · Prisma ORM             │
│  REST API  /api/*                                            │
│  WebSocket Server (Socket.IO)                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                 ┌──────────▼──────────┐
                 │  Supabase PostgreSQL │
                 │  + Supabase Auth     │
                 │  + Supabase Storage  │
                 └─────────────────────┘
```

**Port Map**

| Service        | URL                     |
|----------------|-------------------------|
| Backend API    | http://localhost:3000   |
| Agency Portal  | http://localhost:5173   |
| Admin Portal   | http://localhost:5174   |

---

## 2. Tech Stack

| Layer           | Technology                                              |
|-----------------|---------------------------------------------------------|
| Mobile          | Flutter 3.0+, Provider, Socket.IO client                |
| Web Portals     | React 18.2, TypeScript, Vite, Redux Toolkit, Tailwind CSS |
| Backend         | Node.js 18+, Express, TypeScript, Prisma ORM            |
| Database        | Supabase (PostgreSQL)                                   |
| Auth            | JWT tokens, Supabase Auth (optional)                    |
| Real-time       | Socket.IO (WebSocket)                                   |
| File Storage    | Local filesystem (`/uploads`) — Supabase Storage (planned) |
| State (Flutter) | Provider + ChangeNotifier                               |
| State (Web)     | Redux Toolkit + RTK-style slices                        |
| Validation      | Zod (backend schemas)                                   |

---

## 3. Data Models

All data models are defined in `backend/prisma/schema.prisma` and backed by Supabase PostgreSQL.

### 3.1 User (Traveler)

| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `authUid` | String | Supabase Auth UID |
| `email` | String | Unique |
| `name`, `phone`, `gender` | String? | Profile |
| `cnic` | String? | Unique, national ID |
| `cnicVerified` | Boolean | Default false |
| `travelerKycStatus` | String | `NOT_SUBMITTED`, `PENDING`, `VERIFIED`, `REJECTED` |
| `dateOfBirth`, `city`, `residentialAddress` | - | Extended profile |
| `emergencyContactName`, `emergencyContactPhone` | String? | Safety |
| `cnicFrontImageUrl`, `selfieImageUrl` | String? | KYC images |
| `kycSubmittedAt`, `kycVerifiedAt` | DateTime? | KYC timestamps |
| `avatar` | String? | Profile picture URL |

**Relations:** TripRequests, Bookings, Reviews, Messages, TripGroupMembers

### 3.2 Agency (Travel Company)

| Field | Type | Notes |
|---|---|---|
| `id` | String (CUID) | Primary key |
| `authUid` | String | Supabase Auth UID |
| `email`, `name`, `phone`, `address` | - | Basic info |
| `officeCity`, `jurisdiction` | String? | Location |
| `legalEntityType` | String? | Business structure |
| `license`, `ntn`, `secpRegistrationNumber` | String? | Legal identifiers |
| `fieldOfOperations` | String[] | Service categories |
| `capitalAvailablePkr` | Int? | Financial capacity |
| `status` | String | `PENDING`, `APPROVED`, `REJECTED` |
| KYC document URLs | String? | CNIC, owner photo, license, NTN, bank cert, etc. |
| `applicationSubmittedAt` | DateTime? | Registration timestamp |

**Relations:** Hotels, Vehicles, Packages, Bids, Bookings, Messages

### 3.3 Admin

Simple model with `id`, `authUid`, `email`, `name`.

### 3.4 Hotel

| Field | Notes |
|---|---|
| `name`, `description`, `address`, `city`, `country` | Core details |
| `latitude`, `longitude` | Geo-coordinates |
| `rating` | Float, auto-calculated |
| `status` | `PENDING`, `APPROVED`, `REJECTED` (admin-controlled) |
| `images` | String[] — array of image URLs |
| `amenities` | String[] — array of amenity strings |

**Relations:** Agency (owner), Rooms, Bookings, Reviews, Packages

### 3.5 Room

| Field | Notes |
|---|---|
| `type` | Room category (SINGLE, DOUBLE, SUITE, etc.) |
| `price` | Per-night cost |
| `capacity` | Number of guests |
| `amenities`, `images` | String arrays |
| `isAvailable` | Boolean toggle |

**Relations:** Hotel, Bookings

### 3.6 Vehicle (Transport)

| Field | Notes |
|---|---|
| `type` | CAR, BUS, VAN, etc. |
| `make`, `model`, `year`, `capacity` | Vehicle specs |
| `pricePerDay` | Daily rental rate |
| `images` | String[] — image URLs |
| `status` | `PENDING`, `APPROVED`, `REJECTED` (admin-controlled) |
| `isAvailable` | Boolean toggle |

**Relations:** Agency, Bookings, Packages

### 3.7 Package

| Field | Notes |
|---|---|
| `name`, `description`, `price`, `duration` | Core details |
| `startDate` | Trip start date |
| `destinations` | String[] — list of destinations |
| `images` | String[] — media |
| `isActive` | Published/draft toggle |
| `hotelId`, `vehicleId` | Bundled hotel and vehicle |

**Relations:** Agency, Hotel, Vehicle, Bookings, TripGroup (chat room)

### 3.8 TripRequest

| Field | Notes |
|---|---|
| `destination`, `startDate`, `endDate` | Trip details |
| `budget` | Optional budget ceiling |
| `travelers` | Number of people |
| `description` | Additional context |
| `tripSpecs` | JSON — flexible spec object |
| `status` | `PENDING`, `ACCEPTED`, `CANCELLED` |

**Relations:** User, Bids, Booking

### 3.9 Bid

| Field | Notes |
|---|---|
| `price` | Proposed price |
| `description` | Offer summary |
| `offerDetails` | JSON — structured itinerary/inclusions |
| `awaitingActionBy` | `NONE`, `TRAVELER`, `AGENCY` — negotiation turn |
| `status` | `PENDING`, `ACCEPTED`, `REJECTED` |

**Relations:** TripRequest, Agency, Booking, BidRevisions

### 3.10 BidRevision

Tracks the full negotiation history — every counter-offer creates a new revision record with `actorRole`, `actorId`, `price`, `description`, `offerDetails`.

### 3.11 Booking

| Field | Notes |
|---|---|
| `status` | `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` |
| `totalAmount` | Final agreed total |
| `startDate`, `endDate` | Trip dates |
| Links | Can be linked to TripRequest, Bid, Hotel, Room, Vehicle, Package |

**Relations:** User, Agency, TripRequest, Bid, Hotel, Room, Vehicle, Package, Review

### 3.12 Review

Post-booking review with `rating` (1–5) and `comment`. Linked to a specific Booking and Hotel.

### 3.13 TripGroup & TripGroupMember

Group chat rooms that are automatically tied to a Package or TripRequest. Members (travelers) can join and chat together.

### 3.14 Message

Chat messages within a TripGroup. Each message records the `senderType` (`TRAVELER` or `AGENCY`), content, and timestamp.

---

## 4. Backend API

**Base URL:** `http://localhost:3000/api`

### 4.1 Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register/user` | Public | Register a new traveler account |
| POST | `/register/agency` | Public | Register a travel agency with KYC document upload (multipart/form-data) |
| POST | `/login` | Public | Login as any role (traveler / agency / admin). Accepts email+password or Supabase token |
| POST | `/verify-cnic` | Traveler | Verify traveler's CNIC number |
| GET | `/profile` | Authenticated | Get current user's profile |
| POST | `/refresh` | Public | Refresh JWT access token |

### 4.2 User / Traveler Profile (`/api/users`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/profile` | Traveler | Get own profile |
| PUT | `/profile` | Traveler | Update profile fields (name, phone, gender, city, etc.) |
| POST | `/profile/kyc` | Traveler | Submit KYC — uploads CNIC front image + selfie, saves personal + emergency contact details |
| POST | `/profile/avatar` | Traveler | Upload/update profile avatar image |

### 4.3 Trip Requests (`/api/trip-requests`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Traveler | Create a new trip request (destination, dates, budget, traveler count, specs) |
| GET | `/` | All roles | List trip requests (traveler sees own; agency sees open marketplace; admin sees all) |
| GET | `/:id` | All roles | Get trip request detail |
| PUT | `/:id` | Traveler (owner) | Update own trip request |
| DELETE | `/:id` | Traveler (owner) | Cancel a trip request |

### 4.4 Bids (`/api/bids`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Agency (approved) | Submit a bid on a trip request |
| GET | `/` | Agency | List own bids |
| GET | `/trip-request/:tripRequestId` | All authenticated | Get all bids for a specific trip request |
| GET | `/:id` | Traveler/Agency/Admin | Get single bid with full revision history (negotiation thread) |
| POST | `/:id/counteroffer` | Traveler or Agency | Submit a counter-offer on an existing bid |
| POST | `/:id/accept` | Traveler (owner) | Accept a bid — atomically creates a Booking in a DB transaction |

### 4.5 Bookings (`/api/bookings`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | All roles | List bookings (role-filtered: traveler own, agency own, admin all) |
| GET | `/:id` | All roles | Get booking detail |
| POST | `/:id/cancel` | Traveler | Cancel booking (allowed up to 3 days before start date) |
| PUT | `/:id/status` | Agency or Admin | Update booking status (`CONFIRMED`, `CANCELLED`, `COMPLETED`) |

### 4.6 Hotels (`/api/hotels`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Agency or Admin | List hotels |
| GET | `/:id` | Agency or Admin | Get hotel detail |
| POST | `/` | Agency or Admin | Create a new hotel |
| PUT | `/:id` | Agency or Admin | Update hotel details |
| DELETE | `/:id` | Agency or Admin | Delete hotel |
| POST | `/upload-image` | Agency or Admin | Upload hotel image (stored to `/uploads/hotels`) |

### 4.7 Transport (Vehicles) (`/api/transport`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Agency | Add a new vehicle |
| GET | `/` | Agency | List own agency's vehicles |
| GET | `/:id` | Agency | Get vehicle detail |
| PUT | `/:id` | Agency | Update vehicle |
| DELETE | `/:id` | Agency | Delete vehicle |
| POST | `/upload-image` | Agency | Upload vehicle image |

### 4.8 Packages (`/api/packages`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Authenticated | List all active packages (traveler browses marketplace) |
| GET | `/:id` | Authenticated | Get package detail |
| POST | `/` | Agency | Create a new travel package |
| PUT | `/:id` | Agency | Update package |
| DELETE | `/:id` | Agency | Delete package |
| POST | `/:id/apply` | Traveler | Apply/book a package |

### 4.9 Chat (`/api/chat`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/rooms` | Authenticated | List all chat rooms accessible to the caller |
| GET | `/package/:packageId` | Authenticated | Get the chat room linked to a specific package |
| GET | `/rooms/:roomId` | Authenticated | Get a single chat room detail |
| GET | `/rooms/:roomId/messages` | Authenticated | Fetch message history for a room |

### 4.10 Admin (`/api/admin`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/agencies` | Admin | List all agencies (filterable, paginated) |
| POST | `/agencies/:id/approve` | Admin | Approve an agency |
| POST | `/agencies/:id/reject` | Admin | Reject an agency |
| PATCH | `/agencies/:id` | Admin | Update agency profile |
| DELETE | `/agencies/:id` | Admin | Permanently delete agency (cascades hotels/vehicles) |
| GET | `/hotels` | Admin | List all hotels (filterable, paginated) |
| POST | `/hotels/:id/approve` | Admin | Approve a hotel |
| POST | `/hotels/:id/reject` | Admin | Reject a hotel |
| GET | `/vehicles` | Admin | List all vehicles (filterable, paginated) |
| POST | `/vehicles/:id/approve` | Admin | Approve a vehicle |
| POST | `/vehicles/:id/reject` | Admin | Reject a vehicle |
| GET | `/users` | Admin | List all travelers (paginated) |
| POST | `/users/:id/approve` | Admin | Approve traveler KYC submission |
| POST | `/users/:id/reject` | Admin | Reject traveler KYC submission |
| PATCH | `/users/:id` | Admin | Update traveler profile |
| GET | `/reports/dashboard` | Admin | Platform-wide stats (users, agencies, bookings, revenue) |
| GET | `/reports/revenue` | Admin | Revenue chart data (time-series) |
| GET | `/reports/bookings` | Admin | Bookings chart data |
| GET | `/reports/user-growth` | Admin | User growth chart data |

### 4.11 Agency Self-Profile (`/api/agencies`)

Agency-authenticated endpoints for reading/updating the logged-in agency's own profile.

### 4.12 Utility Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check — returns service name and timestamp |
| `GET /health` | Liveness probe for deployment platforms (Render.com) |
| `GET /uploads/*` | Static file serving for uploaded images (KYC, hotel/vehicle media) |

---

## 5. Traveler Mobile App (Flutter)

**Architecture:** Feature-first, Clean Architecture with Provider + ChangeNotifier.

### 5.1 Authentication & Onboarding

- **Login Page** — Email/password login. JWT token stored in SharedPreferences.
- **Registration** — New traveler account creation with email + password.
- **KYC Flow** — After login, un-verified travelers are gated:
  - `TravelerKycPage` — Upload CNIC front image + selfie using `image_picker`. Submit personal details (name, DOB, city, residential address, emergency contact).
  - `TravelerKycPendingPage` — Waiting screen shown while KYC is under admin review.
- **KYC Status Notifications** — App listens for KYC status changes in real-time:
  - `VERIFIED` → snack bar and/or local push notification: "KYC approved. Marketplace unlocked."
  - `REJECTED` → snack bar and/or push notification: "KYC needs update."
- **Persistent Login** — Token is loaded from SharedPreferences on app start.
- **Light/Dark Theme** — User preference persisted across sessions via `ThemeController`.

### 5.2 Home & Navigation

- **Home Page** — Main bottom-navigation scaffold once KYC is verified.
- **Bottom Navigation Tabs**: Home, Trip Requests, Packages, Bookings, Chat, Profile, Reviews.

### 5.3 Trip Requests

- **Create Trip Request** — Form with destination, date range, budget, number of travelers, and detailed specs (JSON).
- **My Trip Requests List** — Displays all requests with their current status (`PENDING`, `ACCEPTED`, `CANCELLED`).
- **View Bids on Request** — List all bids submitted by agencies for a specific trip request.
- **Bid Thread / Negotiation** — Full negotiation view showing the bid history (revisions) with counter-offer capability.
- **Submit Counter-Offer** — Traveler can negotiate price or terms back to the agency.
- **Accept Bid** — One-tap accept that converts the bid into a confirmed booking (atomic backend transaction).
- **Cancel Trip Request** — Cancel an open request.

### 5.4 Packages

- **Package Marketplace** — Browse all active travel packages published by agencies.
- **Package Detail** — View package with name, description, price, duration, destinations, and included hotel/transport.
- **Apply to Package** — Book/apply to a package directly.

### 5.5 Bookings

- **My Bookings List** — View all current and past bookings.
- **Accept Bid → Booking** — Bid acceptance use-case creates a booking and updates the provider.
- **Booking Detail** — View booking status, dates, total amount, and linked assets (hotel, room, vehicle, package).

### 5.6 Chat

- **Trip Group Rooms** — Group chat rooms linked to packages or trip requests.
- **Message History** — Fetch and display message history on room open.
- **Real-Time Messaging** — WebSocket (Socket.IO) connection for live message delivery.
- **SocketIO Client** (`socket_io_client: ^3.1.2`) — Sends/receives messages without polling.

### 5.7 Profile

- **View & Edit Profile** — Name, phone, gender, city, DOB, residential address.
- **Avatar Upload** — Change profile picture via `image_picker`.
- **Emergency Contact** — Store emergency contact name and phone.

### 5.8 Hotels

- **Browse Hotels** — View available hotels.
- **Hotel Detail** — Images, amenities, location, rating, city.

### 5.9 Reviews

- **Post-Booking Review** — Submit a star rating (1–5) + comment for a completed stay.
- **View Reviews** — Read reviews for hotels.

### 5.10 Complaints

- **Complaints Feature** — Scoped module present in code (`features/complaints`), implementation in progress.

### 5.11 Trip Groups

- **Group Chat Membership** — Travelers can be members of a `TripGroup` linked to a package.

### 5.12 Notifications

- **Local Push Notifications** (`flutter_local_notifications`) — Delivered when app is in background for events like KYC status changes.
- **In-App Snack Bar** — Shown when app is in foreground for the same events.

### 5.13 Real-Time Marketplace Updates

- **`MarketplaceLiveService`** — Dedicated WebSocket service that connects on login and broadcasts marketplace events (new bids, status changes) to the UI via `MarketplaceUpdatesCoordinator`.

### 5.14 Core Infrastructure

| Module | Description |
|--------|-------------|
| `ApiClient` | Centralized HTTP client that automatically injects JWT Bearer token on every request |
| `AuthLocalDataSource` | SharedPreferences-based token persistence |
| `NotificationService` | Local notification scheduling wrapper |
| `ThemeController` | Light/Dark mode with persisted preference |

---

## 6. Agency Portal (React)

**Port:** `http://localhost:5173`
**Stack:** React 18.2, TypeScript, Vite, Redux Toolkit, Tailwind CSS

### 6.1 Authentication

- **Login Form** — Email/password login. JWT stored in localStorage.
- **Register Form** — Agency registration with business details, KYC document uploads.
- **Pending Approval Screen** — Shown after registration while admin reviews the application.
- **Protected Routes** — All dashboard routes redirect to `/login` if unauthenticated. Agencies with `PENDING` status are redirected to `/pending-approval`.
- **Auto Session Restore** — On page load, existing token triggers a `getProfile` call to restore session.

### 6.2 Dashboard (`/dashboard`)

- Key metrics overview (bookings, revenue, trip requests, etc.)

### 6.3 Hotels (`/hotels`)

- **Hotel List** — View, search, and manage registered hotels.
- **Add Hotel** `/hotels/new` — Create hotel with name, description, address, city, country, amenities, images.
- **Edit Hotel** `/hotels/:id/edit` — Update hotel details.
- **Image Upload** — Upload hotel photos to the backend.

### 6.4 Transport / Vehicles (`/transport`)

- **Vehicle List** — View all agency vehicles with status badges.
- **Add Vehicle** `/transport/new` — Register vehicle with type, make, model, year, capacity, price/day, images.
- **Edit Vehicle** `/transport/:id/edit` — Update vehicle details.

### 6.5 Packages (`/packages`)

- **Package List** — Browse/manage agency's travel packages.
- **Create Package** `/packages/new` — Build a package with name, description, price, duration, destinations, hotel/vehicle.
- **Edit Package** `/packages/:id/edit` — Update existing packages.

### 6.6 Trip Requests (`/trip-requests`)

- **Marketplace View** — See open trip requests from travelers.
- **Submit Bid** — Place a bid on any open traveler request with price and offer details.
- **Counter-Offer** — Negotiate with traveler by submitting revised bids.

### 6.7 Bookings (`/bookings`)

- **Booking List** — View all agency bookings.
- **Update Booking Status** — Mark bookings as Confirmed, Cancelled, or Completed.

### 6.8 Chat (`/chat`)

- **Room List** — View all linked chat rooms (package groups).
- **Real-Time Messaging** — Live bidirectional messaging with travelers via Socket.IO.

---

## 7. Admin Portal (React)

**Port:** `http://localhost:5174`
**Stack:** React 18.2, TypeScript, Vite, Redux Toolkit, Tailwind CSS

### 7.1 Authentication

- **Admin Login Form** — Dedicated admin login at `/login`.
- **Protected Routes** — All pages behind `ProtectedRoute` guard.

### 7.2 Dashboard (`/dashboard`)

- Platform-wide statistics (total users, agencies, bookings, revenue).
- Quick-access to pending approval counts.

### 7.3 Agency Management (`/agencies`)

- **Agency List** — View all registered agencies with status badges (`PENDING`, `APPROVED`, `REJECTED`).
- **Approve Agency** — One-click approval; agency gains access to the platform.
- **Reject Agency** — Reject with optional reason.
- **Delete Agency** — Permanent deletion with cascade (removes hotels, vehicles, packages).
- **Edit Agency Profile** — Update agency fields.
- **KYC Document Preview** — View uploaded CNIC, owner photo, license certificate, NTN certificate, business registration proof, bank certificate.

### 7.4 User / Traveler Management (`/travelers`)

- **User List** — View all registered travelers with KYC status.
- **Approve Traveler KYC** — Grant access to marketplace (sets status → `VERIFIED`).
- **Reject Traveler KYC** — Request resubmission (sets status → `REJECTED`).
- **Edit Traveler Profile** — Admin can update traveler fields.

### 7.5 Inventory (`/inventory`)

Combined view for managing:
- **Hotels** — List all hotels across all agencies; approve/reject individual hotels.
- **Vehicles** — List all vehicles across all agencies; approve/reject individual vehicles.

> Legacy routes `/hotels` and `/vehicles` redirect to `/inventory` with appropriate type filter.

### 7.6 Analytics & Reports (`/analytics`)

- **Report Dashboard** — Charts and KPI tiles.
- **Revenue Chart** — Time-series revenue data.
- **Bookings Chart** — Bookings over time.
- **User Growth Chart** — New user registrations over time.

> Legacy routes `/reports` and `/activity` redirect to `/analytics`.

---

## 8. Real-Time Features (Socket.IO)

The backend runs a Socket.IO server co-located with the Express HTTP server.

### 8.1 Socket Server Architecture

| File | Responsibility |
|------|---------------|
| `socket.server.ts` | Initializes Socket.IO, attaches auth middleware, routes events |
| `chat.socket.ts` | Handles all chat room events (join, message, leave) |
| `socket.emitter.ts` | Server-side event emitter utility for broadcasting marketplace events |
| `socket.rooms.ts` | Room name helpers (e.g., `trip-request:{id}`, `package:{id}`) |

### 8.2 Real-Time Events

| Event Direction | Event | Description |
|----------------|-------|-------------|
| Server → Client | `new-bid` | Notifies traveler when an agency submits a bid on their request |
| Server → Client | `bid-accepted` | Notifies agency when traveler accepts their bid |
| Server → Client | `new-message` | Delivers chat message to all room members |
| Client → Server | `join-room` | Client subscribes to a chat room |
| Client → Server | `send-message` | Client sends a chat message |
| Client → Server | `leave-room` | Client unsubscribes from a chat room |

### 8.3 Socket Authentication

JWT token is validated on socket connection via the same `authenticate` middleware used by REST routes.

---

## 9. Cross-Cutting Concerns

### 9.1 Authentication & Authorization

- **JWT-based auth** — Every protected REST route requires a `Bearer <token>` header.
- **Role-based access control (RBAC)** — Three roles: `TRAVELER`, `AGENCY`, `ADMIN`.
- **Middleware chain:**
  - `authenticate` — Verifies JWT, attaches `req.user` with role.
  - `requireTraveler` — Restricts to traveler role only.
  - `requireAgency` — Restricts to approved agencies only.
  - `requireAdmin` — Restricts to admin role only.
  - `requireAgencyOrAdmin` — Allows either agency or admin.

### 9.2 KYC (Know Your Customer) Workflow

```
Traveler Registers
      ↓
KYC Form: Upload CNIC + Selfie + Personal Info
      ↓
Status: NOT_SUBMITTED → PENDING (admin review queue)
      ↓
Admin Reviews KYC Documents
      ↓
   APPROVED?
   ↙          ↘
VERIFIED     REJECTED
(Marketplace  (Traveler notified
  unlocked)    to resubmit)
```

For Agencies:
```
Agency Registers (with KYC docs: CNIC, NTN, License, etc.)
      ↓
Status: PENDING (admin review queue)
      ↓
Admin Approves/Rejects
      ↓
Approved agencies can list hotels, vehicles, packages, and bid
```

### 9.3 Trip Lifecycle (Core Business Flow)

```
Traveler creates TripRequest (PENDING)
      ↓
Agencies see request in marketplace
      ↓
Agency submits Bid (PENDING)
      ↓
[Optional] Counter-offer negotiation (BidRevisions created)
      ↓
Traveler accepts Bid → Booking created (PENDING)
      ↓
Agency updates Booking → CONFIRMED
      ↓
Trip happens
      ↓
Agency marks → COMPLETED
      ↓
Traveler submits Review
```

### 9.4 File Upload & Storage

- **Upload middleware** — Multer-based middleware handling multipart/form-data.
- **KYC documents** — Stored at `/uploads/kyc-*` directories.
- **Hotel images** — Stored at `/uploads/hotels`.
- **Vehicle images** — Stored at `/uploads/vehicles`.
- **Traveler avatars** — Stored at `/uploads/traveler-avatars`.
- **Static file serving** — `GET /uploads/*` serves files directly.

### 9.5 Validation

- **Zod schemas** on all backend request bodies (user register, agency register, login, profile update, KYC submit).
- `validateBody()` middleware validates and provides typed request bodies.

### 9.6 Error Handling

- **`errorHandler` middleware** — Catches all uncaught errors, returns standardized JSON error responses.
- **`notFoundHandler`** — Returns 404 for unknown routes.

### 9.7 CORS Configuration

- Configurable via `CORS_ORIGIN` env var.
- Dev mode automatically allows `localhost:5173` (agency) and `localhost:5174` (admin).
- Mobile app (no origin header) is allowed through.

### 9.8 Deployment

- **Render.com** — Backend configured with `render.yaml` for cloud deployment.
- **Root health probe** — `GET /` and `GET /health` respond for Render health checks.

---

## 10. Pending & Roadmap Items

Based on `TODO.md` and code analysis:

### Admin Portal
- [ ] User account suspend/deactivate controls
- [ ] KYC document review UI (view and approve/reject traveler documents in-portal)
- [ ] System activity logs dashboard

### Agency Portal
- [ ] Tour package creation workflow (itineraries, pricing tiers, inclusions — currently placeholder)
- [ ] Booking management detail views + status update UI
- [ ] Trip Requests & Bids module finalization
- [ ] Hotel room management — availability calendars and seasonal pricing

### Traveler Mobile App
- [ ] Resolve 150+ `TODO` code items in Flutter codebase
- [ ] Full Socket.IO chat integration in Flutter UI
- [ ] Payment integration (Stripe/JazzCash)
- [ ] Push notification provider setup (FCM/APNs)
- [ ] Complaints feature completion

### Backend
- [ ] Advanced hotel/vehicle search with filters (price range, amenities, availability)
- [ ] Email service (Nodemailer) for welcome emails and booking confirmations
- [ ] File storage migration from local disk → AWS S3 or Supabase Storage

---

*Generated by analyzing: `backend/prisma/schema.prisma`, `backend/src/**/*.routes.ts`, `backend/src/server.ts`, `traveler-app/trekpal/lib/main.dart`, `agency-portal/src/App.tsx`, `admin-portal/src/App.tsx`, and all feature directories.*
