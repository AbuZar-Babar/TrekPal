<!-- converted from trekpal SDD.docx -->

COMSATS University Islamabad, 
Abbottabad Campus

SOFTWARE DESIGN DESCRIPTION 
(SDD DOCUMENT)
for
TrekPal
Version 1.0
By
Hasham Ahli Khan        FA22-BSE-137
Ali Usman Tajik    FA22-BSE-134

Supervisor
Maam Sana Malik


Bachelor of Science in Computer Science (2022-2026)





Revision History




Application Evaluation History














Supervised by
Maam Sana Malik
Signature______________
# Introduction
The Software Design Description (SDD) document provides a detailed explanation of the internal structure, architecture, and design strategy used to implement TrekPal, a hybrid travel-planning ecosystem consisting of a Traveler Mobile App, Travel Agency Web Portal, and Admin Dashboard.
TrekPal’s functionality covers identity verification, hotel management, vehicle management, trip request creation, bidding workflow, group trips, chatting, booking automation, and administrative moderation. Each module is designed using a layered architecture pattern, ensuring separation of concerns and easier maintainability.
The SDD serves as a blueprint for developers, testers, maintainers, and evaluators, ensuring that each feature described in the SRS is supported by a clear and implementable design.

# Design methodology and model
## 2.1 Design Methodology (Object-Oriented Design)
TrekPal is designed using an Object-Oriented Design (OOD) approach.
This methodology is suitable because:
The system consists of multiple interacting entities (Travelers, Agencies, Hotels, Vehicles, Trips, Bids, Bookings).
These entities naturally map to classes with attributes and behaviors.
OOD supports modularity, reusability, and easier debugging, which aligns with the maintainability requirements stated in the SRS.
The system is large and contains multiple subsystems, and OOD helps break it into manageable components.
Key OOD concepts used in TrekPal include:
Encapsulation: Each module (e.g., TripService, BookingService) hides its internal logic.
Inheritance: Common structures like User > Traveler / Agency.
Aggregation & Composition:
A Travel Agency owns multiple Hotels (composition).
A Trip Request references bids by agencies (aggregation).
Polymorphism: Future extensions (e.g., multiple types of booking services) can be supported easily.


## Software Process Model (Agile–Scrum)
TrekPal uses the Agile Scrum process model, as defined in the SRS.
This model was chosen because:
The system has many evolving modules and benefits from incremental development.
Features such as hotel management, vehicle management, bidding, chat, and bookings can be developed in separate sprints.
Regular feedback allows refinement of UI/UX, performance, and backend workflows.
Agile supports continuous testing, which is essential due to multiple integrations (Firebase, PostgreSQL, Maps API).
The development team can easily adjust priorities—useful for university-level projects with evolving requirements.
Typical workflow:
Sprint Planning: Identify user stories and prioritize features.
Development Phase: Implement backend APIs, UI screens, and database models.
Testing: Validate requirements against SRS.
Review & Retrospective: Improve quality and plan next sprint.
Scrum enables the team to deliver the system in working increments while ensuring each module is validated and tested in isolation before integration.

# System overview
TrekPal is a multi-module travel–planning ecosystem that connects three main actors: Travelers, Travel Agencies, and Administrators. The system consists of a Flutter Mobile Application for travelers and two React.js Web Portals for Travel Agencies and Admin users. All front-end interfaces communicate with a shared backend powered by Node.js, PostgreSQL, Firebase services, and cloud storage.
The system’s primary purpose is to streamline the entire travel planning workflow. Travelers can search hotels and transport options, create Trip Requests, receive bids from Travel Agencies, and accept the best offer. Travel Agencies, acting as unified business entities, can manage hotels, rooms, menus, vehicles, and respond to traveler requests by placing structured bids. Administrators maintain platform integrity by approving agencies, verifying hotel/vehicle assets, and overseeing user-generated content.
All interactions occur via secure REST APIs and real-time communication channels (WebSocket/FCM). The backend follows a service-based layered architecture, ensuring that each module responsible for users, trips, bookings, or assets remains modular and maintainable.
The overall system operates through four major subsystems:
### 1. Traveler Mobile Application
The mobile app enables travelers to register, verify identity, browse hotels, search transport, create Trip Requests, compare bids from agencies, join or create group trips, chat with members, and review completed trips. It serves as the core user-facing interface and interacts heavily with backend services for bookings, profiles, and notifications.
### 2. Travel Agency Web Portal
This portal allows agencies to register their business, upload verification documents, manage multiple hotels and vehicles, create tour packages, and submit competitive bids for Trip Requests. The portal replaces separate hotel and transport owner systems and consolidates all commercial activities into one dashboard.
### 3. Admin Dashboard
The admin portal provides monitoring and verification capabilities. Admins approve or reject agency registrations, hotel listings, and vehicles, verify traveler CNIC submissions, moderate flagged content, and view analytical dashboards. This ensures a safe, trustworthy, and well-regulated environment.
### 4. Backend System
The backend is responsible for authentication, data storage, business logic, notifications, and search operations. It integrates Firebase Authentication for secure login, PostgreSQL for storing structured data, and Google Maps API for destination and location services. Real-time chat and onboarding updates are handled through WebSocket or Firebase Cloud Messaging.







