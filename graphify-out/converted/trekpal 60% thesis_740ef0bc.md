<!-- converted from trekpal 60% thesis.docx -->


COMSATS University Islamabad
Abbottabad, Pakistan

TrekPal

By

Student Name 1      CIIT/SP09-BCS-xxx/ATD
Student Name 2      CIIT/SP09-BCS-xxx/ATD


Supervisor
Supervisor Name


Bachelor of Science in Computer Science (20xx-20xx)


The candidate confirms that the work submitted is their own and appropriate
 credit has been given where reference has been made to the work of others.





COMSATS University, Islamabad Pakistan



Project Name


A project presented to
COMSATS Institute of Information Technology, Islamabad


In partial fulfillment
of the requirement for the degree of



Bachelor of Science in Computer Science (20xx-20xx)

By


Student Name 1	CIIT/SP09-BCS-xxx/ATD
Student Name 2	CIIT/SP09-BCS-xxx/ATD


DECLARATION
We hereby declare that this software, neither whole nor as a part has been copied out from any source. It is further declared that we have developed this software and accompanied report entirely on the basis of our personal efforts. If any part of this project is proved to be copied out from any source or found to be reproduction of some other. We will stand by the consequences. No Portion of the work presented has been submitted of any application for any other degree or qualification of this or any other university or institute of learning.

Student Name 1                                                                               	 Student Name 2

---------------------------                                                                      ---------------------------

CERTIFICATE OF APPROVAL
It is to certify that the final year project of BS (CS) “Project title” was developed by 
STUDENT 1 NAME (CIIT/FAXX-BCS/SE/TN-000) and STUDENT 2 NAME (CIIT/FAXX-BCS/SE/TN-000) under the supervision of “SUPERVISOR NAME” and co supervisor “CO-SUPERVISOR NAME” and that in (their/his/her) opinion; it is fully adequate, in scope and quality for the degree of Bachelors of Science in Computer Sciences.







---------------------------------------
Supervisor



---------------------------------------
External Examiner




---------------------------------------
Head of Department
(Department of Computer Science)



EXECUTIVE SUMMARY
In public places, there is often a need for monitoring people and different activities going on, which can be referred later for many reasons including security. Appointing humans for this task involves many problems such as increased employee hiring, accuracy problem, trust, no proof for later use, and also the fact that a human can remember things till a certain time limit. Talking about the current security system, they use dumb still cameras with a continuous recording facility ir-respective of the fact that any event may happen or not. Moreover they are usually pointing at a specific user defined locations so more than one cameras are required to cover the entire region.

To prevent all these problems from prevailing, the CSCS is developed. It is a surveillance system, which provides solution to many of these problems. It is a stand-alone application which doesn’t require any computer to operate. It monitors different situations using a camera which is able to rotate intelligently based on sensor messages and captures the scene in the form of video or photos later reference as well.

Customizable Surveillance Control System (CSCS) is a surveillance system that can be assigned a sensor type as in our case a heat sensor is used, it works accordingly, rotates the camera upon event detection and perform user defined actions like capturing video and stores them, for the future use.

It is an embedded system consisting of Linux fox kit with embedded a running server application also a camera, USB storage device and a sensor node base station is attached with fox kit. LAN communication is used by user to download the videos and to operate the system manually.

ACKNOWLEDGEMENT
All praise is to Almighty Allah who bestowed upon us a minute portion of His boundless knowledge by virtue of which we were able to accomplish this challenging task.

We are greatly indebted to our project supervisor “Dr. Majid Iqbal Khan” and our Co-Supervisor “Mr. Mukhtar Azeem”. Without their personal supervision, advice and valuable guidance, completion of this project would have been doubtful. We are deeply indebted to them for their encouragement and continual help during this work.

And we are also thankful to our parents and family who have been a constant source of encouragement for us and brought us the values of honesty & hard work.




Student Name 1                                                                               Student Name 2

---------------------------                                                                      ---------------------------

ABBREVIATIONS

