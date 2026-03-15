# TrekPal Project Handoff and TODO

This file is the single source of truth for TrekPal's current status and next steps. Future AI agents should read this file first before making changes. Checklist items reflect the actual repository state observed on March 15, 2026, not just the planned scope from the SRS/SDD.

## Project Summary
TrekPal is a travel management ecosystem with three core actors: Traveler, Agency, and Admin.
The system is split across a Flutter traveler app, a React agency portal, a React admin portal, and a Node.js/Express backend with Prisma and PostgreSQL.
The main business flow is: a traveler creates a trip request, agencies submit bids, the traveler accepts one bid, and the platform creates bookings.
Agencies can also manage hotels and vehicles, while admins review and approve agencies, hotels, and vehicles before they become active.
The backend already has a shared data model for users, agencies, trip requests, bids, bookings, reviews, and chat-related entities.
The admin portal already supports agency review, vehicle review, user listing, and analytics/reporting.
The agency portal now includes a Pakistan-specific registration and document application flow.
The traveler mobile app is still mostly a scaffold and does not yet provide the full traveler journey end-to-end.
Per the SRS constraint `CO-4`, payment integration is not part of the core project scope.

## Scope From SRS

### Traveler Functionalities
- [ ] FR-USER-01 User Registration
- [ ] FR-USER-02 Traveler Login
- [ ] FR-USER-03 Identity Verification
- [ ] FR-USER-04 Search Hotels
- [ ] FR-USER-05 Search Transport
- [ ] FR-USER-06 Create Trip Request
- [ ] FR-USER-07 View Bids
- [ ] FR-USER-08 Accept Bid
- [ ] FR-USER-09 Join Group Trip
- [ ] FR-USER-10 Submit Review

### Agency Functionalities
- [x] FR-AGENCY-01 Agency Registration
- [x] FR-AGENCY-02 Agency Verification
- [ ] FR-AGENCY-03 Manage Hotels
- [ ] FR-AGENCY-04 Manage Rooms & Menus
- [x] FR-AGENCY-05 Manage Vehicles
- [ ] FR-AGENCY-06 Manage Vehicle Availability
- [ ] FR-AGENCY-07 View Trip Requests
- [ ] FR-AGENCY-08 Submit Bid
- [ ] FR-AGENCY-09 Manage Accepted Bookings
- [ ] FR-AGENCY-10 Create Tour Packages

### Admin Functionalities
- [x] FR-ADMIN-01 Approve/Reject Agency Registration
- [ ] FR-ADMIN-02 Approve/Reject Hotels
- [x] FR-ADMIN-03 Approve/Reject Vehicles
- [ ] FR-ADMIN-04 Approve Traveler Verification
- [ ] FR-ADMIN-05 Moderate Content
- [x] FR-ADMIN-06 View Analytics
- [ ] FR-ADMIN-07 Block/Unblock Accounts

## Current Implementation Status

### Backend
Completed
- [x] Authentication foundation for agency, traveler, and admin roles
- [x] Admin agency approval and rejection flow
- [x] Admin vehicle approval and rejection flow
- [x] Admin dashboard and reports endpoints
- [x] Agency registration with Pakistan-specific application fields and document uploads
- [x] Transport module for agency-side vehicle management

Partially implemented
- [x] Agency and hotel API surface is present in routing, but not all modules are implemented behind the mounted routes
- [x] Traveler-related models for trip requests, bids, bookings, reviews, and chat exist in Prisma schema and architecture, but not all runtime modules are finished
- [x] Admin hotel review UI and route structure exist, but the hotel backend flow is not complete end-to-end

Missing / placeholder
- [ ] Users backend module implementation
- [ ] Agency backend module implementation
- [ ] Hotels backend module implementation
- [ ] Trip requests backend module implementation
- [ ] Bids backend module implementation
- [ ] Bookings backend module implementation
- [ ] Review APIs
- [ ] Persistent chat history and complete websocket message flow
- [ ] Traveler verification review workflow for admins
- [ ] Block/unblock account actions
- [ ] Content moderation pipeline

### Agency Portal
Completed
- [x] Agency login flow
- [x] Agency registration flow with Pakistan-specific application form and required documents
- [x] Pending approval experience after registration
- [x] Vehicle management core UI flow

Partially implemented
- [x] Dashboard exists but broader agency metrics/features remain incomplete
- [x] Hotel list/form pages exist, but hotel management is not complete end-to-end because backend support is incomplete

Missing / placeholder
- [ ] Trip request marketplace
- [ ] Bid submission flow
- [ ] Accepted booking management
- [ ] Rooms management
- [ ] Tour packages management
- [ ] Several agency hooks, slices, and components still marked `TODO`
- [ ] Bookings page is still a placeholder

### Admin Portal
Completed
- [x] Admin login flow
- [x] Agency review list with approval, rejection, and deletion
- [x] Vehicle approval flow
- [x] Users module
- [x] Reports and analytics dashboard
- [x] Agency review card now shows Pakistan application data and submitted documents

