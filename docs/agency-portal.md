# 🏢 TrekPal Agency Portal

The Agency Portal provides travel agencies with a robust workspace to publish tour packages, submit bids on traveler trip requests, and coordinate traveler bookings.

## 🛠️ Technology Stack
* **Framework**: React (v18.x) + Vite
* **Language**: TypeScript
* **State Management**: Redux Toolkit
* **Styling**: Tailwind CSS + Framer Motion (for animations)
* **API Client**: Axios

## 🔄 How it Works
1. **Package Management**: Agencies create, update, and schedule travel packages, destinations, seats, and images.
2. **Bidding Engine**: Receives traveler custom trip requests and submits competitive tour bids in real-time.
3. **Traveller Constraints Checks**: When deleting a package, the custom confirmation modal validates if travelers are currently pending or confirmed. If yes, it blocks deletion and warns the agency to prevent service disruption.

## 🚀 Setup & Development

### Commands
Choose which backend server to target:
* **Local Mode** (`http://localhost:3000/api`):
  ```bash
  npm run dev:agency-only
  ```
* **Render Mode** (Render Deployed API):
  ```bash
  npm run dev:agency-only -- --mode render
  ```
