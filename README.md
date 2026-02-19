# 🌍 TrekPal - Travel Management Ecosystem

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)

**A comprehensive travel management platform connecting travelers, agencies, and administrators**

[Quick Start](#-quick-start) • [Architecture](#-architecture) • [Documentation](#-documentation) • [Contributing](docs/CONTRIBUTING.md)

</div>

---

## 📋 Overview

TrekPal is a modular, full-stack travel management ecosystem with three main applications:

- **👤 Traveler App** (Flutter) - Mobile app for travelers
- **🏢 Agency Portal** (React + Vite) - Web portal for travel agencies  
- **⚙️ Admin Portal** (React + Vite) - Web portal for administrators
- **🔧 Backend API** (Node.js + Express + Prisma + PostgreSQL) - RESTful API server

---

## 🏗 Architecture

### System Overview

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
    style M fill:#00BCD4
```

### Data Flow

```mermaid
sequenceDiagram
    participant T as Traveler
    participant A as Agency
    participant API as Backend API
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
    API-->>T: Booking Confirmed
```

For detailed architecture documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🚀 Quick Start

> **NEW:** TrekPal now uses npm workspaces for easy one-click startup!

### Prerequisites

- **Node.js** 18+ (with npm 7+)
- **PostgreSQL** 14+

### 🎯 One-Command Setup (Recommended)

```bash
# 1. Clone repository
git clone <your-repository-url>
cd TrekPal

# 2. Install all dependencies
npm install

# 3. Setup database
npm run db:setup

# 4. Start EVERYTHING (backend + admin + agency)
npm run dev
```

That's it! 🎉

- **Backend API:** http://localhost:3000
- **Admin Portal:** http://localhost:5174
- **Agency Portal:** http://localhost:5173

### 🔧 Selective Startup

```bash
# Start only backend
npm run dev:backend-only

# Start only web portals (admin + agency)
npm run dev:web

# Start individual services
npm run dev:admin-only
npm run dev:agency-only
```

### 📝 Manual Setup (Legacy)

<details>
<summary>Click to expand manual setup instructions</summary>

#### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run seed

# Start server
npm run dev
```

Backend runs at `http://localhost:3000`

#### Agency Portal

```bash
cd agency-portal
npm install
npm run dev
```

Runs at `http://localhost:5173`

#### Admin Portal

```bash
cd admin-portal
npm install
npm run dev
```

Runs at `http://localhost:5174`

</details>

---

## 🔧 Troubleshooting

### Common Issues

#### `npm install` fails

**Issue:** Installation fails with peer dependency errors or ERESOLVE errors.

**Solution:**
```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps

# Or clean install
npm run clean
npm install
```

####  Database connection fails

**Issue:** "Can't reach database server" or "Connection refused"

**Solution:**
1. Ensure PostgreSQL is running
2. Check credentials in `backend/.env`
3. Verify database URL format:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/trekpal"
   ```

#### `concurrently` not found

**Issue:** Getting "command not found: concurrently" when running `npm run dev`

**Solution:**
```bash
# Install root dependencies
npm install
```

#### Port already in use

**Issue:** "Port 3000 is already in use" (or 5173, 5174)

**Solution:**
```bash
# Windows - Kill process on port
netstat -ano | findstr :<PORT>
taskkill /PID <PID> /F

# Or change port in respective .env or vite.config.ts files
```

#### Prisma schema issues

**Issue:** "Environment variable not found: DATABASE_URL"

**Solution:**
```bash
# Ensure .env exists in backend folder
cd backend
cp .env.example .env
# Edit .env

# Regenerate Prisma client
npm run prisma:generate
```

#### Services don't auto-restart

**Issue:** Changes not reflecting, need to manually restart

**Solution:**
- Frontend portals use Vite HMR - should auto-reload
- Backend uses `nodemon` - should auto-restart
- If stuck, stop (`Ctrl+C`) and run `npm run dev` again

### Database Management Scripts

```bash
# View database in browser
npm run db:studio

# Reset database (WARNING: deletes all data)
npm run db:reset

# Regenerate Prisma client
npm run prisma:generate

# Create new migration
cd backend
npx prisma migrate dev --name your_migration_name
```

### Need More Help?

- Check the [full documentation](#-documentation)
- Review backend logs in the terminal
- Ensure all `.env` files are properly configured
- Make sure Node.js version is 18+ (`node --version`)

---

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) folder:

### Setup Guides
- **[Database Setup](docs/setup/database.md)** - PostgreSQL configuration and setup
- **[Admin Portal Setup](docs/setup/admin-portal.md)** - Admin portal installation and configuration

### API Documentation
- **[API Endpoints](docs/api/endpoints.md)** - Complete API reference

### Guides
- **[Testing Agencies](docs/guides/testing-agencies.md)** - Testing guide for agency features

### Project Documentation
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture and design
- **[Contributing](docs/CONTRIBUTING.md)** - Contribution guidelines
- **[TODO](docs/TODO.md)** - Project roadmap and tasks

---

## 🛠 Tech Stack

| Component | Technologies |
|-----------|-------------|
| **Mobile** | Flutter 3.0+, Riverpod/Bloc, Firebase |
| **Web** | React 18.2, TypeScript, Vite, Redux Toolkit, Tailwind CSS |
| **Backend** | Node.js 18+, Express, TypeScript, Prisma, PostgreSQL |
| **Real-time** | Socket.IO |
| **Auth** | JWT, Firebase Auth |

---

## 🛠️ Automated Workflows

This project includes pre-configured workflows to automate common development tasks.

- **/dev**: Starts the Backend, Admin Portal, and Agency Portal simultaneously.
- **/db-reset**: Wipes the database, re-applies migrations, and re-seeds it with fresh test data.

To use these, simply type the slash command in your AI assistant's chat.

## 📁 Project Structure

```
TrekPal/
├── README.md                 # This file
├── docs/                     # Documentation
│   ├── setup/               # Setup guides
│   ├── api/                 # API documentation
│   ├── guides/              # User guides
│   ├── ARCHITECTURE.md      # System architecture
│   ├── CONTRIBUTING.md      # Contribution guidelines
│   └── TODO.md              # Project roadmap
├── backend/                 # Node.js backend
├── admin-portal/            # React admin portal
├── agency-portal/           # React agency portal
└── traveler-app/            # Flutter mobile app
```

---

## ✨ Features

### For Travelers 👤
- 🔐 Secure authentication with Firebase
- 🔍 Browse and search travel packages
- 🏨 Book hotels and transportation
- 💬 Real-time chat with agencies
- ⭐ Rate and review services

### For Travel Agencies 🏢
- 📊 Comprehensive dashboard
- 🏨 Hotel management
- 🚗 Vehicle fleet management
- 📦 Create custom travel packages
- 💼 Bid on trip requests
- 💬 Real-time customer communication

### For Administrators ⚙️
- ✅ Approve/reject agencies, hotels, and vehicles
- 👥 User management
- 📊 Platform-wide analytics
- 🔍 Content moderation

---

## 🔧 Development

### Backend Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open database GUI
npm run seed             # Seed database
npm run lint             # Run linter
```

### Frontend Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

---

## 🔧 Troubleshooting

<details>
<summary><strong>🔴 Database connection failed</strong></summary>

**Solution:**
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify database exists: `psql -U postgres -c "CREATE DATABASE trekpal;"`
</details>

<details>
<summary><strong>🔴 Port already in use</strong></summary>

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
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

For more troubleshooting, see [Database Setup Guide](docs/setup/database.md).

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details on:

- Code of Conduct
- Development workflow
- Coding standards
- Pull request process

---

## 📄 License

ISC License

---

## 👥 Authors

Hashim and Ali

---

<div align="center">

**[⬆ Back to Top](#-trekpal---travel-management-ecosystem)**

Made with ❤️ by the TrekPal Team

</div>
