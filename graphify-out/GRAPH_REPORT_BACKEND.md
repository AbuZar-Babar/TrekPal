# Graph Report - backend  (2026-04-27)

## Corpus Check
- Corpus is ~42,099 words - fits in a single context window. You may not need a graph.

## Summary
- 586 nodes · 1038 edges · 72 communities detected
- Extraction: 64% EXTRACTED · 35% INFERRED · 1% AMBIGUOUS · INFERRED: 362 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin Controller (Approvals)|Admin Controller (Approvals)]]
- [[_COMMUNITY_Auth Middleware & Services|Auth Middleware & Services]]
- [[_COMMUNITY_Admin Service (Logic)|Admin Service (Logic)]]
- [[_COMMUNITY_Real-time & Bidding System|Real-time & Bidding System]]
- [[_COMMUNITY_KYC & User Media Services|KYC & User Media Services]]
- [[_COMMUNITY_Trip Request & Migration|Trip Request & Migration]]
- [[_COMMUNITY_Inventory Services (HotelsPackagesTransport)|Inventory Services (Hotels/Packages/Transport)]]
- [[_COMMUNITY_Admin Infrastructure|Admin Infrastructure]]
- [[_COMMUNITY_Auth API Layer|Auth API Layer]]
- [[_COMMUNITY_Hotel Management API|Hotel Management API]]
- [[_COMMUNITY_Repository Interfaces & Shared Types|Repository Interfaces & Shared Types]]
- [[_COMMUNITY_Trip Request Controller|Trip Request Controller]]
- [[_COMMUNITY_Real-time Socket Utils|Real-time Socket Utils]]
- [[_COMMUNITY_Auth Registration & Profile|Auth Registration & Profile]]
- [[_COMMUNITY_Chat Service Logic|Chat Service Logic]]
- [[_COMMUNITY_Bidding Controller|Bidding Controller]]
- [[_COMMUNITY_Agency Repository (Prisma)|Agency Repository (Prisma)]]
- [[_COMMUNITY_Admin Repository (Prisma)|Admin Repository (Prisma)]]
- [[_COMMUNITY_Hotel Repository (Prisma)|Hotel Repository (Prisma)]]
- [[_COMMUNITY_User Repository (Prisma)|User Repository (Prisma)]]
- [[_COMMUNITY_Socket Rooms Chat Room Name|Socket Rooms Chat Room Name]]
- [[_COMMUNITY_Kycstorage Createsignedkycurl|Kycstorage Createsignedkycurl ]]
- [[_COMMUNITY_Backend Src Middlewares Valida|Backend Src Middlewares Valida]]
- [[_COMMUNITY_Agency Controller Module|Agency Controller Module]]
- [[_COMMUNITY_Backend Src Middlewares Error|Backend Src Middlewares Error ]]
- [[_COMMUNITY_Admin Types Optionaltrimmedreq|Admin Types Optionaltrimmedreq]]
- [[_COMMUNITY_Kycfile Resolvekycmimetype Fn|Kycfile Resolvekycmimetype Fn]]
- [[_COMMUNITY_Socket Server Allowed Origins|Socket Server Allowed Origins]]
- [[_COMMUNITY_Backend Scripts Db Counts Ts|Backend Scripts Db Counts Ts]]
- [[_COMMUNITY_Backend Src Config Constants T|Backend Src Config Constants T]]
- [[_COMMUNITY_Backend Src Config Database Ts|Backend Src Config Database Ts]]
- [[_COMMUNITY_Backend Src Middlewares Rolegu|Backend Src Middlewares Rolegu]]
- [[_COMMUNITY_Auth Types Parsestringarray|Auth Types Parsestringarray]]
- [[_COMMUNITY_Kycfile Inferextension Fn|Kycfile Inferextension Fn]]
- [[_COMMUNITY_Backend Create Env Js|Backend Create Env Js]]
- [[_COMMUNITY_Backend Src Server Ts|Backend Src Server Ts]]
- [[_COMMUNITY_Backend Src Config Env Ts|Backend Src Config Env Ts]]
- [[_COMMUNITY_Backend Src Modules Admin Admi|Backend Src Modules Admin Admi]]
- [[_COMMUNITY_Backend Src Modules Agency Age|Backend Src Modules Agency Age]]
- [[_COMMUNITY_Backend Src Modules Agency Age|Backend Src Modules Agency Age]]
- [[_COMMUNITY_Backend Src Modules Agency Age|Backend Src Modules Agency Age]]
- [[_COMMUNITY_Backend Src Modules Agency Age|Backend Src Modules Agency Age]]
- [[_COMMUNITY_Backend Src Modules Auth Auth|Backend Src Modules Auth Auth ]]
- [[_COMMUNITY_Backend Src Modules Bids Bid R|Backend Src Modules Bids Bid R]]
- [[_COMMUNITY_Backend Src Modules Bids Bids|Backend Src Modules Bids Bids ]]
- [[_COMMUNITY_Backend Src Modules Bookings B|Backend Src Modules Bookings B]]
- [[_COMMUNITY_Backend Src Modules Bookings B|Backend Src Modules Bookings B]]
- [[_COMMUNITY_Backend Src Modules Bookings B|Backend Src Modules Bookings B]]
- [[_COMMUNITY_Backend Src Modules Chat Chat|Backend Src Modules Chat Chat ]]
- [[_COMMUNITY_Backend Src Modules Chat Chat|Backend Src Modules Chat Chat ]]
- [[_COMMUNITY_Backend Src Modules Hotels Hot|Backend Src Modules Hotels Hot]]
- [[_COMMUNITY_Backend Src Modules Hotels Hot|Backend Src Modules Hotels Hot]]
- [[_COMMUNITY_Backend Src Modules Packages P|Backend Src Modules Packages P]]
- [[_COMMUNITY_Backend Src Modules Packages P|Backend Src Modules Packages P]]
- [[_COMMUNITY_Backend Src Modules Transport|Backend Src Modules Transport ]]
- [[_COMMUNITY_Backend Src Modules Transport|Backend Src Modules Transport ]]
- [[_COMMUNITY_Backend Src Modules Tripreques|Backend Src Modules Tripreques]]
- [[_COMMUNITY_Backend Src Modules Tripreques|Backend Src Modules Tripreques]]
- [[_COMMUNITY_Backend Src Modules Users User|Backend Src Modules Users User]]
- [[_COMMUNITY_Backend Src Modules Users User|Backend Src Modules Users User]]
- [[_COMMUNITY_Backend Src Repositories Index|Backend Src Repositories Index]]
- [[_COMMUNITY_Backend Src Repositories Inter|Backend Src Repositories Inter]]
- [[_COMMUNITY_Backend Src Repositories Inter|Backend Src Repositories Inter]]
- [[_COMMUNITY_Backend Src Repositories Inter|Backend Src Repositories Inter]]
- [[_COMMUNITY_Backend Src Repositories Inter|Backend Src Repositories Inter]]
- [[_COMMUNITY_Backend Src Repositories Inter|Backend Src Repositories Inter]]
- [[_COMMUNITY_Backend Src Repositories Inter|Backend Src Repositories Inter]]
- [[_COMMUNITY_Backend Src Types Express D Ts|Backend Src Types Express D Ts]]
- [[_COMMUNITY_Backend Src Utils Logger Util|Backend Src Utils Logger Util ]]
- [[_COMMUNITY_Error Geterrorcode Fn|Error Geterrorcode Fn]]
- [[_COMMUNITY_Kycfile Isallowedkycfile Fn|Kycfile Isallowedkycfile Fn]]
- [[_COMMUNITY_Response Sendsuccess Fn|Response Sendsuccess Fn]]

