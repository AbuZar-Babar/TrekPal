# ⚙️ TrekPal Backend API

The Backend API is the central coordinator of the TrekPal ecosystem. It handles database transactions, manages authentication, hosts real-time WebSocket communication, and serves all frontend portals and the mobile traveler application.

## 🛠️ Technology Stack
* **Runtime**: Node.js (v20.x)
* **Framework**: Express.js
* **Language**: TypeScript
* **Database Client**: Prisma ORM
* **Database**: PostgreSQL (hosted on Supabase)
* **Real-time Server**: Socket.io
* **Authentication**: JSON Web Tokens (JWT)

## 🔄 How it Works
1. **API Gateway & Routing**: Serves JSON REST endpoints for CRUD operations across user management, booking records, trip requests, and bids.
2. **Database Integration**: Leverages Prisma ORM to connect to a PostgreSQL database, managing relations and enforcing schema consistency.
3. **Real-time WebSockets**: Socket.io namespaces handle real-time chat messages between travelers and agencies, live trip request bidding, and booking status updates.
4. **JWT Middleware**: Validates user sessions and roles (Traveler, Admin, Agency, Hotel Provider, Vehicle Provider) for secure endpoint access.

## 🚀 Local Setup & Configuration

### Environment Setup
Create `backend/.env`:
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/postgres?sslmode=require"
```

### Running the API
From the workspace root:
```bash
npm run dev:backend-only
```
The server will boot on `http://localhost:3000`.