TABLE OF CONTENTS
1	Introduction	11
1.1	Brief	11
1.2	Relevance to Course Modules	11
1.3	Project Background	11
1.4	Literature Review	11
1.5	Analysis from Literature Review (in the context of your project)	11
1.6	Methodology and Software Lifecycle for This Project	11
1.6.1	Rationale behind Selected Methodology	11
2	Problem Definition	12
2.1	Problem Statement	12
2.2	Deliverables and Development Requirements	12
2.3	Current System (if applicable to your project)	12
3	Requirement Analysis	13
3.1	Use Cases Diagram(s)	13
3.2	Detailed Use Case	13
3.3	Functional Requirements	13
3.4	Non-Functional Requirements	13
4	Design and Architecture	14
4.1	System Architecture	14
4.2	Data Representation [Diagram + Description]	14
4.3	Process Flow/Representation	14
4.4	Design Models [along with descriptions]	14
5	Implementation	15
5.1	Algorithm	15
5.2	External APIs	15
5.3	User Interface	15
6	Testing and Evaluation	16
6.1	Manual Testing	16
6.1.1	System testing	16
6.1.2	Unit Testing	16
6.1.3	Functional Testing	17
6.1.4	Integration Testing	17
6.2	Automated Testing:	18
Tools used:	18
7	Conclusion and Future Work	19
7.1	Conclusion	19
7.2	Future Work	19
8	References	20


LIST OF FIGURES

Fig 1.1 Block Diagram	8
Fig 2.1 Use Case Diagram	9

LIST OF TABLES

Table 1.1 Table1 	8
Table 2.1 Table 2	9






- Introduction
This chapter presents an overview of the TrekPal system and establishes the context for the entire thesis. It introduces the purpose of the project, outlines the problem domain, and highlights the key objectives and scope of the proposed solution. The chapter also provides a brief understanding of the system’s core functionalities and identifies the stakeholders involved. By setting the foundation for the subsequent chapters, this section ensures a clear understanding of how the project is structured and what it aims to achieve.
TrekPal is a comprehensive travel management platform designed to simplify and modernize the trip planning process. In many regions, travel arrangements are often fragmented, requiring users to interact with multiple service providers for accommodation, transportation, and trip coordination. This lack of integration leads to inefficiencies, limited transparency, and reduced user confidence. TrekPal addresses these challenges by offering a unified digital ecosystem where travelers, travel agencies, and administrators interact within a single platform.
The system enables travelers to explore verified hotels and transportation options, create customized trip requests, and receive competitive bids from registered travel agencies. It further enhances the travel experience by supporting group trips and real time communication, allowing users to collaborate and coordinate effectively. Travel agencies are provided with tools to manage their services, respond to traveler requests, and optimize their offerings, while administrators ensure system reliability through verification and monitoring mechanisms.

- Brief
A very brief introduction of project work, outcome of your work, tools, methodology used & highlights of discussions in various chapters of report. TrekPal is a full-stack, multi-platform travel management system designed to streamline and digitize the travel planning process by connecting travelers, travel agencies, and administrators within a unified digital ecosystem. The system enables travelers to create trip requests, receive competitive bids from travel agencies, compare offers, and confirm bookings in an efficient and structured manner. Travel agencies, on the other hand, can manage their hotels, vehicles, and travel packages while responding to traveler demands through a dynamic bidding mechanism. Administrators ensure platform integrity through verification, moderation, and approval of users and service providers.
The outcome of this project is a scalable and modular travel marketplace system consisting of a Flutter-based mobile application for travelers, React-based web portals for travel agencies and administrators, and a centralized backend built using Node.js, Express, and TypeScript. The backend is integrated with Supabase PostgreSQL for relational data management, Supabase Auth for authentication services, and Socket.IO for real-time communication features such as chat and bid notifications.
The development of TrekPal follows an Object-Oriented Design approach combined with a layered architectural pattern to ensure modularity, maintainability, and scalability. The Agile Scrum methodology is adopted for iterative development, allowing continuous improvement of features and system integration across multiple sprints.

