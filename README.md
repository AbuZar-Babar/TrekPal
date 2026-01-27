# 🌍 TrekPal - Travel Management Ecosystem

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)

**A comprehensive travel management platform connecting travelers, agencies, and administrators**

[Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](docs/CONTRIBUTING.md)

</div>

---

## 📋 Overview

TrekPal is a modular, full-stack travel management ecosystem with three main applications:

- **👤 Traveler App** (Flutter) - Mobile app for travelers
- **🏢 Agency Portal** (React + Vite) - Web portal for travel agencies  
- **⚙️ Admin Portal** (React + Vite) - Web portal for administrators
- **🔧 Backend API** (Node.js + Express + Prisma + PostgreSQL) - RESTful API server

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd TrekPal
```

### 2. Backend Setup

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

### 3. Agency Portal

```bash
cd agency-portal
npm install
npm run dev
```

Runs at `http://localhost:5173`

### 4. Admin Portal

```bash
cd admin-portal
npm install
npm run dev
```

Runs at `http://localhost:5174`

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

### Database Connection Failed
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify database exists: `psql -U postgres -c "CREATE DATABASE trekpal;"`

### Port Already in Use

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

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
