# 🌍 TrekPal - Modular Travel Ecosystem

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)
![Flutter](https://img.shields.io/badge/Flutter-3.0%2B-02569B.svg)

**A comprehensive travel management platform connecting travelers, agencies, and administrators**

[Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

TrekPal is a modern, full-stack travel management ecosystem that seamlessly connects three key stakeholders:

- **👤 Travelers** - Mobile app for discovering and booking travel experiences
- **🏢 Travel Agencies** - Web portal for managing services and bookings
- **⚙️ Administrators** - Web portal for platform oversight and approvals

### System Architecture

```mermaid
graph TB
    subgraph "Client Applications"
        A[Traveler Mobile App<br/>Flutter]
        B[Agency Portal<br/>React + Vite]
        C[Admin Portal<br/>React + Vite]
    end
    
    subgraph "Backend Services"
        D[REST API<br/>Node.js + Express]
        E[WebSocket Server<br/>Socket.IO]
    end
    
    subgraph "Data Layer"
        F[(PostgreSQL<br/>Database)]
        G[Prisma ORM]
    end
    
    subgraph "External Services"
        H[Firebase Auth]
        I[Firebase Storage]
    end
    
    A -->|HTTP/WS| D
    B -->|HTTP/WS| D
    C -->|HTTP| D
    D --> E
    D --> G
    G --> F
    D -.->|Optional| H
    D -.->|Optional| I
    
    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#FF9800
    style D fill:#9C27B0
    style F fill:#F44336
```

---

## ✨ Features

### For Travelers 👤
- 🔐 Secure authentication with Firebase
- 🔍 Browse and search travel packages
- 🏨 Book hotels and transportation
- 💬 Real-time chat with agencies
- ⭐ Rate and review services
- 📱 Cross-platform mobile experience

### For Travel Agencies 🏢
- 📊 Comprehensive dashboard
- 🏨 Hotel management (add, edit, approve)
- 🚗 Vehicle fleet management
- 📦 Create custom travel packages
- 💼 Bid on trip requests
- 📈 Analytics and reporting
- 💬 Real-time customer communication

### For Administrators ⚙️
- ✅ Approve/reject agencies, hotels, and vehicles
- 👥 User management
- 📊 Platform-wide analytics
- 🔍 Content moderation
- 📈 Dashboard with key metrics

---

## 🏗 Architecture

### Project Structure

```
TrekPal/
├── 📱 traveler-app/          # Flutter mobile application
│   ├── lib/
│   │   ├── core/            # Core utilities and constants
│   │   ├── data/            # Data layer (repositories, models)
│   │   ├── domain/          # Business logic (entities, use cases)
│   │   └── presentation/    # UI layer (screens, widgets)
│   └── pubspec.yaml
│
├── 🌐 agency-portal/         # React.js agency web portal
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── modules/         # Feature modules
│   │   ├── store/           # Redux state management
│   │   └── utils/           # Utility functions
│   └── package.json
│
├── ⚙️ admin-portal/          # React.js admin web portal
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── modules/         # Feature modules
│   │   ├── store/           # Redux state management
│   │   └── utils/           # Utility functions
│   └── package.json
│
└── 🔧 backend/               # Node.js Express backend
    ├── prisma/              # Database schema and migrations
    ├── src/
    │   ├── config/          # Configuration files
    │   ├── middlewares/     # Express middlewares
    │   ├── modules/         # Feature modules
    │   ├── utils/           # Utility functions
    │   └── ws/              # WebSocket handlers
    └── package.json
```

### Data Flow Diagram

```mermaid
sequenceDiagram
    participant T as Traveler App
    participant A as Agency Portal
    participant API as Backend API
    participant DB as PostgreSQL
    participant WS as WebSocket
    
    T->>API: Request trip packages
    API->>DB: Query packages
    DB-->>API: Return data
    API-->>T: Send packages
    
    T->>API: Create trip request
    API->>DB: Save request
    API->>WS: Notify agencies
    WS-->>A: Real-time notification
    
    A->>API: Submit bid
    API->>DB: Save bid
    API->>WS: Notify traveler
    WS-->>T: Real-time notification
```

---

## 🛠 Tech Stack

### Mobile App (Flutter)
| Technology | Purpose |
|------------|---------|
| **Flutter 3.0+** | Cross-platform mobile framework |
| **Riverpod/Bloc** | State management |
| **Firebase Auth** | User authentication |
| **Firebase Storage** | File uploads |
| **Socket.IO Client** | Real-time communication |
| **Dio** | HTTP client |

### Web Portals (React.js)
| Technology | Purpose |
|------------|---------|
| **React 18.2** | UI library |
| **TypeScript 5.3** | Type safety |
| **Vite 5.0** | Build tool |
| **Redux Toolkit** | State management |
| **React Query** | Server state management |
| **Tailwind CSS** | Styling framework |
| **Axios** | HTTP client |

### Backend (Node.js)
| Technology | Purpose |
|------------|---------|
| **Node.js 18+** | Runtime environment |
| **Express 4.18** | Web framework |
| **TypeScript 5.3** | Type safety |
| **Prisma 5.7** | ORM |
| **PostgreSQL 14+** | Database |
| **Socket.IO** | WebSocket server |
| **JWT** | Authentication tokens |
| **Zod** | Schema validation |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Download |
|-------------|---------|----------|
| **Node.js** | 18.0+ | [nodejs.org](https://nodejs.org/) |
| **npm** or **yarn** | Latest | Included with Node.js |
| **PostgreSQL** | 14.0+ | [postgresql.org](https://www.postgresql.org/) |
| **Flutter SDK** | 3.0+ | [flutter.dev](https://flutter.dev/) (mobile app only) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### Optional
- **pgAdmin** - PostgreSQL GUI tool
- **Firebase Account** - For production authentication

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd TrekPal
```

### 2️⃣ Backend Setup (Required First)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run seed

# Start backend server
npm run dev
```

✅ Backend running at `http://localhost:3000`

### 3️⃣ Agency Portal Setup

```bash
# Open new terminal
cd agency-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Agency Portal running at `http://localhost:5173`

### 4️⃣ Admin Portal Setup

```bash
# Open new terminal
cd admin-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Admin Portal running at `http://localhost:5174`

### 5️⃣ Access the Applications

| Application | URL | Default Credentials |
|-------------|-----|---------------------|
| **Backend API** | http://localhost:3000/api | N/A |
| **Agency Portal** | http://localhost:5173 | Any email/password (dev mode) |
| **Admin Portal** | http://localhost:5174 | Any email/password (dev mode) |
| **Health Check** | http://localhost:3000/health | N/A |

---

## 📖 Detailed Setup

### Backend Configuration

#### Environment Variables

Create `backend/.env` with the following configuration:

```env
# Environment
NODE_ENV=development
PORT=3000

# Database (REQUIRED)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/trekpal?schema=public"

# JWT (REQUIRED - minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Firebase (Optional for development)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_STORAGE_BUCKET=
```

> [!IMPORTANT]
> Replace `YOUR_PASSWORD` with your actual PostgreSQL password!

#### Database Setup

**Option A: Using psql**
```bash
psql -U postgres -c "CREATE DATABASE trekpal;"
```

**Option B: Using pgAdmin**
1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `trekpal`
4. Click "Save"

#### Run Migrations

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run seed  # Optional: Add sample data
```

### Frontend Configuration

Both portals use similar configuration:

**agency-portal/.env** or **admin-portal/.env**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register/user` | Register traveler | ❌ |
| `POST` | `/auth/register/agency` | Register agency | ❌ |
| `POST` | `/auth/login` | Login user/agency/admin | ❌ |
| `GET` | `/auth/profile` | Get current user profile | ✅ |
| `POST` | `/auth/verify-cnic` | Verify CNIC | ✅ |

### Agency Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/agencies` | Get all agencies | ❌ |
| `GET` | `/agencies/:id` | Get agency by ID | ❌ |
| `PUT` | `/agencies/:id` | Update agency | ✅ Agency |

### Hotel Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/hotels` | Get all hotels | ❌ |
| `POST` | `/hotels` | Create hotel | ✅ Agency |
| `GET` | `/hotels/:id` | Get hotel details | ❌ |
| `PUT` | `/hotels/:id` | Update hotel | ✅ Agency |

### Transport Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/transport` | Get all vehicles | ✅ Agency |
| `POST` | `/transport` | Create vehicle | ✅ Agency |
| `PUT` | `/transport/:id` | Update vehicle | ✅ Agency |
| `DELETE` | `/transport/:id` | Delete vehicle | ✅ Agency |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/admin/agencies` | Get all agencies | ✅ Admin |
| `POST` | `/admin/agencies/:id/approve` | Approve agency | ✅ Admin |
| `POST` | `/admin/agencies/:id/reject` | Reject agency | ✅ Admin |
| `GET` | `/admin/hotels` | Get all hotels | ✅ Admin |
| `POST` | `/admin/hotels/:id/approve` | Approve hotel | ✅ Admin |
| `GET` | `/admin/vehicles` | Get all vehicles | ✅ Admin |
| `POST` | `/admin/vehicles/:id/approve` | Approve vehicle | ✅ Admin |
| `GET` | `/admin/reports/dashboard` | Get dashboard stats | ✅ Admin |

> [!TIP]
> For detailed API documentation with request/response examples, see [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

---

## 💻 Development

### Available Scripts

#### Backend
```bash
npm run dev              # Start development server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run seed             # Seed database with sample data
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # TypeScript type checking
```

#### Frontend (Agency/Admin Portal)
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run lint:fix # Fix ESLint errors
```

### Code Quality

- ✅ TypeScript strict mode enabled
- ✅ ESLint for code linting
- ✅ Consistent naming conventions
- ✅ Modular architecture

---

## 🔧 Troubleshooting

<details>
<summary><strong>🔴 Database connection failed</strong></summary>

**Solution:**
1. Check PostgreSQL service is running
   - Windows: `services.msc` → Find "postgresql" → Start
   - Mac: `brew services start postgresql`
   - Linux: `sudo systemctl start postgresql`
2. Verify `DATABASE_URL` in `.env` is correct
3. Test connection: `psql -U postgres -c "SELECT version();"`
</details>

<details>
<summary><strong>🔴 Password authentication failed</strong></summary>

**Solution:**
1. Check PostgreSQL password in `.env`
2. Default username is usually `postgres`
3. Reset password if needed via pgAdmin
</details>

<details>
<summary><strong>🔴 Database does not exist</strong></summary>

**Solution:**
```bash
psql -U postgres -c "CREATE DATABASE trekpal;"
```
</details>

<details>
<summary><strong>🔴 Prisma Client not generated</strong></summary>

**Solution:**
```bash
cd backend
npm run prisma:generate
```
</details>

<details>
<summary><strong>🔴 Network Error / Connection refused</strong></summary>

**Solution:**
1. Ensure backend server is running on port 3000
2. Check `VITE_API_BASE_URL` in frontend `.env`
3. Verify no firewall blocking the connection
</details>

<details>
<summary><strong>🔴 CORS error</strong></summary>

**Solution:**
1. Backend CORS is configured for `localhost:5173` and `localhost:5174`
2. Update `CORS_ORIGIN` in backend `.env` if using different ports
</details>

<details>
<summary><strong>🔴 Port already in use</strong></summary>

**Solution:**

**Windows:**
```bash
# Find process using port
netstat -ano | findstr :3000
# Kill process (replace PID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

**Or change port:**
```bash
npm run dev -- --port 5175
```
</details>

---

## 📁 Additional Resources

- 📘 [Database Setup Guide](backend/DATABASE_SETUP.md)
- 📗 [Quick Start Guide](backend/QUICK_START.md)
- 📙 [Environment Setup](backend/SETUP_ENV.md)
- 📕 [API Documentation](backend/API_DOCUMENTATION.md)
- 📔 [Admin Portal Setup](ADMIN_PORTAL_SETUP.md)
- 📓 [Testing Agencies](TESTING_AGENCIES.md)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style Guidelines
- Follow TypeScript/JavaScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Write clean, readable code
- Test your changes before submitting

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👥 Authors

**Hashim and Ali**

---

## 🙏 Acknowledgments

- Built with ❤️ using modern web technologies
- Powered by open-source software
- Special thanks to all contributors

---

<div align="center">

**[⬆ Back to Top](#-trekpal---modular-travel-ecosystem)**

Made with ❤️ by the TrekPal Team

</div>