## God Nodes (most connected - your core abstractions)
1. `sendError()` - 67 edges
2. `sendSuccess()` - 66 edges
3. `AdminService` - 27 edges
4. `AdminController` - 20 edges
5. `AuthService` - 19 edges
6. `getSupabaseAdminClient()` - 14 edges
7. `ChatService` - 14 edges
8. `main()` - 12 edges
9. `isHttpUrl()` - 11 edges
10. `PrismaAgencyRepository` - 10 edges

## Surprising Connections (you probably didn't know these)
- `emitOfferUpdated()` --calls--> `offersRoomName()`  [INFERRED]
  backend\src\ws\socket.emitter.ts → backend\src\ws\socket.rooms.ts
- `findAuthUserByEmail()` --calls--> `getSupabaseAdminClient()`  [INFERRED]
  backend\prisma\seed.ts → backend\src\config\supabase.ts
- `ensureAuthUser()` --calls--> `getSupabaseAdminClient()`  [INFERRED]
  backend\prisma\seed.ts → backend\src\config\supabase.ts
- `main()` --calls--> `getSupabaseAdminClient()`  [INFERRED]
  backend\scripts\ensure-kyc-bucket.ts → backend\src\config\supabase.ts
- `main()` --calls--> `uploadKycFile()`  [INFERRED]
  backend\scripts\migrate-kyc-local-to-supabase.ts → backend\src\services\kyc-storage.service.ts