## 3.1 Architectural design















## Process flow/Representation


# Design models
Class Diagram
Sequence Diagram







State Transition






ERD


Package Diagram
# Data design
The data design of TrekPal defines how the system’s information domain is transformed into structured data models that support the functional and non-functional requirements. Since TrekPal uses an object-oriented architecture along with a relational database (PostgreSQL), all major system entities are represented as classes in the backend and tables in the database.
The purpose of the data design is to ensure:
Efficient storage of user, trip, and booking information
Normalized relational structure for consistency
Scalable representation of hotels, vehicles, bids, and chat data
Easy mapping between backend service objects and database tables
Compatibility with ORM tools (Prisma / Sequelize)

## 5.1 Data Organization & Storage
Database Technology: PostgreSQL
All persistent data is stored in PostgreSQL due to its reliability, ACID compliance, relational structure, and support for transactions (important for booking consistency).
Data Storage Breakdown
Data Processing Flow
Frontend > Backend:
Users submit forms (trip requests, bids, bookings, etc).
Backend Services:
Data is validated and mapped into domain objects (classes).
ORM Layer:
Classes are mapped to SQL tables via the ORM.
Database:
Data is inserted, updated, or retrieved using SQL queries.
Business Logic Processing:
Services process data for bidding, matching, booking, notifications, etc.
Relational Design Principles Applied
Normalization:
Hotels, rooms, vehicles, agencies stored separately > avoids redundancy.
Foreign Keys:
Agencies > Hotels > Rooms
Trip Requests > Bids > Bookings
Transactions:
Used for booking confirmation to prevent double-booking.
Indexes:
On agencyId, tripRequestId, email, and vehicleId for fast search.
## 5.2 Data dictionary
AgencyController (class)
Methods:
submitDocuments()
manageHotels()
manageVehicles()

AgencyService





VehicleModel (class)
BidModel (class)
Methods:
submitBid()
withdrawBid()
BookingModel (class)
Methods:
confirmBooking()
cancelBooking()
ChatMessageModel (class)
GroupTrip (class)
Methods:
createGroup()
addMember()
TripRequestModel (class)
Methods:
createRequest()
cancelRequest()
UserModel (class)
Methods:
updateProfile()
verifyIdentity()




























# Algorithm & Implementation
## 6.1 UserModel

Method: updateProfile()
procedure updateProfile(newData)
validate newData
if validation fails then
return error
end if

retrieve existing user from database
update user fields with newData
save updated record
return success
end procedure

Method: verifyIdentity()
procedure verifyIdentity(cnicImages)
ensure both CNIC front & back images exist
upload images to storage
create verification request entry
notify Admin for approval
return pending status
end procedure
## 6.2 AuthService

Method: login()
procedure login(credentials)
send credentials to FirebaseAuth
if Firebase rejects then
return authentication failed
end if

generate JWT session token
return token and user info
end procedure

Method: validateToken()
procedure validateToken(token)
decode token
if expired or tampered then
return invalid
end if
return valid
end procedure
## 6.3 TripRequestModel

Method: createRequest()
procedure createRequest(details)
validate details (dates, destination, pax)
if invalid then
return error
end if

create TripRequest record
assign status = "OPEN"
save in database

notify all active agencies
return requestId
end procedure

Method: cancelRequest()
procedure cancelRequest(requestId)
fetch trip request from DB
if status is ACCEPTED then
return cannot cancel
end if

update status = "CANCELLED"
save
return success
end procedure
## 6.4 BidModel

Method: submitBid()
procedure submitBid(bidData)
validate bidData (price, agency, assets)
ensure agency owns referenced hotel/vehicle

create Bid entry with status = "SUBMITTED"
save to DB

notify traveler
return bidId
end procedure

Method: withdrawBid()
procedure withdrawBid(bidId)
fetch bid
if status = ACCEPTED then
return forbidden
end if

update status = "WITHDRAWN"
save
return success
end procedure
## 6.5 BookingModel

Method: confirmBooking()
procedure confirmBooking(bidId)
begin transaction

fetch bid and related TripRequest
if bid already accepted then
rollback; return error
end if

create booking record
create hotelBooking and/or vehicleBooking
update TripRequest status = "ACCEPTED"

