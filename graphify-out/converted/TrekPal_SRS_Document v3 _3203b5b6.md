<!-- converted from TrekPal_SRS_Document v3 .docx -->


COMSATS University Islamabad,
Abbottabad Campus
SOFTWARE REQUIREMENTS SPECIFICATION 
(SRS DOCUMENT)
for
<PROJECT NAME>
Version 1.0
By
Hashim Khan        FA22-BSE-137
Ali Usman Tajik    FA22-BSE-134


Supervisor
Ma’am Sana Malik


Bachelor of Science in Computer Science (2022-2026)






Revision History




Application Evaluation History


















Supervised by
<Supervisor’s Name>
Signature___________
1. Introduction
TrekPal is a smart travel management platform designed to simplify and enhance the trip-planning experience for travelers, travel agencies, and administrators. The system provides a unified ecosystem where travelers can search and book verified hotels and transport, create trip requests, receive agency bids, join group trips, and communicate through real-time chat. Travel Agencies can manage their hotels, vehicles, bookings, and respond to traveler requests, while Admins ensure platform safety through verification and moderation tools.
TrekPal aims to make travel safer, more organized, and more accessible by combining booking, trip planning, group coordination, and verified service providers in a single application. Built with Flutter, React, Node.js, and firebase, the platform emphasizes usability, reliability, and scalability to support a growing travel community.
1.1 Purpose
The purpose of this Software Requirements Specification (SRS) is to formally describe the functional and non-functional requirements of TrekPal, a hybrid travel-planning platform consisting of:
Mobile application for users
Web portal for agency owners
Admin dashboard for system administrators
This document establishes a clear understanding of system objectives, features, constraints, and interactions among stakeholders including developers, users, hotel owners, and administrators.
1.2 Scope
TrekPal is a unified travel management platform designed to connect Travelers, Travel Agencies, and Administrators through a single ecosystem. The system provides verified hotel discovery, transport booking, trip planning, group travel management, and a competitive bidding system for
# 2. Overall Description
## 2.1 Product Perspective
TrekPal is a multi-tier, service-oriented ecosystem designed to streamline travel planning by connecting Travelers, Travel Agencies, and Administrators within a unified digital platform. The system introduces a consolidated business entity called the Travel Agency, which replaces separate Hotel Owner and Transport Owner roles

1. Mobile Application (Flutter)
The mobile app serves as the primary interface for end-users (Travelers). It enables them to:
Register and complete identity verification
Search and book hotels managed by Travel Agencies
Search and book transport options (cars, jeeps, vans, coasters, etc.)
Create Trip Requests, defining trip preferences, destination, dates, and budget
Receive and compare bids submitted by Travel Agencies
Accept a bid, which triggers automatic generation of hotel/transport bookings
Join or create group trips
Communicate using real-time chat
Submit reviews and ratings
Receive push notifications for bid submissions, booking updates, and trip activity
This subsystem interacts heavily with the backend via REST APIs, Firebase Authentication, and WebSocket services.
2. Travel Agency Web Portal (React.js)
The Travel Agency represents a unified business entity that manages all commercial assets and services.
A single Travel Agency account can:
Register on the platform and submit verification documents
Add and manage multiple hotels, including rooms, pricing, food menus, and media
Add and manage multiple transport vehicles, including capacity, availability, pricing, and driver information
View all incoming Traveler Trip Requests
Submit customized bids containing combined hotel + vehicle + package offerings
Manage bookings that result from accepted bids
Create optional tour packages
Use dashboards for bookings, revenue, and agency performance
This portal replaces the earlier Hotel Owner and Transport Owner portals and consolidates them into a single, more powerful operational dashboard.

3. Admin Web Portal (React.js)
The admin dashboard provides system-wide oversight and quality control. Admins can:
Approve or reject Travel Agency registrations
Approve or reject hotels and vehicles submitted by agencies
Approve traveler identity verification
Monitor Trip Requests and bids for fairness and compliance
Suspend or block suspicious activity (travelers or agencies)
Manage content moderation (reviews, misuse reports)
View real-time analytics and platform statistics