- Relevance to Course Modules
A The TrekPal project is strongly aligned with the core concepts and practical knowledge gained throughout the Bachelor of Science in Computer Science (BCS) program. It integrates multiple academic disciplines and demonstrates their real-world application in the development of a complete software system.
The course Software Engineering is directly reflected in the project through the use of Software Development Life Cycle practices, requirement analysis, system design, and documentation using SRS and SDD standards. The application of Agile Scrum methodology further demonstrates iterative development and project management concepts studied in this course.
From the Database Systems course, the project applies relational database design principles using Supabase PostgreSQL. Concepts such as normalization, entity-relationship modeling, foreign key relationships, and transaction management are implemented in the design of core modules including users, trip requests, bids, and bookings.
The Object Oriented Programming course is applied extensively in both backend and frontend development. The system is structured using classes, objects, encapsulation, and modular design. Key entities such as User, Agency, TripRequest, Bid, and Booking are modeled as object-oriented structures, ensuring maintainability and reusability.
Web Engineering concepts are implemented through the development of React-based web portals for travel agencies and administrators. This includes responsive UI design, component-based architecture, state management using Redux Toolkit, and secure API integration.
The Mobile Application Development course is reflected in the Flutter-based traveler application. It demonstrates cross-platform mobile development, state management using Provider, API integration, and handling of real-time features such as chat and notifications.
The Computer Networks course is applied through the implementation of RESTful APIs, client-server communication, and real-time communication using Socket.IO. Concepts such as HTTP protocols, request-response cycles, and WebSocket communication are utilized for efficient data exchange between system components.
Project Background
TrekPal is designed as a smart travel marketplace system that digitizes and unifies the entire travel planning workflow. Instead of traditional systems where users directly search and book hotels or transport services, TrekPal introduces a structured trip-based model. In this model, a traveler first creates a Trip Request that defines travel details such as destination, dates, budget, and number of travelers. Travel agencies then respond to these requests by submitting competitive bids that include bundled offers such as hotels, transportation, and additional services..
- Literature Review
This The tourism and travel industry has undergone significant transformation with the emergence of digital technologies and online platforms. Traditional travel planning, which relied on physical travel agencies and manual coordination, has largely been replaced by Online Travel Agencies (OTAs) and digital booking platforms. Systems such as Booking.com, Airbnb, Expedia, and TripAdvisor have become global leaders by offering integrated solutions for hotel reservations, transportation booking, and travel planning services.
Modern research highlights that these platforms operate on a marketplace-based model where supply-side providers such as hotels and hosts are connected with demand-side users through centralized systems. Platforms like Airbnb use two-sided marketplace structures where hosts list accommodations and travelers search, compare, and book based on pricing, reviews, and availability. Similarly, Booking.com and Expedia provide large-scale aggregation of travel services, enabling users to compare multiple options in real time and make informed decisions. These systems heavily rely on ranking algorithms, user reviews, and recommendation systems to improve user experience and decision-making efficiency.
Recent advancements in travel technology show a strong shift toward mobile-based booking systems and artificial intelligence integration. Studies indicate that a significant portion of global travel bookings are now completed through mobile applications, highlighting the importance of mobile-first design in modern travel systems. Additionally, AI-powered travel planning tools are increasingly being integrated into major platforms to assist users in generating itineraries, suggesting destinations, and optimizing travel decisions based on preferences and constraints. However, research also shows that while AI improves convenience, it still requires validation due to limitations in accuracy and contextual understanding.
Another important trend in literature is the rise of personalized and dynamic travel planning systems. Instead of static booking models, modern research explores intelligent systems that can generate customized travel experiences based on user preferences, budget, and behavioral data. Some experimental systems introduce automated trip planning agents capable of using external data sources to construct travel itineraries, although their performance in real-world scenarios remains limited.
In addition, trust and safety have become major focus areas in digital travel platforms. Research emphasizes the importance of verification mechanisms, user authentication, and review systems to ensure reliability and reduce fraudulent activities. Many platforms now integrate identity verification and secure payment systems to enhance user confidence and platform credibility.

