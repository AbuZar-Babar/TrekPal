# 🚗 TrekPal Vehicle Portal

The Vehicle Portal is designed for vehicle rental and transit partners to manage fleets, register drivers, and coordinate transport logistics.

## 🛠️ Technology Stack
* **Framework**: React (v18.x) + Vite
* **Language**: TypeScript
* **State Management**: Redux Toolkit
* **Styling**: Tailwind CSS + Framer Motion (for animations)
* **API Client**: Axios

## 🔄 How it Works
1. **Fleet Logistics**: Registration of vehicle make, model, capacity, pricing, and availability status.
2. **Driver Allocation**: Assigns registered drivers to specific vehicles and updates contact info.
3. **Safety Gateways**: Deleting a vehicle or active driver prompts confirmation, ensuring no current booking schedule is disrupted.

## 🚀 Setup & Development

### Commands
Choose which backend server to target:
* **Local Mode** (`http://localhost:3000/api`):
  ```bash
  npm run dev:vehicle-only
  ```
* **Render Mode** (Render Deployed API):
  ```bash
  npm run dev:vehicle-only -- --mode render
  ```
