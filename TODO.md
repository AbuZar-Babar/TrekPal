# TrekPal Project Handoff & TODO

This document outlines the current state of the TrekPal project and the remaining tasks for future development. Use this as a roadmap for the next phase of work.

## Recent Accomplishments
- **Workflows**: Created `/dev` (start all servers) and `/db-reset` (data wipe and re-seed) automation scripts.
- **Admin UI Overhaul**: Complete premium redesign to match the Agency portal (SVGs, transitions, dark sidebar, gradient branding).
- **Agency Management**: Implemented agency approval, rejection, and deletion (with cascade delete for hotels/vehicles).
- **Shared Design System**: Established a consistent premium look-and-feel across all web portals.
- **Admin Users Module**: Implemented `UserList` + `usersService` + `usersSlice` + `useUsers` and wired `/users` route.
- **Admin Reports Module**: Implemented `ReportDashboard` + chart components + `reportsService` + `reportsSlice` + `useReports` and wired `/reports` route.

---

## Remaining Tasks & Roadmap

### 1. Admin Portal
- [x] **User Management (List/View)**: Replaced `UserList.tsx` placeholder and connected it to backend data.
- [ ] **User Account Controls**: Add suspend/deactivate user account actions.
- [x] **Reports & Analytics**: Completed reports dashboard/charts and integrated with backend analytics endpoints.
- [ ] **KYC Verification**: Implement backend logic and frontend UI for reviewing agency identity documents.
- [ ] **System Logs**: Add a dashboard for tracking administrative actions and system errors.

### 2. Agency Portal
- [ ] **Tour Packages**: Implement the package creation workflow (itineraries, pricing, inclusions). Currently a placeholder.
- [ ] **Booking Management**: Implement the booking list and detail views. Add status updates (Confirmed, Cancelled, Completed).
- [ ] **Trip Requests & Bids**: Finalize the module for responding to traveler trip requests with custom bids.
- [ ] **Hotel Room Management**: Expand the room management UI to handle availability calendars and seasonal pricing.

### 3. Traveler Mobile App (Flutter)
- [ ] **Feature Completion**: Resolve the 150+ `TODO` items in the `traveler-app` codebase.
- [ ] **Real-time Messaging**: Fully integrate the Socket.io backend with the Flutter chat UI.
- [ ] **Payment Integration**: Add Stripe/Stax integration for traveler bookings.
- [ ] **Push Notifications**: Configure Firebase Cloud Messaging (FCM) for trip alerts and bid updates.

### 4. Backend (Node.js/Prisma)
- [ ] **Search Engine**: Optimize the hotel and vehicle search with advanced filters (price range, amenities, availability).
- [ ] **Email Service**: Set up Nodemailer for registration welcome emails and booking confirmations.
- [ ] **File Storage**: Move from local uploads to AWS S3 or Google Cloud Storage for agency/hotel images.

---

## Development Tools
- **/dev**: Run this slash command to start the entire ecosystem (Backend + Admin + Agency).
- **/db-reset**: Run this if you need to wipe the database and start with fresh test data.
- **Prisma Studio**: Run `npm run prisma:studio` in the backend folder to browse raw data.