## Hyperedges (group relationships)
- **KYC Storage Transition Flow** — ensure_kyc_bucket_private_bucket, migrate_kyc_local_urls_migration, admin_service_repository_orchestrator [INFERRED 0.74]
- **Admin Request Enforcement Stack** — admin_routes_admin_surface, auth_middleware_dual_token_verifier, role_guard_rbac_enforcer, admin_controller_request_orchestrator [EXTRACTED 1.00]
- **Auth Request Handling Flow** — auth_routes_router, auth_controller_class, auth_service_class, auth_types_contracts [EXTRACTED 1.00]
- **Bid Acceptance To Booking Creation** — bids_controller_class, bids_service_class, bookings_service_class [INFERRED 0.78]
- **Confirmed Booking Enables Chat Access** — bookings_service_class, chat_service_class, chat_package_room_gating [INFERRED 0.74]
- **Controller Actor Resolution Pattern** — hotels_controller_get_actor, packages_controller_get_actor, transport_controller_dev_agency_upsert [INFERRED 0.72]
- **Duplicate Route File TODO Surface** — triprequest_routes_router, triprequests_routes_todo, user_routes_router, users_routes_todo [INFERRED 0.64]
- **Media Upload and Signed URL Pipeline** — hotels_controller_class, transport_controller_class, users_service_kyc_submission [INFERRED 0.79]
- **Repository Contract Implementation Set** — irepository_interface, iagencyrepository_interface, ihotelrepository_interface, iuserrepository_interface, ivehiclerepository_interface, iadminrepository_interface, prismaagencyrepository_class, prismahotelrepository_class, prismauserrepository_class, prismavehiclerepository_class, prismaadminrepository_class [INFERRED 0.91]
- **KYC and Media MIME Resolution Pipeline** — kycfile_resolvekycmimetype_fn, kycstorage_uploadkycfile_fn, mediastorage_uploadmediafile_fn [EXTRACTED 1.00]
- **Traveler Realtime Notification Flow** — chat_initializechatsocket_fn, socketemitter_emittravelerbidupdated_fn, socketemitter_emittravelerbookingupdated_fn, socket_rooms_naming [INFERRED 0.84]
- **Socket Room Naming Scheme** — socket_rooms_chat_room_name, socket_rooms_traveler_room_name, socket_rooms_offers_room_name [EXTRACTED 1.00]
- **Socket Server Bootstrap Pipeline** — socket_server_initialize_socket_server, socket_server_register_socket_server, socket_server_initialize_chat_socket [EXTRACTED 1.00]
- **Repository Pattern POC Bundle** — repository_pattern_admin_poc, repository_pattern_dependency_injection, admin_service_repository_orchestrator [EXTRACTED 1.00]

## Communities

### Community 0 - "Admin Controller (Approvals)"
Cohesion: 0.07
Nodes (11): AdminController, BookingsController, ChatController, resolveStatusCode(), HotelsController, PackagesController, sendError(), sendSuccess() (+3 more)

### Community 1 - "Auth Middleware & Services"
Cohesion: 0.11
Nodes (17): authenticate(), normalizeRole(), AuthService, main(), generateJWT(), verifyJWT(), ensureAuthUser(), findAuthUserByEmail() (+9 more)

### Community 2 - "Admin Service (Logic)"
Cohesion: 0.11
Nodes (2): AdminService, PrismaVehicleRepository

### Community 3 - "Real-time & Bidding System"
Cohesion: 0.08
Nodes (19): BidsService, getCounterOfferState(), mapBid(), mapBidRevision(), normalizeAwaitingAction(), normalizeOfferDetails(), BookingsService, buildInitials() (+11 more)

