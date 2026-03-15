# ⚙️ Admin Portal Setup Guide

<div align="center">

![Admin Portal](https://img.shields.io/badge/Admin-Portal-orange.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0.11-646CFF.svg)

**Complete setup guide for the TrekPal Admin Portal**

[Features](#-features) • [Setup](#-setup) • [API Reference](#-api-reference) • [Testing](#-testing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Backend Setup](#-backend-setup)
- [Frontend Setup](#-frontend-setup)
- [API Reference](#-api-reference)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

The **Admin Portal** is a React.js web application that provides administrators with comprehensive platform management capabilities. It enables oversight of agencies, hotels, vehicles, users, and provides detailed analytics.

### Key Capabilities

- ✅ Approve/reject travel agencies
- ✅ Approve/reject hotels and accommodations
- ✅ Approve/reject vehicles
- 👥 Manage platform users
- 📊 View dashboard statistics and analytics
- 🔍 Content moderation and oversight

---

## ✨ Features

### Implemented Features

#### ✅ Backend
- [x] Admin authentication and authorization
- [x] Agency approval/rejection endpoints
- [x] Hotel approval/rejection endpoints
- [x] Vehicle approval/rejection endpoints
- [x] User management endpoints
- [x] Dashboard statistics endpoint
- [x] Comprehensive seed script with dummy data

#### ✅ Frontend
- [x] Admin login page
- [x] Protected routes with authentication
- [x] Responsive sidebar navigation
- [x] Header with user info and logout
- [x] Agency management (list, approve, reject)
- [x] Hotel management (list, approve, reject)
- [x] Vehicle management (list, approve, reject)
- [x] Responsive UI with Tailwind CSS
- [x] Redux Toolkit for state management
- [x] React Query for server state

---

## 🏗 Architecture

### Component Structure

```mermaid
graph TB
    subgraph "Admin Portal"
        A[App.tsx]
        A --> B[Login Page]
        A --> C[Protected Routes]
        
        C --> D[Dashboard Layout]
        D --> E[Sidebar]
        D --> F[Header]
        D --> G[Main Content]
        
        G --> H[Agencies Module]
        G --> I[Hotels Module]
        G --> J[Vehicles Module]
        G --> K[Users Module]
        G --> L[Dashboard Module]
    end
    
    subgraph "State Management"
        M[Redux Store]
        M --> N[Auth Slice]
        M --> O[UI Slice]
    end
    
    subgraph "API Layer"
        P[Axios Instance]
        P --> Q[Auth API]
        P --> R[Admin API]
    end
    
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    
    H --> P
    I --> P
    J --> P
    K --> P
    L --> P
    
    style A fill:#FF9800
    style M fill:#9C27B0
    style P fill:#2196F3
```

### Data Flow

```mermaid
sequenceDiagram
    participant U as Admin User
    participant UI as Admin Portal
    participant Redux as Redux Store
    participant API as Backend API
    participant DB as PostgreSQL
    
    U->>UI: Login with token
    UI->>API: POST /api/auth/admin/login
    API->>DB: Verify admin credentials
    DB-->>API: Admin data
    API-->>UI: JWT token + admin info
    UI->>Redux: Store auth state
    
    U->>UI: View pending agencies
    UI->>API: GET /api/admin/agencies
    API->>DB: Query agencies
    DB-->>API: Agency list
    API-->>UI: Return agencies
    UI->>Redux: Update agencies state
    
    U->>UI: Approve agency
    UI->>API: POST /api/admin/agencies/:id/approve
    API->>DB: Update agency status
    DB-->>API: Updated agency
    API-->>UI: Success response
    UI->>Redux: Update agency in state
```

---

## 📦 Prerequisites

Ensure you have the following installed:

- ✅ Node.js 18+
- ✅ npm or yarn
- ✅ PostgreSQL 14+
- ✅ Backend server running

---

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create `backend/.env`:

```env
# Environment
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/trekpal?schema=public"

# JWT (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Supabase (optional for development)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET_KYC=kyc-private
SUPABASE_SIGNED_URL_TTL_SECONDS=3600

# CORS (allow admin portal)
CORS_ORIGIN=http://localhost:5174
```

> [!IMPORTANT]
> Replace `YOUR_PASSWORD` with your actual PostgreSQL password!

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with sample data
npm run seed
```

#### Seed Data Includes:

| Data Type | Count | Description |
|-----------|-------|-------------|
| **Admin Users** | 1 | `admin@trekpal.com` |
| **Travelers** | 8 | Sample traveler accounts |
| **Agencies** | 5 | Mix of approved, pending, rejected |
| **Hotels** | 5 | With rooms and amenities |
| **Vehicles** | 5 | Different types and capacities |
| **Packages** | 2 | Sample travel packages |
| **Bookings** | Multiple | Sample booking data |
| **Reviews** | Multiple | Sample reviews |

### 4. Start Backend Server

```bash
npm run dev
```

✅ Backend running at `http://localhost:3000`

---

## 🌐 Frontend Setup

### 1. Install Dependencies

```bash
cd admin-portal
npm install
```

### 2. Configure Environment

Create `admin-portal/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Start Development Server

```bash
npm run dev
```

✅ Admin Portal running at `http://localhost:5174`

---

## 🔐 Login

### Development Mode

For testing purposes, you can use **any token string** in the login form. The backend recognizes it as an admin token in development mode.

**Example:**
- Token: `admin` or `test-admin-token`

> [!WARNING]
> In production, this should be replaced with proper Supabase Authentication!

### Production Mode

In production, implement proper authentication:
1. Configure Supabase credentials in backend `.env`
2. Update frontend to use Supabase Auth
3. Remove dummy authentication logic

---

## 📚 API Reference

### Admin Routes

All admin routes require authentication with an admin token.

#### Agency Management

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/api/admin/agencies` | Get all agencies | - |
| `POST` | `/api/admin/agencies/:id/approve` | Approve agency | - |
| `POST` | `/api/admin/agencies/:id/reject` | Reject agency | `{ reason?: string }` |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/admin/agencies/123/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Agency approved successfully",
  "data": {
    "id": "123",
    "name": "Travel Agency Inc",
    "approvalStatus": "APPROVED"
  }
}
```

#### Hotel Management

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/api/admin/hotels` | Get all hotels | - |
| `POST` | `/api/admin/hotels/:id/approve` | Approve hotel | - |
| `POST` | `/api/admin/hotels/:id/reject` | Reject hotel | `{ reason?: string }` |

#### Vehicle Management

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/api/admin/vehicles` | Get all vehicles | - |
| `POST` | `/api/admin/vehicles/:id/approve` | Approve vehicle | - |
| `POST` | `/api/admin/vehicles/:id/reject` | Reject vehicle | `{ reason?: string }` |

#### User Management

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| `GET` | `/api/admin/users` | Get all users | `?role=TRAVELER&status=ACTIVE` |

#### Dashboard & Reports

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/admin/reports/dashboard` | Get dashboard statistics | Stats object |

**Dashboard Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalAgencies": 45,
    "totalHotels": 89,
    "totalVehicles": 67,
    "pendingApprovals": {
      "agencies": 5,
      "hotels": 12,
      "vehicles": 8
    },
    "recentBookings": 234,
    "revenue": 125000
  }
}
```

---

## 🧪 Testing

### Setup for Testing

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Seed the database**
   ```bash
   npm run seed
   ```

3. **Start the admin portal**
   ```bash
   cd admin-portal
   npm run dev
   ```

4. **Navigate to** `http://localhost:5174`

### Test Scenarios

#### ✅ Test Login
1. Enter any token (e.g., `admin`)
2. Click "Login"
3. Should redirect to dashboard

#### ✅ Test Agency Approval
1. Navigate to "Agencies" in sidebar
2. Find a pending agency
3. Click "Approve" button
4. Verify status changes to "Approved"

#### ✅ Test Hotel Management
1. Navigate to "Hotels" in sidebar
2. View list of hotels
3. Approve or reject hotels
4. Verify changes persist

#### ✅ Test Vehicle Management
1. Navigate to "Vehicles" in sidebar
2. View list of vehicles
3. Approve or reject vehicles
4. Verify changes persist

---

## 🎨 UI Components

### Layout Components

```
admin-portal/src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── Header.tsx           # Top header with user info
│   │   └── Layout.tsx           # Main layout wrapper
│   ├── common/
│   │   ├── Button.tsx           # Reusable button
│   │   ├── Card.tsx             # Card container
│   │   ├── Table.tsx            # Data table
│   │   └── Modal.tsx            # Modal dialog
│   └── modules/
│       ├── agencies/
│       ├── hotels/
│       ├── vehicles/
│       └── dashboard/
```

---

## 🔧 Troubleshooting

### 🔴 Database Connection Issues

**Problem:** Cannot connect to database

**Solution:**
1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in backend `.env`
3. Run `npm run prisma:generate`

---

### 🔴 Supabase Authentication Issues

**Problem:** Supabase auth errors in development

**Solution:**
- In development, simple tokens work for testing
- Supabase credentials are optional
- For production, configure proper Supabase credentials

---

### 🔴 CORS Issues

**Problem:** CORS errors when making API requests

**Solution:**
1. Check `CORS_ORIGIN` in backend `.env`
2. Ensure it includes `http://localhost:5174`
3. Restart backend server

---

### 🔴 401 Unauthorized Errors

**Problem:** API returns 401 errors

**Solution:**
1. Clear browser localStorage: `localStorage.clear()`
2. Log out and log back in
3. Check backend console for authentication logs
4. Verify token is being sent in requests

---

## 🚀 Next Steps

To enhance the admin portal further:

1. **Add Vehicle Management UI** (similar to hotels)
2. **Implement User Management** with search and filters
3. **Create Dashboard** with charts and statistics
4. **Add Reports Page** with analytics
5. **Integrate Supabase Authentication** for production
6. **Add Image Upload** for CNIC verification
7. **Implement Email Notifications** for approvals/rejections
8. **Add Audit Logs** for admin actions
9. **Create Settings Page** for platform configuration
10. **Add Export Functionality** for reports

---

## 📊 Feature Roadmap

```mermaid
gantt
    title Admin Portal Development Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1
    Basic Authentication           :done, 2024-01-01, 7d
    Agency Management             :done, 2024-01-08, 7d
    Hotel Management              :done, 2024-01-15, 7d
    section Phase 2
    Vehicle Management            :active, 2024-01-22, 7d
    User Management               :2024-01-29, 7d
    Dashboard & Analytics         :2024-02-05, 10d
    section Phase 3
    Reports & Export              :2024-02-15, 7d
    Supabase Integration          :2024-02-22, 7d
    Email Notifications           :2024-03-01, 5d
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Backend API Documentation](../backend/API_DOCUMENTATION.md)

---

<div align="center">

**[⬆ Back to Top](#️-admin-portal-setup-guide)**

Need help? Check the [main README](../README.md) or open an issue.

</div>