## 2.2 Operating Environment
TrekPal must operate under the following environmental conditions:
### OE-1 Mobile Application Environment
Flutter SDK 3.22+
Android 10+
Device must support internet connectivity
Minimum RAM required: 4 GB
### OE-2 Web Portal Requirements
Compatible web browsers:
Chrome (latest)
Firefox (latest)
Microsoft Edge
React.js 18 environment
Modern desktop or laptop
### OE-3 Backend Environment
Node.js v20
PostgreSQL 7.0
Firebase SDK 2025
### OE-4 Network Requirements
Stable internet connection for real-time:
Booking updates
Group chat
Trip coordination
Minimum recommended speed: 1 Mbps

## 2.3 Design and Implementation Constraints
### CO-1: Dependency on Internet
TrekPal is an online-first application. All modules booking, chat, trip groups require network connectivity.
### CO-2: Cross-Platform Consistency
Both mobile and web portals must share:
API structure
Design consistency
Data models
### CO-3: Device Limitations
Low-end devices may struggle with:
Real-time chats
Map rendering
High-quality image loading
### CO-4: No Payment Integration
Booking confirmation will be offline or cash-based.
### CO-5: Third-Party API Restrictions
Google Maps API credits and limits may affect:
Search radius
Map load count
Live route generation
# 3. Requirement Identifying Techniques
The requirements for TrekPal are primarily identified using:
Use Case Modelling
Stakeholder interviews (travelers, hotel owners)
Analysis of competitor applications (Airbnb, Booking.com, TripAdvisor)
Survey-based requirement gathering
Use cases provide a clear and structured way to capture the system’s functional requirements.

## 3.1 Use Case Diagram

Actors
### 1. Traveler (User)
The primary end-user who:
Creates Trip Requests
Receives and compares bids
Accepts bids which generate bookings
Searches hotels and transport
Books accommodations & vehicles
Uses chat and group travel features
Submits reviews
### 2. Travel Agency (Unified Business Actor)
A verified business account that:
Manages hotels, rooms, menus
Manages transport vehicles
Views Trip Requests
Submits bids to travelers
Manages bookings from accepted bids
Creates optional tour packages

### 3. Admin
Platform supervisor who:
Verifies travelers & agencies
Approves/rejects hotels and vehicles
Moderates content
Manages users
Views system analytics







### Use Cases Included in TrekPal
Traveler Use Cases
UC-1 Register Account
UC-2 Complete Verification
UC-3 Search Hotels
UC-4 Search Transport
UC-5 Create Trip Request
UC-6 View Bids
UC-7 Accept Bid
UC-8 Join Group Trip
UC-9 Chat with Group Members
UC-10 Submit Review
Travel Agency Use Cases
UC-AG-01 Register Travel Agency
UC-AG-02 Submit Agency Verification Documents
UC-AG-03 Manage Hotels
UC-AG-04 Manage Rooms & Menus
UC-AG-05 Manage Vehicles
UC-AG-06 View Trip Requests
UC-AG-07 Submit Bid
UC-AG-08 Manage Accepted Bookings
UC-AG-09 Create Tour Packages (optional)

Admin Use Cases
UC-ADM-01 Approve/Reject Travel Agency registration
UC-ADM-02 Approve/Reject hotels submitted by agencies
UC-ADM-03 Approve/Reject vehicles submitted by agencies
UC-ADM-04 Approve traveler verification
UC-ADM-05 Block/Unblock travelers or agencies
UC-ADM-06 View system analytics
UC-ADM-07 Moderate reviews and flagged content
## 3.2 Use Case Descriptions
### UC-1: User Registration


### UC-2: Verification


### UC-3: Hotel Search


### UC-4: Search Transport


### UC-5: Create Trip Group


### UC-6: View Bids


### UC-7: Accept Bid


