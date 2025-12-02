# Admin Portal Setup Guide

## Overview

The Admin Portal is a React.js application that allows administrators to:
- Approve/reject travel agencies
- Approve/reject hotels
- Approve/reject vehicles
- Manage users
- View dashboard statistics

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` - Firebase credentials

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with dummy data
npm run seed
```

The seed script creates:
- 1 admin user (admin@trekpal.com)
- 8 traveler users
- 5 travel agencies (mix of approved, pending, rejected)
- 5 hotels with rooms
- 5 vehicles
- 2 travel packages
- Trip requests, bids, bookings, and reviews

### 4. Start Backend Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd admin-portal
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL=http://localhost:3000/api`

### 3. Start Development Server

```bash
npm run dev
```

Portal will run on `http://localhost:5174`

## Login

For testing purposes, you can use any token string in the login form. The backend will recognize it as an admin token in development mode.

**Note:** In production, this should be replaced with proper Firebase Authentication.

## Features Implemented

### ✅ Backend
- Admin authentication and authorization
- Agency approval/rejection endpoints
- Hotel approval/rejection endpoints
- Vehicle approval/rejection endpoints
- User management endpoints
- Dashboard statistics endpoint
- Prisma seed script with comprehensive dummy data

### ✅ Frontend
- Admin login page
- Protected routes
- Sidebar navigation
- Header with user info and logout
- Agency management (list, approve, reject)
- Hotel management (list, approve, reject)
- Responsive UI with Tailwind CSS
- Redux Toolkit for state management

## API Endpoints

### Admin Routes (All require admin authentication)

- `GET /api/admin/agencies` - Get all agencies
- `POST /api/admin/agencies/:id/approve` - Approve agency
- `POST /api/admin/agencies/:id/reject` - Reject agency
- `GET /api/admin/hotels` - Get all hotels
- `POST /api/admin/hotels/:id/approve` - Approve hotel
- `POST /api/admin/hotels/:id/reject` - Reject hotel
- `GET /api/admin/vehicles` - Get all vehicles
- `POST /api/admin/vehicles/:id/approve` - Approve vehicle
- `POST /api/admin/vehicles/:id/reject` - Reject vehicle
- `GET /api/admin/users` - Get all users
- `GET /api/admin/reports/dashboard` - Get dashboard statistics

## Next Steps

To complete the admin portal, you can add:
1. Vehicle approval UI (similar to hotels)
2. User management UI with search and filters
3. Dashboard with charts and statistics
4. Reports page with analytics
5. Proper Firebase Authentication integration
6. Image upload for CNIC verification
7. Email notifications for approvals/rejections

## Testing

1. Start the backend server
2. Seed the database: `npm run seed` (in backend directory)
3. Start the admin portal: `npm run dev` (in admin-portal directory)
4. Navigate to `http://localhost:5174`
5. Login with any token string (for testing)
6. Explore agencies, hotels, and other sections

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run `npm run prisma:generate` if schema changes

### Firebase Authentication Issues
- In development, simple tokens work for testing
- For production, configure proper Firebase credentials
- Ensure Firebase Admin SDK is properly initialized

### CORS Issues
- Check `CORS_ORIGIN` in backend `.env`
- Ensure it matches the frontend URL (http://localhost:5174)

