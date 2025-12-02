# TrekPal - Modular Travel Ecosystem

A comprehensive travel management system with three main applications:

- **Traveler App** (Flutter) - Mobile application for travelers
- **Agency Portal** (React.js) - Web portal for travel agencies  
- **Admin Portal** (React.js) - Web portal for administrators
- **Backend API** (Node.js + Express + Prisma + PostgreSQL) - RESTful API server

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start Guide](#quick-start-guide)
- [Detailed Setup Instructions](#detailed-setup-instructions)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## 📁 Project Structure

```
.
├── traveler-app/          # Flutter mobile application
├── agency-portal/         # React.js travel agency portal (Port: 5173)
├── admin-portal/         # React.js admin portal (Port: 5174)
└── backend/              # Node.js Express backend (Port: 3000)
```

## 🛠 Tech Stack

### Mobile App (Flutter)
- Flutter with Clean Architecture + MVVM
- State Management: Riverpod/Bloc
- Firebase Authentication & Storage
- WebSocket for real-time chat

### Web Portals (React.js)
- React.js + Vite + TypeScript
- Redux Toolkit for state management
- React Query for server state
- Tailwind CSS for styling
- Axios for HTTP requests

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Firebase Authentication (optional in development)
- WebSocket (Socket.IO) for real-time features
- JWT for API authentication

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm/yarn
- **PostgreSQL** 14+ (with a running instance)
- **Flutter SDK** 3.0+ (for mobile app only)
- **Git** (for version control)

### Optional
- **Firebase project** (for production authentication)
- **pgAdmin** (PostgreSQL GUI tool)

## 🚀 Quick Start Guide

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd "Coding2"
```

### 2. Backend Setup (Required First)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (see Backend Setup section below)
# Run database migrations
npm run prisma:generate
npm run prisma:migrate

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:3000`

### 3. Agency Portal Setup

Open a **new terminal**:

```bash
# Navigate to agency portal directory
cd agency-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

The agency portal will run on `http://localhost:5173`

### 4. Admin Portal Setup

Open **another new terminal**:

```bash
# Navigate to admin portal directory
cd admin-portal

# Install dependencies
npm install

# Start development server
npm run dev
```

The admin portal will run on `http://localhost:5174`

## 📖 Detailed Setup Instructions

### Backend Setup

#### Step 1: Install Dependencies

```bash
cd backend
npm install
```

#### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

**Option A: Use the helper script (Windows PowerShell)**
```powershell
cd backend
node create-env.js
```

**Option B: Create manually**

Create `backend/.env` with the following content:

```env
# Environment
NODE_ENV=development
PORT=3000

# Database (REQUIRED - Replace with your PostgreSQL credentials)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/trekpal?schema=public"

# JWT (REQUIRED - Use a secure random string, minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Firebase (Optional for development - can be left empty)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_STORAGE_BUCKET=
```

**Important:** Replace `YOUR_PASSWORD` with your actual PostgreSQL password!

#### Step 3: Create PostgreSQL Database

**Option A: Using psql (Command Line)**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE trekpal;

# Exit
\q
```

**Option B: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `trekpal`
5. Click "Save"

**Option C: Using Command Prompt (Windows)**
```cmd
psql -U postgres -c "CREATE DATABASE trekpal;"
```

#### Step 4: Run Database Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate
```

#### Step 5: (Optional) Seed Database

```bash
npm run seed
```

#### Step 6: Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 3000
📝 Environment: development
🔗 API: http://localhost:3000/api
```

### Agency Portal Setup

#### Step 1: Install Dependencies

```bash
cd agency-portal
npm install
```

#### Step 2: Configure Environment (Optional)

Create `agency-portal/.env` if you need to change the API URL:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

#### Step 3: Start Development Server

```bash
npm run dev
```

The agency portal will be available at `http://localhost:5173`

**Note:** For development, the agency portal uses dummy authentication. You can log in with any credentials.

### Admin Portal Setup

#### Step 1: Install Dependencies

```bash
cd admin-portal
npm install
```

#### Step 2: Configure Environment (Optional)

Create `admin-portal/.env` if you need to change the API URL:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

#### Step 3: Start Development Server

```bash
npm run dev
```

The admin portal will be available at `http://localhost:5174`

**Note:** For development, the admin portal uses dummy authentication. You can log in with any credentials.

### Traveler App Setup (Flutter)

#### Step 1: Install Dependencies

```bash
cd traveler-app
flutter pub get
```

#### Step 2: Configure Firebase (Optional for development)

If you want to use Firebase authentication:
1. Create a Firebase project
2. Add your `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
3. Configure Firebase in the app

#### Step 3: Run the App

```bash
# For Android
flutter run

# For iOS (Mac only)
flutter run -d ios

# For a specific device
flutter devices  # List available devices
flutter run -d <device-id>
```

## 🏃 Running the Application

### Development Mode

You need to run **three servers** simultaneously:

1. **Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```

2. **Agency Portal** (Terminal 2)
   ```bash
   cd agency-portal
   npm run dev
   ```

3. **Admin Portal** (Terminal 3)
   ```bash
   cd admin-portal
   npm run dev
   ```

### Access the Applications

- **Backend API**: http://localhost:3000/api
- **Agency Portal**: http://localhost:5173
- **Admin Portal**: http://localhost:5174
- **API Health Check**: http://localhost:3000/health

### Default Login Credentials (Development Mode)

**Agency Portal:**
- Email: Any email
- Password: Any password
- (Dummy authentication - accepts any credentials)

**Admin Portal:**
- Email: Any email
- Password: Any password
- (Dummy authentication - accepts any credentials)

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Main Endpoints

- **Authentication**: `/api/auth`
  - `POST /api/auth/register/user` - Register traveler
  - `POST /api/auth/register/agency` - Register agency
  - `POST /api/auth/login` - Login

- **Agencies**: `/api/agencies`
  - `GET /api/agencies` - Get all agencies
  - `GET /api/agencies/:id` - Get agency by ID

- **Hotels**: `/api/hotels`
  - `GET /api/hotels` - Get all hotels
  - `POST /api/hotels` - Create hotel (Agency only)
  - `GET /api/hotels/:id` - Get hotel by ID

- **Transport**: `/api/transport`
  - `GET /api/transport` - Get all vehicles (Agency only)
  - `POST /api/transport` - Create vehicle (Agency only)
  - `PUT /api/transport/:id` - Update vehicle (Agency only)
  - `DELETE /api/transport/:id` - Delete vehicle (Agency only)

- **Admin**: `/api/admin`
  - `GET /api/admin/agencies` - Get all agencies (Admin only)
  - `GET /api/admin/hotels` - Get all hotels (Admin only)
  - `GET /api/admin/vehicles` - Get all vehicles (Admin only)
  - `POST /api/admin/agencies/:id/approve` - Approve agency (Admin only)
  - `POST /api/admin/hotels/:id/approve` - Approve hotel (Admin only)
  - `POST /api/admin/vehicles/:id/approve` - Approve vehicle (Admin only)

For detailed API documentation, see `backend/API_DOCUMENTATION.md`

## 💻 Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code linting
- Consistent naming conventions

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run seed         # Seed database with sample data
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

#### Frontend (Agency/Admin Portal)
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Project Architecture

#### Clean Architecture (Flutter App)
- **Data Layer**: Data sources, models, repositories implementation
- **Domain Layer**: Entities, use cases, repository interfaces
- **Presentation Layer**: UI components, state management

#### Modular Architecture (Backend & Web Portals)
- Feature-based module organization
- Separation of concerns (controllers, services, routes)
- Reusable utilities and middleware

## 🔧 Troubleshooting

### Backend Issues

#### "Database connection failed"
- **Solution**: Check your PostgreSQL service is running
- **Windows**: Open Services (`services.msc`) → Find "postgresql" → Start it
- Verify your `DATABASE_URL` in `.env` is correct

#### "password authentication failed"
- **Solution**: Check your PostgreSQL password in `.env`
- Default username is usually `postgres`

#### "database does not exist"
- **Solution**: Create the database first:
  ```bash
  psql -U postgres -c "CREATE DATABASE trekpal;"
  ```

#### "Prisma Client not generated"
- **Solution**: Run `npm run prisma:generate`

### Frontend Issues

#### "Network Error" or "Connection refused"
- **Solution**: Make sure the backend server is running on port 3000
- Check `VITE_API_BASE_URL` in `.env` if you changed the backend port

#### "403 Forbidden" error
- **Solution**: 
  1. Clear browser localStorage: Open console → `localStorage.clear()`
  2. Log out and log back in to get a new token
  3. Check backend console for authentication logs

#### "CORS error"
- **Solution**: Backend CORS is configured for `localhost:5173` and `localhost:5174`
- If using different ports, update `CORS_ORIGIN` in backend `.env`

### Database Issues

#### "relation does not exist"
- **Solution**: Run migrations:
  ```bash
  cd backend
  npm run prisma:migrate
  ```

#### "Migration failed"
- **Solution**: Reset database (⚠️ **WARNING**: This deletes all data):
  ```bash
  npm run prisma:migrate reset
  ```

### Port Already in Use

If a port is already in use:

**Backend (3000):**
```bash
# Find process using port 3000
netstat -ano | findstr :3000
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Frontend (5173/5174):**
- Change port in `vite.config.ts` or use `--port` flag:
  ```bash
  npm run dev -- --port 5175
  ```

## 📝 Additional Resources

- **Database Setup**: See `backend/DATABASE_SETUP.md`
- **Quick Start**: See `backend/QUICK_START.md`
- **Environment Setup**: See `backend/SETUP_ENV.md`
- **API Documentation**: See `backend/API_DOCUMENTATION.md`

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC

## 👥 Authors

- Hashim and Ali

---

**Need Help?** Check the troubleshooting section or open an issue on GitHub.