### Community 4 - "KYC & User Media Services"
Cohesion: 0.11
Nodes (20): inferKycExtensionFromMimeType(), inferKycMimeTypeFromFilename(), isAllowedKycFile(), normalizeKycMimeType(), resolveKycMimeType(), createSignedKycUrl(), deleteKycFile(), isHttpUrl() (+12 more)

### Community 5 - "Trip Request & Migration"
Cohesion: 0.12
Nodes (25): extractFilenameFromLocalUrl(), findAgenciesWithLocalKycUrls(), inferMimeType(), isLocalKycUrl(), main(), toObjectPath(), ensureAuthUser(), findAuthUserByEmail() (+17 more)

### Community 6 - "Inventory Services (Hotels/Packages/Transport)"
Cohesion: 0.11
Nodes (13): HotelsService, mapHotel(), normalizeMediaStoragePaths(), resolveMediaUrls(), buildInitials(), deriveAge(), mapPackage(), mapParticipant() (+5 more)

### Community 7 - "Admin Infrastructure"
Cohesion: 0.11
Nodes (25): Admin Controller Request Orchestrator, Admin Routes Surface, Admin Service Repository Orchestrator, Admin Contract Schemas, Dual Token Authentication Middleware, Role And Status Taxonomy, Environment Template Generator, Prisma Singleton Client (+17 more)

### Community 8 - "Auth API Layer"
Cohesion: 0.12
Nodes (23): AuthController Class, Agency KYC Upload And Cleanup Flow, Auth Role To Profile Mapping, Auth Router, AuthService Class, Auth Types And Validation Schemas, Bid Routes Router, BidsController Class (+15 more)

### Community 9 - "Hotel Management API"
Cohesion: 0.13
Nodes (21): Hotels Router, HotelsController, HotelsController.getActor, HotelsService, mapHotel, HotelResponse Type, Hotel Zod Schemas, PackagesController (+13 more)

### Community 10 - "Repository Interfaces & Shared Types"
Cohesion: 0.18
Nodes (17): AgencyWithCounts Type, HotelWithRelations Type, IAdminRepository Interface, IAgencyRepository Interface, IHotelRepository Interface, IRepository Interface, IUserRepository Interface, IVehicleRepository Interface (+9 more)

### Community 11 - "Trip Request Controller"
Cohesion: 0.15
Nodes (16): TripRequests Router (singular file), TripRequestsController, Role-Based TripRequest Filtering, TripRequests Routes TODO Placeholder, TripRequestsService, TripRequest Update Guardrails, TripRequest Zod Schemas, TripSpecs Schema and Normalizer (+8 more)

### Community 12 - "Real-time Socket Utils"
Cohesion: 0.16
Nodes (16): emitChatError Function, getSocketToken Function, initializeChatSocket Function, Chat Service API, getErrorMessage Function, Express Request User Extension, generateJWT Function, verifyJWT Function (+8 more)

### Community 13 - "Auth Registration & Profile"
Cohesion: 0.22
Nodes (9): AuthController, buildKycObjectPath(), getAuthErrorStatusCode(), requiredAgencyFileFields(), getErrorCode(), getErrorMessage(), hasErrorCode(), hasErrorMessage() (+1 more)

### Community 14 - "Chat Service Logic"
Cohesion: 0.24
Nodes (1): ChatService

### Community 15 - "Bidding Controller"
Cohesion: 0.44
Nodes (2): BidsController, resolveStatusCode()

### Community 16 - "Agency Repository (Prisma)"
Cohesion: 0.2
Nodes (1): PrismaAgencyRepository

### Community 17 - "Admin Repository (Prisma)"
Cohesion: 0.2
Nodes (1): PrismaAdminRepository

### Community 18 - "Hotel Repository (Prisma)"
Cohesion: 0.25
Nodes (1): PrismaHotelRepository

### Community 19 - "User Repository (Prisma)"
Cohesion: 0.25
Nodes (1): PrismaUserRepository

### Community 20 - "Socket Rooms Chat Room Name"
Cohesion: 0.31
Nodes (9): chatRoomName, offersRoomName, travelerRoomName, env.CORS_ORIGIN, env.NODE_ENV, initializeChatSocket, initializeSocketServer, registerSocketServer (+1 more)

### Community 21 - "Kycstorage Createsignedkycurl "
Cohesion: 0.4
Nodes (6): createSignedKycUrl Function, deleteKycFile Function, isHttpUrl Function, createSignedMediaUrl Function, normalizeMediaStoragePath Function, resolveMediaUrls Function