commit transaction
notify both traveler and agency
return bookingId
end procedure

Method: cancelBooking()
procedure cancelBooking(bookingId)
fetch booking
update status = "CANCELLED"
release any reserved rooms/vehicles
save changes
notify agency & traveler
end procedure
## 6.6 AgencyService

Method: manageHotels()
procedure manageHotels(action, data)
switch(action)
case ADD:
validate data
create new hotel record
case UPDATE:
fetch hotel record
apply changes
case DELETE:
remove hotel if no active bookings
end switch
save and return success
end procedure




## 6.7 ChatMessageModel

Method: sendMessage()
procedure sendMessage(message)
validate message length and content
create chatMessage record
broadcast message to group via WebSocket
push notification via Firebase FCM for offline users
end procedure

## 6.8 Algorithm Summary for Backend Processing

A. Trip Request to Booking Flow (System Algorithm)
procedure processTripRequest(travelerInput)
TR = createRequest(travelerInput)
notifyAgencies(TR)

wait for bids
display bids to traveler

if traveler selects bid then
confirmBooking(bidId)
else
request remains open
end if
end procedure

B. Admin Verification Algorithm
procedure verifyEntity(entityId, type)
fetch submitted data
if documents invalid then
mark as REJECTED
notify user
return
end if

mark as APPROVED
notify user
end procedure





# Software requirements traceability matrix
### Table 1: Requirements Traceability Matrix(USER)







### Table 2: Requirements Traceability Matrix(AGENCY)










### Table 1: Requirements Traceability Matrix(ADMIN)














# Human interface design
























# 9.  Appendix I
9.1 Tools Used for Design

9.2 Technology References
The following resources were used for verifying technology capabilities, API details, and architectural suitability:
Flutter Documentation
https://flutter.dev
Used for mobile UI and component architecture.
React.js Documentation
https://react.dev
Used for Travel Agency Portal and Admin Dashboard.
Node.js & Express Documentation
https://nodejs.org
Backend service structure and API design.
PostgreSQL Documentation
https://postgresql.org
Database schema design and relational modeling.
Firebase Documentation
https://firebase.google.com
Authentication, cloud storage, push notifications (FCM).
Google Maps Platform Documentation
https://developers.google.com/maps
Trip location and hotel mapping logic.
9.5 Glossary of Terms

