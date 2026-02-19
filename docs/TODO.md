# TrekPal TODO (SRS/SDD Aligned)

## 1. Project Baseline (As of 2026-02-19)
- Architecture present: monorepo + Prisma schema + seeded data.
- Working backend modules: Auth, Admin, Transport.
- Partially working web apps: Admin approvals/analytics and Agency auth/vehicle/hotel UIs.
- Major gap: Traveler-facing flows and core trip lifecycle APIs are not implemented end-to-end.

### Current-State Findings
- `191` explicit `// TODO: Implement` markers across codebase.
- Backend routes are effectively implemented only for `auth`, `admin`, and `transport`.
- Backend stubs still exist for `agency`, `hotels`, `tripRequests`, `bids`, `bookings`, `users`.
- Agency portal still has partial implementation with `ComingSoon` pages; admin user/report placeholders are now implemented.
- Traveler app is mostly scaffold/TODO (current `main.dart` is placeholder app shell).
- SRS says no payment integration (CO-4), so payment tasks are de-prioritized/optional.

## 2. SRS Traceability Status
Status labels used: `Done`, `Partial`, `Missing`.

### Traveler FRs
- `FR-USER-01` User Registration: `Partial` (backend exists, traveler app missing).
- `FR-USER-02` Traveler Login: `Partial` (backend exists, traveler app missing).
- `FR-USER-03` Identity Verification: `Partial` (backend marks verified; no admin review flow).
- `FR-USER-04` Search Hotels: `Missing`.
- `FR-USER-05` Search Transport: `Missing` for traveler role.
- `FR-USER-06` Create Trip Request: `Missing`.
- `FR-USER-07` View Bids: `Missing`.
- `FR-USER-08` Accept Bid: `Missing`.
- `FR-USER-09` Join Group Trip: `Missing`.
- `FR-USER-10` Submit Review: `Missing`.

### Agency FRs
- `FR-AGENCY-01` Registration: `Done`.
- `FR-AGENCY-02` Verification Docs: `Done`.
- `FR-AGENCY-03` Manage Hotels: `Partial` (UI exists, backend routes missing).
- `FR-AGENCY-04` Manage Rooms/Menus: `Missing`.
- `FR-AGENCY-05` Manage Vehicles: `Done`.
- `FR-AGENCY-06` Date-based availability/pricing: `Missing`.
- `FR-AGENCY-07` View Trip Requests: `Missing`.
- `FR-AGENCY-08` Submit Bid: `Missing`.
- `FR-AGENCY-09` Manage Accepted Bookings: `Missing`.
- `FR-AGENCY-10` Create Tour Packages: `Missing`.

### Admin FRs
- `FR-ADMIN-01` Approve/Reject Agencies: `Done`.
- `FR-ADMIN-02` Approve/Reject Hotels: `Partial` (endpoint/UI exists, upstream hotel creation API missing).
- `FR-ADMIN-03` Approve/Reject Vehicles: `Done`.
- `FR-ADMIN-04` Approve Traveler Verification: `Missing`.
- `FR-ADMIN-05` Moderate Content: `Missing`.
- `FR-ADMIN-06` View Analytics: `Partial` (dashboard and reports module implemented; broader analytics scope still pending).
- `FR-ADMIN-07` Block/Unblock Accounts: `Missing`.

## 3. Priority Backlog

### P0 (Critical Path: Core Trip Workflow)
- [ ] Implement backend `hotels` module routes/controllers/services.
- [ ] Implement backend `tripRequests` module routes/controllers/services.
- [ ] Implement backend `bids` module routes/controllers/services.
- [ ] Implement backend `bookings` module routes/controllers/services.
- [ ] Implement backend `users` module routes/controllers/services (`/users/profile`).
- [ ] Add traveler-facing transport search endpoints (separate from agency-only transport CRUD).
- [ ] Implement atomic bid acceptance flow: accept bid -> create booking -> mark status transitions.
- [ ] Wire Agency Portal hotel pages to working backend endpoints.
- [ ] Fix Traveler API constants to real backend contract (`/auth/register/user`, etc.).
- [ ] Add role-guarded integration tests for all P0 endpoints.