Partially implemented
- [x] Hotel approval UI exists, but the full hotel submission/review pipeline is not complete end-to-end
- [x] Analytics are implemented enough for project tracking, but not all possible moderation/operations dashboards exist

Missing / placeholder
- [ ] Traveler verification approval workflow
- [ ] Content moderation tools
- [ ] Block/unblock user or agency actions
- [ ] System logs / admin audit trail

### Traveler App
Completed
- [x] Basic Flutter app shell
- [x] Feature folder structure and route/API constants scaffolding

Partially implemented
- [x] Domain/data/presentation folders exist for auth, hotels, transport, trip requests, bookings, profile, chat, reviews, and trip groups
- [x] API endpoint constants and route constants are scaffolded for many planned flows

Missing / placeholder
- [ ] Traveler registration UI and flow
- [ ] Traveler login UI and flow
- [ ] CNIC verification flow
- [ ] Hotel search and booking flow
- [ ] Transport search and booking flow
- [ ] Trip request creation and listing flow
- [ ] Bids viewing and acceptance flow
- [ ] Bookings list and booking details flow
- [ ] Profile management
- [ ] Chat flow
- [ ] Reviews flow
- [ ] Group trip flow
- [ ] Most providers, repositories, datasources, pages, and widgets are still marked `TODO`

## Recently Completed Work
- [x] Admin users module
- [x] Admin reports and dashboard work
- [x] Agency registration with Pakistan-specific application fields and documents
- [x] Agency approval and rejection flow
- [x] Vehicle approval flow
- [x] Current authentication foundation across backend and portals

## Active Priority Backlog

### P0 - Core Trip Lifecycle
- [ ] Implement trip requests backend routes, service, controller, and validation
- [ ] Implement bids backend routes, service, controller, and validation
- [ ] Implement bookings backend routes, service, controller, and validation
- [ ] Implement traveler-side hotel search end-to-end
- [ ] Implement traveler-side transport search end-to-end
- [ ] Implement traveler trip request creation end-to-end
- [ ] Implement traveler bid viewing end-to-end
- [ ] Implement accepted bid to booking creation flow
- [ ] Add transactional handling so only one bid can be accepted safely
- [ ] Implement usable `/api/users` traveler profile flow

### P1 - Business Operations
- [ ] Implement hotels backend module so agency hotel pages work end-to-end
- [ ] Implement rooms and menus management
- [ ] Implement agency booking management
- [ ] Implement agency trip request viewing flow
- [ ] Implement agency bid submission flow
- [ ] Implement agency tour packages flow
- [ ] Implement traveler identity verification review for admins
- [ ] Implement hotel approval pipeline end-to-end

### P2 - Trust and Collaboration
- [ ] Implement reviews backend and traveler review submission flow
- [ ] Implement group trip APIs and traveler group trip flow
- [ ] Implement persistent chat storage and chat history APIs
- [ ] Implement real-time group chat behavior end-to-end
- [ ] Implement moderation tools for reviews, chats, or other flagged content
- [ ] Implement block/unblock actions for users and agencies

### P3 - Quality and Cleanup
- [ ] Add backend integration tests for auth, admin, transport, trip requests, bids, and bookings
- [ ] Add frontend tests for admin and agency critical flows
- [ ] Add security hardening such as rate limiting and stricter production middleware
- [ ] Add structured logging and clearer operational diagnostics
- [ ] Reduce placeholder components and `TODO` stubs across the portals and traveler app
- [ ] Keep architecture and API docs aligned with real implementation status

## Next Agent Start Here
1. Read this file first.
2. Verify the repo state before trusting any checklist item blindly.
3. Prioritize unchecked P0 items unless the user explicitly asks for something else.
4. Do not redo the Pakistan agency application work unless you are fixing a regression or extending it intentionally.
5. After any meaningful implementation change, update this file so it stays usable as the handoff source.

## Important Constraints and Defaults
- No payment integration in core scope because the SRS explicitly excludes it.
- Preserve the current monorepo structure: `backend`, `admin-portal`, `agency-portal`, and `traveler-app`.
- Treat `docs/TODO.md` as the active handoff source for future AI agents.
- Prefer updating this file after implementing features so it stays current.
- Treat the current agency application and approval system as already implemented unless a bug is found.
- Mark features as done only when they are implemented in a realistically usable way, not just scaffolded.

## Key Entry Points
- `backend/src/modules/auth/auth.routes.ts`
- `backend/src/modules/auth/auth.controller.ts`
- `backend/src/modules/auth/auth.service.ts`
- `backend/src/modules/admin/admin.routes.ts`
- `backend/src/modules/admin/admin.controller.ts`
- `backend/src/modules/admin/admin.service.ts`
- `backend/prisma/schema.prisma`
- `agency-portal/src/modules/auth/components/RegisterForm.tsx`
- `agency-portal/src/modules/auth/services/authService.ts`
- `agency-portal/src/App.tsx`
- `admin-portal/src/modules/agencies/components/AgencyCard.tsx`
- `admin-portal/src/App.tsx`
- `traveler-app/lib/main.dart`
- `docs/TODO.md`