| Name | Date | Reason for changes | Version |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
| Comments (by committee)
*include the ones given at scope time both in doc and presentation | Action Taken |
| --- | --- |
|  |  |
|  |  |
|  |  |
|  |  |
|  |  |
|  |  |
|  |  |
|  |  |
| Category | Storage Method |
| --- | --- |
| User accounts, agencies, hotels, vehicles | PostgreSQL tables |
| Trip Requests, Bids, Bookings | PostgreSQL (relational with foreign keys) |
| Chat messages | PostgreSQL (append-only; indexes for fast lookup) |
| CNIC images, hotel photos | Object Storage (Firebase Storage / Cloud Storage) |
| Authentication tokens | Firebase Auth (not stored manually) |
| Attribute | Type | Description |
| --- | --- | --- |
| agencyId | String | Unique identifier for the agency |
| name | String | Business name |
| licenseNumber | String | Admin-verified license |
| isApproved | Boolean | Approval status |
| Attribute | Type | Description |
| --- | --- | --- |
| hotelId | String | Unique hotel ID |
| agencyId | String | FK to Travel Agency |
| name | String | Hotel name |
| location | String | City / Area |
| rating | Float | Average rating |
| Attribute | Type | Description |
| --- | --- | --- |
| vehicleId | String | Unique vehicle ID |
| type | String | Car, Jeep, Van, Coaster, etc |
| capacity | Integer | Number of passengers |
| pricePerDay | Float | Rate set by agency |
| isApproved | Boolean | Admin-approved? |
| Attribute | Type | Description |
| --- | --- | --- |
| bidId | String | Unique bid identifier |
| agencyId | String | FK |
| tripRequestId | String | FK |
| totalPrice | Float | Full package price |
| status | String | Submitted / Withdrawn / Accepted |
| Attribute | Type | Description |
| --- | --- | --- |
| bookingId | String | Unique booking ID |
| tripRequestId | String | FK |
| travelerId | String | FK |
| status | String | Pending / Confirmed / Cancelled |
| Attribute | Type | Description |
| --- | --- | --- |
| messageId | String | Unique message ID |
| groupId | String | FK |
| senderId | String | FK |
| text | String | Message body |
| timestamp | Date | Sent time |
| Attribute | Type | Description |
| --- | --- | --- |
| groupId | String | Group identifier |
| name | String | Group name |
| capacity | Integer | Max members |
| Attribute | Type | Description |
| --- | --- | --- |
| requestId | String | Unique ID |
| travelerId | String | FK |
| destination | String | City |
| startDate | Date | Trip start |
| endDate | Date | Trip end |
| passengers | Integer | Number of people |
| budget | Float | Max budget |
| status | String | Open / Expired / Accepted |
| Attribute | Type | Description |
| --- | --- | --- |
| userId | String | User identifier |
| name | String | Display name |
| email | String | Login email |
| phone | String | Phone number |
| role | String | Traveler / Admin / Agency |
| isVerified | Boolean | CNIC verified? |
| Req. Number | Ref. Item | Design Component | Component Items |
| --- | --- | --- | --- |
| FR-USER-01 User Registration | Class Diagram | UserModel, AuthService | updateProfile(), login() |
| FR-USER-02 User Login | Sequence Diagram (Auth Flow) | AuthService | login(), validateToken() |
| FR-USER-03 Identity Verification | Class Diagram | UserModel, AdminPortal | verifyIdentity(), reviewVerification() |
| FR-USER-04 Search Hotels | Class Diagram | AgencyService, HotelModel | fetchHotels() (implicit in service) |
| FR-USER-05 Search Transport | Class Diagram | AgencyService, VehicleModel | fetchVehicles() |
| FR-USER-06 Create Trip Request | Activity Diagram (Trip Request Flow) | TripService | createRequest() |
| FR-USER-07 View Bids | Sequence Diagram (Bidding Flow) | BiddingService | fetchBids() |
| FR-USER-08 Accept Bid | Sequence Diagram (Trip > Bid > Booking) | BookingService, BidModel | confirmBooking(), markBidAccepted() |
| FR-USER-09 Join Group Trip | Class Diagram | GroupTrip | addMember() |
| FR-USER-10 Submit Review | (Optional future module) | ReviewModel | submitReview() |
| Req. Number | Ref. Item | Design Component | Component Items |
| --- | --- | --- | --- |
| FR-AGENCY-01 Agency Registration | Package Diagram | AgencyService | submitDocuments() |
| FR-AGENCY-02 Agency Verification | Activity Diagram | AdminPortal | approveEntity(), rejectEntity() |
| FR-AGENCY-03 Manage Hotels | Class Diagram | HotelModel | updateDetails() |
| FR-AGENCY-04 Manage Rooms & Menu | Class Diagram | RoomModel, MenuItem | updateAvailability() |
| FR-AGENCY-05 Manage Vehicles | Class Diagram | VehicleModel | updateAvailability() |
| FR-AGENCY-06 View Trip Requests | Sequence Diagram | TripService | fetchRequests() |
| FR-AGENCY-07 Submit Bid | Sequence Diagram (Bidding Flow) | BidModel | submitBid() |
| FR-AGENCY-08 Manage Accepted Bookings | Activity Diagram | BookingService | confirmBooking(), cancelBooking() |
| FR-AGENCY-09 Create Tour Packages | Class Diagram | TourPackage (optional) | createPackage() |
| Req. Number | Ref. Item | Design Component | Component Items |
| --- | --- | --- | --- |
| FR-ADMIN-01 Approve Agency Registration | Class Diagram | AdminController | reviewVerification() |
| FR-ADMIN-02 Approve Hotels | Class Diagram | AdminPortal | approveEntity() |
| FR-ADMIN-03 Approve Vehicles | Class Diagram | AdminPortal | approveEntity() |
| FR-ADMIN-04 Approve Traveler Identity | Class Diagram | AdminPortal | reviewVerification() |
| FR-ADMIN-05 Moderate Content | Class Diagram | ChatService | deleteMessage(), reviewContent() |
| FR-ADMIN-06 View Analytics | Package Diagram | AdminPortal | viewAnalytics() |
| FR-ADMIN-07 Block/Unblock Accounts | Class Diagram | AdminController | blockUser(), unblockUser() |
| Tool | Purpose |
| --- | --- |
| PlantUML | Class diagrams, sequence diagrams, package diagrams |
| Mermaid.js | Flowcharts, activity diagrams |
| Draw.io / Diagrams.net | High-level architecture sketches |
| Figma | UI mockups and wireframes |
| StarUML (optional) | Alternate UML drafting |
| Term | Description |
| --- | --- |
| Trip Request | A traveler’s request defining destination, dates, and budget. |
| Bid | Offer made by a travel agency in response to a trip request. |
| Group Trip | A trip created for multiple travelers to join. |
| Booking | Confirmed reservation that combines hotel + vehicle details. |
| Agency Service | Backend component handling hotel/vehicle management. |
| FCM | Firebase Cloud Messaging used for push notifications. |
| Workflow | A sequence of automated steps executed by backend services. |