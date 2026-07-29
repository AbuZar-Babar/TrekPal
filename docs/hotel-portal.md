# 🏨 TrekPal Hotel Portal

The Hotel Portal is a sleek management dashboard for hotel partners to configure room categories, maintain pricing, list services, and review reservations.

## 🛠️ Technology Stack
* **Framework**: React (v19.x) + Vite
* **Language**: TypeScript
* **State Management**: Zustand
* **API Client**: React Query (TanStack Query) + Axios
* **Styling**: Tailwind CSS + CSS Custom Properties

## 🔄 How it Works
1. **Inventory Management**: Hotels configure room inventories, occupancy rules, and seasonal pricing.
2. **Services Catalog**: List additional amenities (WiFi, Spa, Airport pick-up) which agencies can add to customized trip packages.
3. **Robust Confirmation Rules**: Deleting room types or services triggers a warning if they are currently linked to active traveler bookings.

## 🚀 Setup & Development

### Commands
Choose which backend server to target:
* **Local Mode** (`http://localhost:3000/api`):
  ```bash
  npm run dev:hotel-only
  ```
* **Render Mode** (Render Deployed API):
  ```bash
  npm run dev:hotel-only -- --mode render
  ```