### P1 (Business Operations Completeness)
- [ ] Implement agency trip request viewing and bid submission UI + APIs.
- [ ] Implement agency booking management UI + APIs.
- [ ] Implement rooms management (data model + APIs + UI).
- [ ] Implement packages management (data model already exists; add APIs + UI).
- [x] Implement Admin Users module (`UserList.tsx`, service, slice, hooks).
- [x] Implement Admin Reports module (`ReportDashboard.tsx`, charts, services, slices).
- [ ] Implement Admin traveler verification workflow (queue + approve/reject actions).
- [ ] Implement block/unblock for users/agencies (admin API + UI).

### P2 (Collaboration + Trust Features)
- [ ] Implement reviews API and traveler review submission flow.
- [ ] Implement group trips APIs and membership flows.
- [ ] Persist chat messages in DB and expose chat history endpoints.
- [ ] Add moderation pipeline for reported reviews/messages/content.
- [ ] Integrate FCM notifications for bids, booking updates, trip group messages.

### P3 (Quality, Security, NFRs)
- [ ] Add automated test suites (backend unit/integration + portal component tests).
- [ ] Add rate limiting and security headers.
- [ ] Add structured logging (Winston/Pino) and request correlation IDs.
- [ ] Add backup strategy and restore runbook for PostgreSQL.
- [ ] Add performance SLO checks for search and chat latency.
- [ ] Remove or resolve placeholder/stub TODO files across portals and traveler app.

## 4. API/Interface Additions Required
Document these explicitly as contract work.

### Add/Complete REST Resources
- [ ] `/api/hotels` (public search + agency CRUD + admin moderation hooks).
- [ ] `/api/trip-requests` (traveler create/list/detail + agency listing).
- [ ] `/api/bids` (agency submit/list + traveler accept).
- [ ] `/api/bookings` (list/detail/status by role).
- [ ] `/api/users/profile` (get/update).
- [ ] `/api/reviews` (create/list by entity).
- [ ] `/api/trip-groups` (create/join/list/members).
- [ ] `/api/admin/verifications/travelers` (review CNIC queue).
- [ ] `/api/admin/moderation/*` (reported content actions).
- [ ] `/api/admin/users/:id/block` and `/api/admin/agencies/:id/block`.

### Data Model Changes to Plan in Migrations
- [ ] `isBlocked`, `blockedAt`, `blockedReason` on `User` and `Agency`.
- [ ] Content reporting/moderation tables.
- [ ] Date-based transport availability/pricing table.
- [ ] Booking conflict constraints to enforce no double-booking.

## 5. Test Scenarios to Track
- [ ] Auth registration/login across traveler, agency, admin.
- [ ] Agency approval gate: pending agency cannot access protected agency actions.
- [ ] Hotel/vehicle approval gating for traveler search visibility.
- [ ] Bid acceptance transactional integrity (single winner + booking creation).
- [ ] Double-booking prevention under concurrent requests.
- [ ] Role authorization boundaries for admin/agency/traveler routes.
- [ ] Chat persistence + websocket broadcast behavior.
- [ ] End-to-end flow: traveler trip request -> agency bid -> traveler accept -> booking visible to both.

## 6. Documentation Cleanup Tasks
- [ ] Align SRS and SDD requirement numbering inconsistencies (agency FR indexing mismatch).
- [ ] Update `docs/api/endpoints.md` from "ready for implementation" wording to actual statuses.
- [ ] Update `docs/guides/testing-agencies.md` credentials/examples to current seed data.
- [ ] Keep `docs/TODO.md` as single source of truth for roadmap (root `TODO.md` intentionally unchanged for now).

## Assumptions and Defaults
- Target file to update: `docs/TODO.md`.
- Update style: full replacement (not append).
- Keep `TODO.md` at repo root unchanged in this pass.
- Follow SRS constraint `CO-4` (no payment integration in core scope).
- Preserve existing stack choices (Express + Prisma + React + Flutter) and REST architecture.