- Analysis from Literature Review (in the context of your project)
This The literature review highlights that modern travel platforms such as Booking.com, Airbnb, Expedia, and TripAdvisor primarily operate on centralized marketplace models where users directly search, compare, and book travel services. These systems emphasize availability-based search, user reviews, and algorithm-driven recommendations to assist users in selecting suitable options. While these platforms provide efficiency and global accessibility, they largely follow a static booking approach where the traveler is responsible for identifying and selecting the best available option from predefined listings.
In contrast, TrekPal introduces a fundamentally different and more interactive approach by implementing a bid-based travel marketplace. Instead of users manually selecting from existing listings, travelers create structured Trip Requests that define their travel requirements such as destination, dates, budget, and number of passengers. Travel agencies then respond to these requests by submitting competitive bids that include customized packages combining hotels, transport, and additional services. This reverse marketplace model is not commonly observed in traditional travel systems and represents a key distinction from existing solutions identified in the literature
.
- Methodology and Software Lifecycle for This Project
A The development of TrekPal follows an Object-Oriented Design (OOD) methodology combined with the Agile Scrum software development lifecycle. This combination is selected to support the complexity of the system, which consists of multiple interacting modules including travelers, travel agencies, administrators, booking workflows, bidding mechanisms, and real-time communication features.
The Object-Oriented approach is used to model the system in terms of real-world entities such as User, Agency, TripRequest, Bid, Booking, Hotel, and Vehicle. Each entity is represented as a class with well-defined attributes and behaviors, allowing the system to be modular, reusable, and easier to maintain.
For the software development process, the Agile Scrum model is adopted. This model divides the development into iterative cycles (sprints), where each sprint focuses on implementing specific features such as authentication, trip request management, bidding system, chat functionality, or booking workflow. Continuous feedback, testing, and incremental improvement are applied throughout the development lifecycle.
The combination of Object-Oriented Design and Agile methodology ensures that TrekPal is developed in a structured yet flexible manner, allowing changes and enhancements to be incorporated efficiently during the development process.







- Rationale behind Selected Methodology
Why The selection of Object-Oriented Design and Agile Scrum methodology is based on the nature and requirements of the TrekPal system.
Object-Oriented Design is chosen because the system is heavily entity-driven. Real-world objects such as travelers, agencies, hotels, vehicles, and bookings can be directly mapped into classes, which simplifies system modeling and implementation. This approach improves modularity, code reusability, and scalability, which are essential for a system that involves multiple interconnected modules and complex relationships.
Agile Scrum is selected due to the iterative and evolving nature of the project. Since TrekPal includes multiple subsystems such as mobile application, web portals, backend services, and real-time communication modules, it is not practical to develop the entire system in a single linear phase. Agile allows the development team to implement features in small increments, test them continuously, and refine them based on feedback. This reduces development risks and ensures better alignment between requirements and final implementation.
Additionally, Agile supports continuous integration and testing, which is important for a system that depends on multiple technologies such as Flutter, React, Node.js, PostgreSQL, and Socket.IO.

- Problem Definition
This chapter discusses the precise problem to be solved. It should extend to include the outcome.





- Problem Statement
P In the existing travel ecosystem, trip planning and management are highly fragmented and inefficient. Travelers typically rely on multiple independent platforms or traditional travel agencies to arrange accommodations, transportation, and travel packages. This process is often manual, time-consuming, and lacks transparency in pricing and service quality. In many cases, users are required to individually search for hotels and transport services, compare options manually, and coordinate separately with service providers, which leads to inconsistent experiences and increased effort.
Moreover, existing online travel platforms primarily follow a direct booking model where users select from predefined listings. These systems do not support dynamic interaction between travelers and service providers, nor do they provide structured negotiation or bidding mechanisms. As a result, users are limited to static pricing models and have minimal control over customized travel planning.
Another major issue is the lack of trust and verification mechanisms in many informal and semi-digital travel arrangements. Users often face uncertainty regarding the authenticity of service providers, quality of services, and reliability of bookings. Additionally, there is limited integration between different components of travel such as hotels, transport, and group coordination, which further reduces efficiency.
Therefore, there is a need for a centralized, intelligent, and interactive travel management system that can integrate all major travel services into a single platform. The system should enable travelers to define their travel requirements, allow service providers to compete through structured bidding, and ensure secure, verified, and transparent transactions. TrekPal is designed to address these challenges by introducing a unified travel marketplace with real-time communication, bid-based negotiation, and integrated booking management.

