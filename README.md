# 🌍 TrekPal Ecosystem

Welcome to the **TrekPal Monorepo**. TrekPal is a comprehensive travel management ecosystem designed to bridge the gap between travelers, travel agencies, and platform administrators.

This repository contains all the core components of the platform:
- **Backend API**: Node.js + Express + Prisma + PostgreSQL (Supabase)
- **Admin Portal**: React Web App for platform oversight
- **Agency Portal**: React Web App for travel agencies to manage packages and bids
- **Traveler App**: Flutter Mobile Application for the end-users

---

## 🏗️ Architecture at a Glance
- **Monorepo Management**: npm workspaces
- **Database**: PostgreSQL hosted on Supabase
- **Real-time**: Socket.io for chat, live bidding, and booking updates
- **File Storage**: Supabase Storage for KYC documents

---

## 🚀 Getting Started (Local Development)

The beauty of this monorepo is the **Hybrid Local Mode**. You can run all the code locally on your machine while seamlessly connecting to the remote Supabase database. You don't need to spin up a local PostgreSQL instance!

### Prerequisites
- [Node.js](https://nodejs.org/) (v20.x recommended)
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (for the mobile app)

### 1. Install Dependencies
From the root of the project, run:
```bash
npm install
```
*This will automatically install dependencies for the backend, admin portal, and agency portal using npm workspaces.*

### 2. Environment Configuration
Navigate to the `backend` folder and ensure your `.env` file is set up. It should look like this:

```env
# backend/.env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Supabase Configuration
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/postgres?sslmode=require"
SUPABASE_URL="https://[YOUR_PROJECT_ID].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 3. Database Setup (Optional)
If this is your first time setting up the project and you need to push the Prisma schema to Supabase and seed initial data:
```bash
npm run db:setup
```

---

## 🏃‍♂️ Running the Project

### The Web Ecosystem
You can spin up the Backend, Admin Portal, and Agency Portal all at once using `concurrently`. 
From the root of the project, run:

```bash
npm run dev
```

**What happens?**
- ⚙️ **Backend** starts on `http://localhost:3000`
- 🛡️ **Admin Portal** starts on `http://localhost:5174`
- 🏢 **Agency Portal** starts on `http://localhost:5173`

*(To run just the backend, use `npm run dev:backend-only`)*

### The Mobile App (Traveler)
The traveler app is a Flutter project. Open a new terminal, navigate to the traveler app directory, and run it on your emulator/device:

```bash
cd traveler-app/trekpal
flutter pub get
flutter run
```
*Note: By default, the app is configured to point to the live Render backend (`https://trekpal-backend-api.onrender.com/api`). To point it to your local backend, you may need to update the `API_BASE_URL` in your environment or launch configs.*

---

## 📂 Project Structure

```text
TrekPal/
├── backend/            # Express.js API + Prisma ORM + Socket.io Server
├── admin-portal/       # React app for platform admins
├── agency-portal/      # React app for travel agencies
├── traveler-app/       # Flutter app for end-users
├── graphify-out/       # Auto-generated knowledge graphs and architecture diagrams
└── package.json        # Monorepo configuration and master scripts
```

## 🗺️ System Visualization
Curious how everything connects? We use an auto-generated knowledge graph to visualize the system.

Open `graphify-out/dashboard.html` in your browser to explore the **Global Ecosystem Graph**, mapping out API connections, real-time socket events, and database relations across all four projects.