### UC-8: Join Group Trip


### UC-9: Group Chat


### UC-10: Submit Review


Travel Agency Use Cases
UC-AG-01: Agency Registration

UC-AG-02: Manage Hotels

UC-AG-03: Manage Rooms & Menu

UC-AG-04: Manage Vehicles

UC-AG-05: View Trip Requests

UC-AG-06: Submit Bid



UC-AG-07: Manage Accepted Bookings


Admin Use Cases

UC-ADM-01: Approve/Reject Agency Registration

UC-ADM-02: Approve/Reject Hotel

UC-ADM-03: Approve/Reject Vehicle

UC-ADM-04: Approve Traveler Verification

UC-ADM-05: Moderate Content

UC-ADM-06: View Analytics

UC-ADM-07: Block/Unblock User or Agency








# 4. Functional Requirements

Admin Portal Functional Requirements

FR-USER-01 — User Registration

FR-USER-02 — Traveler Login




FR-USER-03 — Identity Verification



FR-USER-04 — Search Hotels



FR-USER-05 — Search Transport



FR-USER-06 — Create Trip Request



FR-USER-07 — View Bids



FR-USER-08 — Accept Bid



FR-USER-09 — Join Group Trip



FR-USER-10 — Submit Review



Travel Agency Functional Requirements

FR-AGENCY-01 — Agency Registration


FR-AGENCY-02 — Agency Verification


FR-AGENCY-03 — Manage Hotels


FR-AGENCY-04 — Manage Rooms & Food Menus


FR-AGENCY-05 — Manage Vehicles


FR-AGENCY-06 — Manage Vehicle Availability


FR-AGENCY-07 — View Trip Requests


FR-AGENCY-08 — Submit Bid


FR-AGENCY-09 — Manage Accepted Bookings


FR-AGENCY-10 — Create Tour Packages






Admin Functional Requirements

FR-ADMIN-01 — Approve/Reject Agency Registration



FR-ADMIN-02 — Approve/Reject Hotels



FR-ADMIN-03 — Approve/Reject Vehicles



FR-ADMIN-04 — Approve Traveler Verification



FR-ADMIN-05 — Content Moderation



FR-ADMIN-06 — View Analytics



FR-ADMIN-07 — Block/Unblock Accounts



# 5. Non-Functional Requirements
Non-functional requirements describe the quality attributes of the TrekPal system.

## 5.1 Usability Requirements
NFR-USE-01 — Simple & Intuitive UI
The system shall provide a clean and easy-to-navigate interface on both mobile and web.
NFR-USE-02 — Clear Feedback
Users shall receive meaningful success/error messages.
NFR-USE-03 — Easy Onboarding
Registration and login shall be completed within a few simple steps.

## 5.2 Reliability Requirements
NFR-REL-01 — High Availability
The system shall maintain 99% uptime.
NFR-REL-02 — Prevent Double Booking
The system shall ensure no hotel room or vehicle can be double-booked.
NFR-REL-03 — Data Backup
Database backups shall occur at least once daily.

## 5.3 Performance Requirements
NFR-PERF-01 — Fast Response
Search results and main screens shall load within 2–3 seconds.
NFR-PERF-02 — Real-Time Chat
Chat messages shall deliver with a delay of less than 300 ms.
NFR-PERF-03 — Scalable User Load
The system shall support large numbers of active users without performance degradation.

# 7. Project Gantt Chart


# 8. References
Sommerville, Ian. Software Engineering (10th Edition).
Pressman, R. S. Software Engineering: A Practitioner’s Approach.
Flutter Documentation  https://flutter.dev
Firebase Documentation  https://firebase.google.com
PostgreSQL Documentation  https://postgresql.org
Google Maps API  https://developers.google.com/maps
Node.js Official Documentation  https://nodejs.org
COMSATS SRS Template Guidelines
TrekPal Feasibility Document (Uploaded by student)  Used for scope & modules