- Deliverables and Development Requirements
The TrekPal project delivers a complete multi-platform travel management system consisting of a mobile application, web portals, and a backend server infrastructure. The final deliverables of the project are as follows:
The first deliverable is a Flutter-based mobile application for travelers. This application provides functionalities such as user registration, KYC verification, trip request creation, bid viewing and acceptance, hotel and transport browsing, group trip participation, real-time chat, booking management, and review submission.
The second deliverable is a React-based web portal for travel agencies. This portal enables agencies to register and manage their business profiles, upload and maintain hotel and vehicle listings, create travel packages, view trip requests, submit competitive bids, manage bookings, and communicate with travelers.
The third deliverable is a React-based admin dashboard. This module provides administrative control over the entire system, including verification and approval of travel agencies, hotels, vehicles, and travelers. It also includes content moderation, user management, and analytical reporting features.
The fourth deliverable is a backend system developed using Node.js, Express, and TypeScript. This backend provides RESTful APIs for all system operations, integrates with Supabase PostgreSQL for data storage, handles authentication using Supabase Auth and JWT, and supports real-time communication using Socket.IO.
In terms of development requirements, the system requires a cross-platform development environment supporting Flutter for mobile applications and React for web applications. The backend requires Node.js runtime with TypeScript support and a PostgreSQL-compatible database system. Additionally, real-time communication requires WebSocket support through Socket.IO, and secure authentication requires integration with Supabase services. Proper configuration for file storage, API security, and environment management is also required to ensure system stability and scalability.
Current System (if applicable to your project)
A brief description of an existing system.

The following figure is a sample figure, Figure 2.1. You are required to follow the same style of numbering and caption for the whole report.


Figure 2.1: Sample picture

The following table (Table 2.1) is sample table; you are required to follow the same style of numbering and caption for the whole report.
Table 2.1: Sample Table


The following list style is the sample to consistently follow in the whole report.
List items 1
List items 2

- Requirement Analysis
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







- Design and Architecture
The following parts of Software Design Description (SDD) report should be included in this chapter.








- System Architecture
The overall system operates through four major subsystems:
### 1. Traveler Mobile Application
The mobile app enables travelers to register, verify identity, browse hotels, search transport, create Trip Requests, compare bids from agencies, join or create group trips, chat with members, and review completed trips. It serves as the core user-facing interface and interacts heavily with backend services for bookings, profiles, and notifications.
### 2. Travel Agency Web Portal
This portal allows agencies to register their business, upload verification documents, manage multiple hotels and vehicles, create tour packages, and submit competitive bids for Trip Requests. The portal replaces separate hotel and transport owner systems and consolidates all commercial activities into one dashboard.
### 3. Admin Dashboard
The admin portal provides monitoring and verification capabilities. Admins approve or reject agency registrations, hotel listings, and vehicles, verify traveler CNIC submissions, moderate flagged content, and view analytical dashboards. This ensures a safe, trustworthy, and well-regulated environment.
### 4. Backend System
The backend is responsible for authentication, data storage, business logic, notifications, and search operations. It integrates Firebase Authentication for secure login, PostgreSQL for storing structured data, and Google Maps API for destination and location services. Real-time chat and onboarding updates are handled through WebSocket or Firebase Cloud Messaging.







## Architectural design



- Data Representation [Diagram + Description]
Class Diagram






Sequence Diagram





State Transition






ERD


Package Diagram


- Process Flow/Representation


- Design Models [along with descriptions]
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




| SRS | Software Require Specification |
| --- | --- |
| PC | Personal Computer |
|  |  |
|  |  |
|  |  |
| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Text | Text | Text |
|  |  |  |
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