### Community 22 - "Backend Src Middlewares Valida"
Cohesion: 0.4
Nodes (0): 

### Community 23 - "Agency Controller Module"
Cohesion: 0.5
Nodes (4): Agency Controller Module, Agency Routes Module, Agency Service Module, Agency Types Module

### Community 24 - "Backend Src Middlewares Error "
Cohesion: 0.67
Nodes (0): 

### Community 25 - "Admin Types Optionaltrimmedreq"
Cohesion: 0.67
Nodes (0): 

### Community 26 - "Kycfile Resolvekycmimetype Fn"
Cohesion: 0.67
Nodes (3): resolveKycMimeType Function, uploadKycFile Function, uploadMediaFile Function

### Community 27 - "Socket Server Allowed Origins"
Cohesion: 0.67
Nodes (3): allowedOrigins, configuredOrigins, Socket.IO CORS Origin Callback

### Community 28 - "Backend Scripts Db Counts Ts"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Backend Src Config Constants T"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Backend Src Config Database Ts"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Backend Src Middlewares Rolegu"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Auth Types Parsestringarray"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Kycfile Inferextension Fn"
Cohesion: 1.0
Nodes (2): inferKycExtensionFromMimeType Function, buildMediaObjectPath Function

### Community 34 - "Backend Create Env Js"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Backend Src Server Ts"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Backend Src Config Env Ts"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Backend Src Modules Admin Admi"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Backend Src Modules Agency Age"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Backend Src Modules Agency Age"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Backend Src Modules Agency Age"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Backend Src Modules Agency Age"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Backend Src Modules Auth Auth "
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Backend Src Modules Bids Bid R"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Backend Src Modules Bids Bids "
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Backend Src Modules Bookings B"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Backend Src Modules Bookings B"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Backend Src Modules Bookings B"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Backend Src Modules Chat Chat "
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Backend Src Modules Chat Chat "
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Backend Src Modules Hotels Hot"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Backend Src Modules Hotels Hot"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Backend Src Modules Packages P"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Backend Src Modules Packages P"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Backend Src Modules Transport "
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Backend Src Modules Transport "
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Backend Src Modules Tripreques"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Backend Src Modules Tripreques"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Backend Src Modules Users User"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Backend Src Modules Users User"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Backend Src Repositories Index"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Backend Src Repositories Inter"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "Backend Src Repositories Inter"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Backend Src Repositories Inter"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Backend Src Repositories Inter"
Cohesion: 1.0
Nodes (0): 

### Community 65 - "Backend Src Repositories Inter"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "Backend Src Repositories Inter"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "Backend Src Types Express D Ts"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "Backend Src Utils Logger Util "
Cohesion: 1.0
Nodes (0): 

### Community 69 - "Error Geterrorcode Fn"
Cohesion: 1.0
Nodes (1): getErrorCode Function

### Community 70 - "Kycfile Isallowedkycfile Fn"
Cohesion: 1.0
Nodes (1): isAllowedKycFile Function

### Community 71 - "Response Sendsuccess Fn"
Cohesion: 1.0
Nodes (1): sendSuccess Function

## Ambiguous Edges - Review These
- `Dual Token Authentication Middleware` → `Supabase Auth Reference Model`  [AMBIGUOUS]
  backend/docs/MANUAL_ADMIN_CREATION.md · relation: conceptually_related_to
- `Agency Controller Module` → `Agency Service Module`  [AMBIGUOUS]
  backend/src/modules/agency/agency.controller.ts · relation: conceptually_related_to
- `Agency Controller Module` → `Agency Routes Module`  [AMBIGUOUS]
  backend/src/modules/agency/agency.routes.ts · relation: references
- `Agency Service Module` → `Agency Types Module`  [AMBIGUOUS]
  backend/src/modules/agency/agency.service.ts · relation: shares_data_with
- `Bid Routes Router` → `Bids Routes Placeholder`  [AMBIGUOUS]
  backend/src/modules/bids/bids.routes.ts · relation: conceptually_related_to
- `Booking Routes Router` → `Bookings Routes Placeholder`  [AMBIGUOUS]
  backend/src/modules/bookings/bookings.routes.ts · relation: conceptually_related_to