| Name | Date | Reason for changes | Version |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
| Comments (by committee)
*include the ones given at scope time both in doc and presentation | Action Taken |
| --- | --- |
|  |  |
|  |  |
| Field | Description |
| --- | --- |
| Use Case ID | UC-1 |
| Use Case Name | User Registration |
| Actor | Traveler |
| Description | The traveler creates a new account using email, phone number, or Google Sign-In. |
| Trigger | Traveler selects “Sign Up”. |
| Preconditions | None |
| Postconditions | A traveler account is created and can log in. |
| Main Flow | 1. Traveler enters required information.2. System validates inputs.3. System creates account.4. System sends confirmation/verification. |
| Alternative Flows | AF-1: Invalid input > system displays error.AF-2: Email already used > system requests different email. |
| Business Rules | BR-1: Email must be unique. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-2 |
| Use Case Name | Identity Verification |
| Actor | Traveler |
| Description | Traveler uploads CNIC images to complete verification. |
| Trigger | Traveler selects “Verify Identity”. |
| Preconditions | Traveler is logged in. |
| Postconditions | Verification request submitted to Admin. |
| Main Flow | 1. Traveler uploads CNIC front/back.2. System stores documents.3. System notifies Admin. |
| Alternative Flows | AF-1: Upload failure > system requests retry. |
| Business Rules | BR-2: Verified identity required for certain booking operations. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-3 |
| Use Case Name | Search Hotels |
| Actor | Traveler |
| Description | Traveler searches available hotels. |
| Trigger | Traveler enters destination or opens hotel search. |
| Preconditions | Internet connection available. |
| Postconditions | List of matching hotels displayed. |
| Main Flow | 1. Traveler enters search query/filters.2. System retrieves approved hotels.3. System displays searchable list. |
| Alternative Flows | AF-1: No hotels found > “No results” message. |
| Business Rules | BR-3: Only verified agency hotels may appear in search. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-4 |
| Use Case Name | Search Transport |
| Actor | Traveler |
| Description | Traveler searches available vehicles. |
| Trigger | Traveler opens Transport section. |
| Preconditions | Internet connection available. |
| Postconditions | Matching vehicles displayed. |
| Main Flow | 1. Traveler enters route/date.2. System retrieves vehicles.3. System displays list. |
| Alternative Flows | AF-1: No transport found. |
| Business Rules | BR-4: Vehicles must be approved by Admin. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-5 |
| Use Case Name | Create Trip Request |
| Actor | Traveler |
| Description | Traveler creates a Trip Request specifying destination, dates, pax, and preferences. |
| Trigger | Traveler selects “Create Trip Request”. |
| Preconditions | Traveler identity verified. |
| Postconditions | Trip Request visible to Travel Agencies. |
| Main Flow | 1. Traveler enters details.2. System validates and saves.3. System notifies agencies. |
| Alternative Flows | AF-1: Invalid data.AF-2: Canceled before submission. |
| Business Rules | BR-5: Requests expire after a defined validity period. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-6 |
| Use Case Name | View Bids |
| Actor | Traveler |
| Description | Traveler views all bids submitted by agencies. |
| Trigger | Traveler opens Trip Request details. |
| Preconditions | Bids exist for the request. |
| Postconditions | Bids displayed and can be compared. |
| Main Flow | 1. Traveler opens request.2. System displays active bids. |
| Alternative Flows | AF-1: No bids yet. |
| Business Rules | BR-6: Only active bids shown. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-7 |
| Use Case Name | Accept Bid |
| Actor | Traveler |
| Description | Traveler accepts a bid, resulting in bookings. |
| Trigger | User clicks “Accept Bid.” |
| Preconditions | Trip Request active; bid available. |
| Postconditions | Bookings generated; agency notified. |
| Main Flow | 1. Traveler selects bid.2. System marks it accepted.3. System creates associated bookings.4. Notification sent to agency. |
| Alternative Flows | AF-1: Bid expired.AF-2: Bid withdrawn before acceptance. |
| Business Rules | BR-7: Accepted bids create binding bookings. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-8 |
| Use Case Name | Join Group Trip |
| Actor | Traveler |
| Description | Traveler joins an existing group trip. |
| Trigger | Traveler taps “Join”. |
| Preconditions | Group has available seats. |
| Postconditions | User added to group. |
| Main Flow | 1. Join request sent.2. Group owner approves (or auto-approve).3. Traveler added. |
| Alternative Flows | AF-1: Group full. |
| Business Rules | BR-8: Some groups require verified users. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-9 |
| Use Case Name | Group Chat |
| Actor | Traveler |
| Description | Travelers communicate in group chat. |
| Trigger | Traveler opens chat. |
| Preconditions | Traveler is trip group member. |
| Postconditions | Message delivered and stored. |
| Main Flow | 1. Traveler sends message.2. System broadcasts via WebSocket/FCM.3. Message stored. |
| Alternative Flows | AF-1: User offline > queued message. |
| Business Rules | BR-9: Message retention policy applies. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-10 |
| Use Case Name | Submit Review |
| Actor | Traveler |
| Description | Traveler submits a review after a completed booking. |
| Trigger | Traveler selects “Write Review”. |
| Preconditions | Relevant hotel/vehicle booking completed. |
| Postconditions | Review published or held for moderation. |
| Main Flow | 1. Traveler writes review.2. System validates and saves.3. Review becomes visible. |
| Alternative Flows | AF-1: Violating content > flagged. |
| Business Rules | BR-10: One review per booking allowed. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-AG-01 |
| Use Case Name | Agency Registration |
| Actor | Travel Agency |
| Description | The agency registers with business details and credentials. |
| Trigger | Agency selects “Register”. |
| Preconditions | None |
| Postconditions | Agency account created in pending-verification state. |
| Main Flow | 1. Agency enters details.2. Uploads business documents.3. System saves record.4. Admin notified. |
| Alternative Flows | AF-1: Missing documents. |
| Business Rules | BR-A1: Valid business documentation required. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-AG-02 |
| Use Case Name | Manage Hotels |
| Actor | Travel Agency |
| Description | Agency adds and updates hotels in its portfolio. |
| Trigger | Agency opens hotel management. |
| Preconditions | Agency verified. |
| Postconditions | Hotels stored (pending or approved). |
| Main Flow | 1. Add/edit hotel details.2. Upload images.3. Save listing.4. Admin approval if required. |
| Alternative Flows | AF-1: Missing mandatory fields. |
| Business Rules | BR-A2: Hotels require admin approval. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-AG-03 |
| Use Case Name | Manage Rooms & Menu |
| Actor | Travel Agency |
| Description | Add/edit/delete rooms and food menu. |
| Trigger | Agency opens room/menu section. |
| Preconditions | Agency owns hotel. |
| Postconditions | Room/menu data updated. |
| Main Flow | 1. Select hotel.2. Add/edit rooms/menus.3. Save updates. |
| Alternative Flows | AF-1: Invalid pricing or parameters. |
| Business Rules | BR-A3: Certain changes may require admin review. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-AG-04 |
| Use Case Name | Manage Vehicles |
| Actor | Travel Agency |
| Description | Agency adds and updates transport vehicles. |
| Trigger | Agency opens vehicle section. |
| Preconditions | Agency verified. |
| Postconditions | Vehicle saved (pending/approved). |
| Main Flow | 1. Enter vehicle details.2. Upload documents.3. Save.4. Admin approval required. |
| Alternative Flows | AF-1: Missing registration documents. |
| Business Rules | BR-A4: Only approved vehicles are displayed. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-AG-05 |
| Use Case Name | View Trip Requests |
| Actor | Travel Agency |
| Description | Agency views Trip Requests posted by travelers. |
| Trigger | Agency opens Trip Request marketplace. |
| Preconditions | Active agency account. |
| Postconditions | Requests displayed. |
| Main Flow | 1. Agency opens marketplace.2. Filters requests.3. Views details. |
| Alternative Flows | AF-1: No matching requests. |
| Business Rules | BR-A5: Only requests within agency’s service area appear. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-AG-06 |
| Use Case Name | Submit Bid |
| Actor | Travel Agency |
| Description | Agency submits a bid for a Trip Request. |
| Trigger | Agency selects “Place Bid”. |
| Preconditions | Trip Request active. |
| Postconditions | Bid stored and visible to traveler. |
| Main Flow | 1. Agency fills bid details.2. System validates.3. Bid posted. |
| Alternative Flows | AF-1: Withdraw bid before acceptance.AF-2: Update bid. |
| Business Rules | BR-A6: Bids must reference agency-owned assets. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-AG-07 |
| Use Case Name | Manage Accepted Bookings |
| Actor | Travel Agency |
| Description | Agency manages bookings created from accepted bids. |
| Trigger | Bid accepted by traveler. |
| Preconditions | Booking exists. |
| Postconditions | Booking status updated. |
| Main Flow | 1. Agency views booking list.2. Confirms hotel/vehicle reservations.3. Updates status. |
| Alternative Flows | AF-1: Cancel booking (per policy). |
| Business Rules | BR-A7: Booking updates must notify travelers. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-ADM-01 |
| Use Case Name | Approve/Reject Agency Registration |
| Actor | Admin |
| Description | Admin verifies agency documents and approves or rejects. |
| Trigger | Admin opens pending agencies. |
| Preconditions | Agency submitted registration. |
| Postconditions | Agency marked approved or rejected. |
| Main Flow | 1. Admin inspects documents.2. Approves or rejects.3. System notifies agency. |
| Alternative Flows | AF-1: Request additional documents. |
| Business Rules | BR-ADM1: Only approved agencies may operate. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-ADM-02 |
| Use Case Name | Approve/Reject Hotel |
| Actor | Admin |
| Description | Admin reviews hotel listings. |
| Trigger | Admin opens pending hotels. |
| Preconditions | Hotel submitted by an agency. |
| Postconditions | Hotel status updated. |
| Main Flow | Review > Approve/Reject > Notify agency |
| Business Rules | BR-ADM2: Unapproved hotels hidden in search. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-ADM-03 |
| Use Case Name | Approve/Reject Vehicle |
| Actor | Admin |
| Description | Admin validates vehicle details. |
| Trigger | Admin opens pending vehicles. |
| Preconditions | Vehicle submitted by agency. |
| Postconditions | Vehicle approved or rejected. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-ADM-04 |
| Use Case Name | Approve Traveler Verification |
| Actor | Admin |
| Description | Admin verifies traveler identity documents. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-ADM-05 |
| Use Case Name | Moderate Content |
| Actor | Admin |
| Description | Admin handles flagged reviews, posts, or chats. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-ADM-06 |
| Use Case Name | View Analytics |
| Actor | Admin |
| Description | Admin views system metrics and reports. |
| Field | Description |
| --- | --- |
| Use Case ID | UC-ADM-07 |
| Use Case Name | Block/Unblock User or Agency |
| Actor | Admin |
| Description | Admin suspends or reinstates accounts. |
| Field | Description |
| --- | --- |
| Identifier | FR-USER-01 |
| Title | User Registration |
| Requirement | The system shall allow travelers to create an account using email, phone number, or Google Sign-In. |
| Source | Traveler Use Cases (UC-1) |
| Rationale | Required for all personalized features. |
| Business Rules | Email/phone must be unique. |
| Dependencies | None |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-USER-02 |
| Title | Traveler Login |
| Requirement | The system shall allow travelers to log in securely through Firebase Authentication. |
| Source | UC-1 |
| Rationale | Enables authenticated access. |
| Business Rules | Tokens must be refreshed securely. |
| Dependencies | FR-USER-01 |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-USER-03 |
| Title | Identity Verification |
| Requirement | Travelers shall upload CNIC images for identity verification. |
| Source | UC-2 |
| Rationale | Enhances user safety and compliance. |
| Business Rules | Verified users may access restricted features (e.g., bidding acceptance). |
| Dependencies | FR-USER-02 |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-USER-04 |
| Title | Search Hotels |
| Requirement | The system shall allow travelers to search hotels using filters such as location, rating, room type, and price. |
| Source | UC-3 |
| Rationale | Core functionality of travel planning. |
| Business Rules | Only approved agency hotels appear in results. |
| Dependencies | Agency hotel data |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-USER-05 |
| Title | Search Transport |
| Requirement | The system shall allow travelers to search vehicles offered by Travel Agencies based on route, capacity, availability, and price. |
| Source | UC-4 |
| Rationale | Provides travel mobility options. |
| Business Rules | Only approved vehicles appear. |
| Dependencies | Agency transport data |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-USER-06 |
| Title | Create Trip Request |
| Requirement | The system shall allow travelers to create Trip Requests including destination, dates, passengers, preferences, and budget. |
| Source | UC-5 |
| Rationale | Enables agency bidding workflow. |
| Business Rules | Trip Requests must expire after a validity period. |
| Dependencies | FR-USER-03 |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-USER-07 |
| Title | View Bids |
| Requirement | The system shall display all bids submitted by agencies for a Trip Request. |
| Source | UC-6 |
| Rationale | Traveler must compare offers. |
| Business Rules | Only active bids shown. |
| Dependencies | FR-AGENCY-07 |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-USER-08 |
| Title | Accept Bid |
| Requirement | The system shall allow the traveler to accept one bid, after which hotel and transport bookings are automatically created. |
| Source | UC-7 |
| Rationale | Converts trip planning into confirmed bookings. |
| Business Rules | Accepted bid becomes binding according to platform policy. |
| Dependencies | FR-USER-06, FR-AGENCY-07 |
| Priority | Critical |
| Field | Description |
| --- | --- |
| Identifier | FR-USER-09 |
| Title | Join Group Trip |
| Requirement | The system shall allow travelers to join group trips based on availability. |
| Source | UC-8 |
| Rationale | Supports social travel features. |
| Business Rules | Some groups may require verified users. |
| Dependencies | Group module |
| Priority | Medium |
| Field | Description |
| --- | --- |
| Identifier | FR-USER-10 |
| Title | Submit Review |
| Requirement | The system shall allow travelers to submit reviews for hotels, vehicles, or agencies after trip completion. |
| Source | UC-10 |
| Rationale | Enhances transparency and quality assurance. |
| Business Rules | One review per booking. |
| Dependencies | Completed booking |
| Priority | Medium |
| Field | Description |
| --- | --- |
| Identifier | FR-AGENCY-01 |
| Title | Agency Registration |
| Requirement | Agencies shall be able to register a business account by providing details and documents. |
| Source | UC-AG-01 |
| Rationale | Required for agencies to participate. |
| Dependencies | None |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-AGENCY-02 |
| Title | Agency Verification |
| Requirement | Agencies shall upload business documents for admin approval. |
| Source | UC-AG-01 / UC-ADM-01 |
| Rationale | Ensures platform trust & safety. |
| Dependencies | Admin module |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-AGENCY-03 |
| Title | Manage Hotels |
| Requirement | Agencies shall add, update, and delete hotels. |
| Source | UC-AG-02 |
| Rationale | Core service offering. |
| Business Rules | Hotels require admin approval before appearing publicly. |
| Dependencies | FR-AGENCY-02 |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-AGENCY-04 |
| Title | Manage Rooms & Menus |
| Requirement | Agencies shall manage room details, prices, availability, and food menus. |
| Source | UC-AG-03 |
| Rationale | Required for accurate hotel listings. |
| Dependencies | FR-AGENCY-03 |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-AGENCY-05 |
| Title | Manage Vehicles |
| Requirement | Agencies shall add and manage transport vehicles. |
| Source | UC-AG-04 |
| Rationale | Provides transport services. |
| Business Rules | Vehicles require admin approval. |
| Dependencies | FR-AGENCY-02 |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-AGENCY-06 |
| Title | Manage Vehicle Availability |
| Requirement | Agencies shall define availability and pricing per date. |
| Source | UC-AG-04 |
| Rationale | Enables accurate bookings & bidding. |
| Dependencies | FR-AGENCY-05 |
| Priority | Medium |
| Field | Description |
| --- | --- |
| Identifier | FR-AGENCY-07 |
| Title | View Trip Requests |
| Requirement | Agencies shall view active Trip Requests submitted by travelers. |
| Source | UC-AG-05 |
| Rationale | Required for bidding process. |
| Dependencies | FR-USER-06 |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-AGENCY-08 |
| Title | Submit Bid |
| Requirement | Agencies shall submit a bid including price, hotel, vehicle, and services. |
| Source | UC-AG-06 |
| Rationale | Enables competitive marketplace. |
| Business Rules | Bids must reference agency-owned, approved assets. |
| Dependencies | FR-AGENCY-03, FR-AGENCY-05 |
| Priority | Critical |
| Field | Description |
| --- | --- |
| Identifier | FR-AGENCY-09 |
| Title | Manage Accepted Bookings |
| Requirement | Agencies shall manage bookings created from accepted bids. |
| Source | UC-AG-07 |
| Rationale | Ensures fulfillment of hotel/transport services. |
| Dependencies | Accepted bid |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-AGENCY-10 |
| Title | Create Tour Packages |
| Requirement | Agencies shall create optional tour packages with itinerary and pricing. |
| Source | UC-AG-10 |
| Rationale | Additional service offering. |
| Dependencies | FR-AGENCY-02 |
| Priority | Medium |
| Field | Description |
| --- | --- |
| Identifier | FR-ADMIN-01 |
| Title | Approve/Reject Agency Registration |
| Requirement | Admin shall approve or reject Travel Agency registrations. |
| Source | UC-ADM-01 |
| Rationale | Ensures only legitimate businesses operate. |
| Dependencies | FR-AGENCY-01 |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-ADMIN-02 |
| Title | Approve/Reject Hotels |
| Requirement | Admin shall review hotels submitted by agencies and approve or reject them. |
| Source | UC-ADM-02 |
| Rationale | Ensures quality and trust. |
| Dependencies | FR-AGENCY-03 |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-ADMIN-03 |
| Title | Approve/Reject Vehicles |
| Requirement | Admin shall verify all vehicle submissions. |
| Source | UC-ADM-03 |
| Rationale | Ensures safe and verified transport options. |
| Dependencies | FR-AGENCY-05 |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-ADMIN-04 |
| Title | Approve Traveler Verification |
| Requirement | Admin shall verify traveler identity documents. |
| Source | UC-ADM-04 |
| Rationale | Increases user trust. |
| Priority | High |
| Field | Description |
| --- | --- |
| Identifier | FR-ADMIN-05 |
| Title | Moderate Content |
| Requirement | Admin shall review and manage reported reviews, chats, or posts. |
| Source | UC-ADM-05 |
| Rationale | Ensures platform safety. |
| Priority | Medium |
| Field | Description |
| --- | --- |
| Identifier | FR-ADMIN-06 |
| Title | View Analytics |
| Requirement | Admin shall view dashboards for bookings, trips, revenue, and system usage. |
| Source | UC-ADM-06 |
| Rationale | Supports decision-making. |
| Priority | Medium |
| Field | Description |
| --- | --- |
| Identifier | FR-ADMIN-07 |
| Title | Block/Unblock Accounts |
| Requirement | Admin shall be able to block or unblock travelers or agencies. |
| Source | UC-ADM-07 |
| Rationale | Protects system integrity. |
| Priority | High |