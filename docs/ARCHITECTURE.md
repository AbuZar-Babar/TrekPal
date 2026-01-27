# 🏗️ TrekPal System Architecture

<div align="center">

**Comprehensive architectural documentation for the TrekPal travel ecosystem**

[Overview](#-system-overview) • [Components](#-system-components) • [Data Flow](#-data-flow) • [Database](#-database-schema)

</div>

---

## 📋 Table of Contents

- [System Overview](#-system-overview)
- [High-Level Architecture](#-high-level-architecture)
- [System Components](#-system-components)
- [Technology Stack](#-technology-stack)
- [Data Flow](#-data-flow)
- [Database Schema](#-database-schema)
- [API Architecture](#-api-architecture)
- [Authentication Flow](#-authentication-flow)
- [Real-Time Communication](#-real-time-communication)
- [Deployment Architecture](#-deployment-architecture)

---

## 🎯 System Overview

TrekPal is a **modular, full-stack travel management ecosystem** built with modern technologies. The system follows a **microservices-inspired architecture** with clear separation of concerns between client applications, backend services, and data layers.

### Design Principles

- ✅ **Modularity** - Independent, reusable components
- ✅ **Scalability** - Horizontal scaling capabilities
- ✅ **Type Safety** - TypeScript throughout the stack
- ✅ **Real-time** - WebSocket support for live updates
- ✅ **Security** - JWT authentication and role-based access
- ✅ **Maintainability** - Clean code and clear documentation

---

## 🏛️ High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Traveler Mobile App<br/>Flutter + Dart]
        B[Agency Web Portal<br/>React + TypeScript]
        C[Admin Web Portal<br/>React + TypeScript]
    end
    
    subgraph "API Gateway"
        D[Express Server<br/>Port 3000]
    end
    
    subgraph "Business Logic Layer"
        E[Auth Module]
        F[Agency Module]
        G[Hotel Module]
        H[Transport Module]
        I[Booking Module]
        J[Admin Module]
    end
    
    subgraph "Data Access Layer"
        K[Prisma ORM]
    end
    
    subgraph "Database Layer"
        L[(PostgreSQL<br/>Database)]
    end
    
    subgraph "Real-Time Layer"
        M[Socket.IO Server]
    end
    
    subgraph "External Services"
        N[Firebase Auth]
        O[Firebase Storage]
    end
    
    A -->|HTTP/HTTPS| D
    B -->|HTTP/HTTPS| D
    C -->|HTTP/HTTPS| D
    
    A -.->|WebSocket| M
    B -.->|WebSocket| M
    
    D --> E
    D --> F
    D --> G
    D --> H
    D --> I
    D --> J
    
    E --> K
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K
    
    K --> L
    
    D -.->|Optional| N
    D -.->|Optional| O
    
    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
    style D fill:#9C27B0
    style L fill:#F44336
    style M fill:#00BCD4
```

---

## 🧩 System Components

### 1. Client Applications

#### Traveler Mobile App (Flutter)
```mermaid
graph LR
    A[Presentation Layer] --> B[Domain Layer]
    B --> C[Data Layer]
    
    A --> A1[Screens/Widgets]
    A --> A2[State Management]
    
    B --> B1[Use Cases]
    B --> B2[Entities]
    B --> B3[Repository Interfaces]
    
    C --> C1[Repository Implementations]
    C --> C2[Data Sources]
    C --> C3[Models]
    
    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
```

**Features:**
- Clean Architecture + MVVM pattern
- State management with Riverpod/Bloc
- Offline-first capabilities
- Firebase integration
- Real-time chat

#### Agency Portal (React)
```mermaid
graph LR
    A[Components] --> B[Modules]
    B --> C[Store]
    C --> D[API Layer]
    
    A --> A1[Layout]
    A --> A2[Common]
    A --> A3[Forms]
    
    B --> B1[Hotels]
    B --> B2[Vehicles]
    B --> B3[Packages]
    B --> B4[Bookings]
    
    C --> C1[Redux Slices]
    C --> C2[React Query]
    
    D --> D1[Axios Instance]
    D --> D2[API Endpoints]
    
    style A fill:#2196F3
    style B fill:#9C27B0
    style C fill:#FF9800
    style D fill:#4CAF50
```

**Features:**
- Redux Toolkit for state management
- React Query for server state
- Tailwind CSS for styling
- Protected routes
- Real-time notifications

#### Admin Portal (React)
Similar architecture to Agency Portal with admin-specific features:
- Platform oversight
- Approval workflows
- Analytics dashboard
- User management

### 2. Backend Services

#### Express API Server

```mermaid
graph TB
    A[HTTP Request] --> B[Middleware Stack]
    B --> C{Route Handler}
    C --> D[Controller]
    D --> E[Service Layer]
    E --> F[Prisma ORM]
    F --> G[(Database)]
    
    B --> B1[CORS]
    B --> B2[Body Parser]
    B --> B3[Auth Middleware]
    B --> B4[Error Handler]
    
    E --> E1[Business Logic]
    E --> E2[Validation]
    E --> E3[Data Transformation]
    
    style A fill:#4CAF50
    style C fill:#2196F3
    style E fill:#9C27B0
    style G fill:#F44336
```

**Module Structure:**
```
backend/src/
├── config/              # Configuration files
│   ├── env.ts          # Environment variables
│   └── firebase.ts     # Firebase setup
├── middlewares/         # Express middlewares
│   ├── auth.middleware.ts
│   └── error.middleware.ts
├── modules/             # Feature modules
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.types.ts
│   ├── agency/
│   ├── hotels/
│   ├── transport/
│   ├── bookings/
│   └── admin/
├── utils/               # Utility functions
├── ws/                  # WebSocket handlers
└── server.ts            # Application entry point
```

---

## 💻 Technology Stack

### Frontend Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Mobile** | Flutter 3.0+ | Cross-platform mobile framework |
| **Web** | React 18.2 | UI library |
| **Language** | TypeScript 5.3 | Type-safe JavaScript |
| **Build Tool** | Vite 5.0 | Fast build and HMR |
| **State** | Redux Toolkit | Global state management |
| **Server State** | React Query | API data caching |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **HTTP** | Axios | HTTP client |

### Backend Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Framework** | Express 4.18 | Web framework |
| **Language** | TypeScript 5.3 | Type safety |
| **ORM** | Prisma 5.7 | Database toolkit |
| **Database** | PostgreSQL 14+ | Relational database |
| **WebSocket** | Socket.IO 4.6 | Real-time communication |
| **Auth** | JWT + Firebase | Authentication |
| **Validation** | Zod 3.22 | Schema validation |

---

## 🔄 Data Flow

### Request-Response Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant Ctrl as Controller
    participant Svc as Service
    participant ORM as Prisma
    participant DB as PostgreSQL
    
    C->>M: HTTP Request
    M->>M: CORS Check
    M->>M: Parse Body
    M->>M: Authenticate
    M->>Ctrl: Validated Request
    Ctrl->>Svc: Call Service Method
    Svc->>Svc: Business Logic
    Svc->>ORM: Query Database
    ORM->>DB: SQL Query
    DB-->>ORM: Result Set
    ORM-->>Svc: Typed Data
    Svc-->>Ctrl: Processed Data
    Ctrl-->>M: Response
    M-->>C: JSON Response
```

### Booking Flow Example

```mermaid
sequenceDiagram
    participant T as Traveler
    participant A as Agency
    participant API as Backend
    participant DB as Database
    participant WS as WebSocket
    
    T->>API: Create Trip Request
    API->>DB: Save Request
    DB-->>API: Request ID
    API->>WS: Notify Agencies
    WS-->>A: New Request Alert
    
    A->>API: Submit Bid
    API->>DB: Save Bid
    DB-->>API: Bid ID
    API->>WS: Notify Traveler
    WS-->>T: New Bid Alert
    
    T->>API: Accept Bid
    API->>DB: Create Booking
    API->>DB: Update Bid Status
    DB-->>API: Booking Created
    API->>WS: Notify Agency
    WS-->>A: Booking Confirmed
    API-->>T: Booking Details
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Agency : owns
    User ||--o{ TripRequest : creates
    User ||--o{ Booking : makes
    User ||--o{ Review : writes
    User ||--o{ Message : sends
    
    Agency ||--o{ Hotel : manages
    Agency ||--o{ Vehicle : owns
    Agency ||--o{ TravelPackage : offers
    Agency ||--o{ Bid : submits
    Agency ||--o{ Message : receives
    
    Hotel ||--o{ Room : contains
    Hotel ||--o{ Review : receives
    Hotel ||--o{ Booking : included_in
    
    Vehicle ||--o{ Booking : included_in
    
    TravelPackage ||--o{ PackageItem : contains
    
    TripRequest ||--o{ Bid : receives
    
    Bid ||--o| Booking : converts_to
    
    Booking ||--o{ Review : generates
    Booking ||--o{ Payment : requires
    
    User {
        string id PK
        string firebaseUid UK
        string email UK
        string name
        string phone
        string cnic
        enum role
        enum status
        datetime createdAt
    }
    
    Agency {
        string id PK
        string userId FK
        string name
        string license
        string address
        enum approvalStatus
        datetime createdAt
    }
    
    Hotel {
        string id PK
        string agencyId FK
        string name
        string location
        decimal rating
        enum approvalStatus
        datetime createdAt
    }
    
    Vehicle {
        string id PK
        string agencyId FK
        string type
        int capacity
        decimal pricePerDay
        enum approvalStatus
        datetime createdAt
    }
    
    Booking {
        string id PK
        string userId FK
        string agencyId FK
        datetime startDate
        datetime endDate
        decimal totalPrice
        enum status
        datetime createdAt
    }
```

### Key Tables

#### Users
- Stores all user accounts (travelers, agency owners, admins)
- Linked to Firebase authentication
- Role-based access control

#### Agencies
- Travel agency information
- Approval workflow (PENDING → APPROVED/REJECTED)
- Linked to owner user account

#### Hotels
- Hotel listings managed by agencies
- Room inventory
- Approval workflow

#### Vehicles
- Vehicle fleet managed by agencies
- Pricing and availability
- Approval workflow

#### Bookings
- Central booking entity
- Links users, agencies, hotels, vehicles
- Payment tracking
- Status management

---

## 🔌 API Architecture

### RESTful API Design

```
/api
├── /auth
│   ├── POST /register/user
│   ├── POST /register/agency
│   ├── POST /login
│   └── GET /profile
├── /agencies
│   ├── GET /
│   ├── GET /:id
│   └── PUT /:id
├── /hotels
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   └── PUT /:id
├── /transport
│   ├── GET /
│   ├── POST /
│   ├── PUT /:id
│   └── DELETE /:id
├── /bookings
│   ├── GET /
│   ├── POST /
│   └── GET /:id
└── /admin
    ├── GET /agencies
    ├── POST /agencies/:id/approve
    ├── GET /hotels
    ├── POST /hotels/:id/approve
    └── GET /reports/dashboard
```

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": { /* validation errors */ }
}
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Backend API
    participant FB as Firebase Auth
    participant DB as Database
    
    Note over C,DB: Registration Flow
    C->>FB: Create Account
    FB-->>C: Firebase UID
    C->>API: Register with UID
    API->>DB: Create User Record
    DB-->>API: User Created
    API->>API: Generate JWT
    API-->>C: JWT Token + User Data
    
    Note over C,DB: Login Flow
    C->>FB: Sign In
    FB-->>C: Firebase Token
    C->>API: Login with Token
    API->>FB: Verify Token
    FB-->>API: Token Valid
    API->>DB: Get User Data
    DB-->>API: User Record
    API->>API: Generate JWT
    API-->>C: JWT Token + User Data
    
    Note over C,DB: Protected Request
    C->>API: Request + JWT
    API->>API: Verify JWT
    API->>DB: Fetch Data
    DB-->>API: Data
    API-->>C: Response
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "uid": "firebase-uid",
    "email": "user@example.com",
    "role": "TRAVELER",
    "iat": 1234567890,
    "exp": 1234654290
  }
}
```

---

## 💬 Real-Time Communication

### WebSocket Architecture

```mermaid
graph TB
    subgraph "Clients"
        A[Traveler App]
        B[Agency Portal]
    end
    
    subgraph "Socket.IO Server"
        C[Connection Manager]
        D[Room Manager]
        E[Event Handlers]
    end
    
    subgraph "Events"
        F[chat:message]
        G[booking:update]
        H[bid:new]
        I[notification:new]
    end
    
    A -->|Connect| C
    B -->|Connect| C
    C --> D
    D --> E
    E --> F
    E --> G
    E --> H
    E --> I
    
    style C fill:#00BCD4
    style D fill:#2196F3
    style E fill:#9C27B0
```

### Socket Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `chat:message` | Bidirectional | Real-time messaging |
| `booking:update` | Server → Client | Booking status changes |
| `bid:new` | Server → Client | New bid notifications |
| `notification:new` | Server → Client | General notifications |
| `user:online` | Server → Client | User presence |

---

## 🚀 Deployment Architecture

### Production Deployment

```mermaid
graph TB
    subgraph "CDN"
        A[CloudFlare/AWS CloudFront]
    end
    
    subgraph "Load Balancer"
        B[NGINX/AWS ALB]
    end
    
    subgraph "Application Servers"
        C1[Node.js Instance 1]
        C2[Node.js Instance 2]
        C3[Node.js Instance 3]
    end
    
    subgraph "Database Cluster"
        D1[(Primary PostgreSQL)]
        D2[(Replica 1)]
        D3[(Replica 2)]
    end
    
    subgraph "Cache Layer"
        E[Redis Cluster]
    end
    
    subgraph "File Storage"
        F[AWS S3/Firebase Storage]
    end
    
    A --> B
    B --> C1
    B --> C2
    B --> C3
    
    C1 --> E
    C2 --> E
    C3 --> E
    
    C1 --> D1
    C2 --> D1
    C3 --> D1
    
    D1 --> D2
    D1 --> D3
    
    C1 -.-> F
    C2 -.-> F
    C3 -.-> F
    
    style A fill:#FF9800
    style B fill:#2196F3
    style D1 fill:#F44336
    style E fill:#4CAF50
```

### Scaling Strategy

#### Horizontal Scaling
- Multiple Node.js instances behind load balancer
- Stateless application design
- Session management with Redis

#### Database Scaling
- Primary-replica replication
- Read replicas for query distribution
- Connection pooling with Prisma

#### Caching Strategy
- Redis for session storage
- API response caching
- Database query result caching

---

## 📊 Performance Considerations

### Optimization Techniques

| Area | Technique | Benefit |
|------|-----------|---------|
| **Database** | Indexing | Faster queries |
| **Database** | Connection pooling | Reduced overhead |
| **API** | Response caching | Reduced load |
| **API** | Pagination | Smaller payloads |
| **Frontend** | Code splitting | Faster initial load |
| **Frontend** | Lazy loading | On-demand resources |
| **Images** | CDN delivery | Faster asset loading |
| **Images** | Compression | Reduced bandwidth |

---

## 🔒 Security Architecture

### Security Layers

```mermaid
graph TB
    A[Client Request] --> B[HTTPS/TLS]
    B --> C[CORS Policy]
    C --> D[Rate Limiting]
    D --> E[JWT Verification]
    E --> F[Role-Based Access]
    F --> G[Input Validation]
    G --> H[SQL Injection Prevention]
    H --> I[Business Logic]
    
    style B fill:#F44336
    style E fill:#FF9800
    style F fill:#4CAF50
    style H fill:#2196F3
```

### Security Measures

- ✅ HTTPS/TLS encryption
- ✅ JWT token authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Secure password hashing

---

<div align="center">

**[⬆ Back to Top](#️-trekpal-system-architecture)**

For more information, see the [main README](README.md)

</div>