- `TripRequests Router (singular file)` → `TripRequests Routes TODO Placeholder`  [AMBIGUOUS]
  backend/src/modules/tripRequests/tripRequests.routes.ts · relation: conceptually_related_to
- `Users Router (singular file)` → `Users Routes TODO Placeholder`  [AMBIGUOUS]
  backend/src/modules/users/users.routes.ts · relation: conceptually_related_to
- `logger Utility Object` → `initializeChatSocket Function`  [AMBIGUOUS]
  backend/src/utils/logger.util.ts · relation: conceptually_related_to
- `sendError Function` → `emitChatError Function`  [AMBIGUOUS]
  backend/src/utils/response.util.ts · relation: conceptually_related_to
- `travelerRoomName` → `initializeChatSocket`  [AMBIGUOUS]
  backend/src/ws/socket.rooms.ts · relation: shares_data_with
- `offersRoomName` → `initializeChatSocket`  [AMBIGUOUS]
  backend/src/ws/socket.rooms.ts · relation: shares_data_with

## Knowledge Gaps
- **49 isolated node(s):** `Environment Template Generator`, `Database Table Count Snapshot`, `Prisma Singleton Client`, `KYC And Media Upload Filters`, `Zod Request Validation Guards` (+44 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Backend Scripts Db Counts Ts`** (2 nodes): `db-counts.ts`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Config Constants T`** (2 nodes): `constants.ts`, `normalizeTravelerKycStatus()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Config Database Ts`** (2 nodes): `database.ts`, `prismaClientSingleton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Middlewares Rolegu`** (2 nodes): `roleGuard.middleware.ts`, `requireRole()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Types Parsestringarray`** (2 nodes): `parseStringArray()`, `auth.types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Kycfile Inferextension Fn`** (2 nodes): `inferKycExtensionFromMimeType Function`, `buildMediaObjectPath Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Create Env Js`** (1 nodes): `create-env.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Server Ts`** (1 nodes): `server.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Config Env Ts`** (1 nodes): `env.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Admin Admi`** (1 nodes): `admin.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Agency Age`** (1 nodes): `agency.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Agency Age`** (1 nodes): `agency.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Agency Age`** (1 nodes): `agency.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Agency Age`** (1 nodes): `agency.types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Auth Auth `** (1 nodes): `auth.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Bids Bid R`** (1 nodes): `bid.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Bids Bids `** (1 nodes): `bids.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Bookings B`** (1 nodes): `booking.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Bookings B`** (1 nodes): `bookings.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Bookings B`** (1 nodes): `bookings.types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Chat Chat `** (1 nodes): `chat.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Chat Chat `** (1 nodes): `chat.types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Hotels Hot`** (1 nodes): `hotel.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Hotels Hot`** (1 nodes): `hotels.types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Packages P`** (1 nodes): `packages.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Packages P`** (1 nodes): `packages.types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Transport `** (1 nodes): `transport.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Transport `** (1 nodes): `transport.types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Tripreques`** (1 nodes): `tripRequest.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Tripreques`** (1 nodes): `tripRequests.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Users User`** (1 nodes): `user.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Modules Users User`** (1 nodes): `users.routes.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Repositories Index`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Repositories Inter`** (1 nodes): `IAdminRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Repositories Inter`** (1 nodes): `IAgencyRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Repositories Inter`** (1 nodes): `IHotelRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Repositories Inter`** (1 nodes): `IRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Repositories Inter`** (1 nodes): `IUserRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Repositories Inter`** (1 nodes): `IVehicleRepository.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Types Express D Ts`** (1 nodes): `express.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend Src Utils Logger Util `** (1 nodes): `logger.util.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Error Geterrorcode Fn`** (1 nodes): `getErrorCode Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Kycfile Isallowedkycfile Fn`** (1 nodes): `isAllowedKycFile Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Response Sendsuccess Fn`** (1 nodes): `sendSuccess Function`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Dual Token Authentication Middleware` and `Supabase Auth Reference Model`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Agency Controller Module` and `Agency Service Module`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Agency Controller Module` and `Agency Routes Module`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Agency Service Module` and `Agency Types Module`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `Bid Routes Router` and `Bids Routes Placeholder`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Booking Routes Router` and `Bookings Routes Placeholder`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `TripRequests Router (singular file)` and `TripRequests Routes TODO Placeholder`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._