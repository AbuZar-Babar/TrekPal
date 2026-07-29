# 🛡️ TrekPal Admin Portal

The Admin Portal is a dedicated web dashboard designed for TrekPal administrators to oversee the platform, verify listings, approve partners, and audit transactions.

## 🛠️ Technology Stack
* **Framework**: React (v18.x) + Vite
* **Language**: TypeScript
* **State Management**: Redux Toolkit
* **Styling**: Tailwind CSS + Framer Motion (for animations)
* **API Client**: Axios

## 🔄 How it Works
1. **Approval Pipelines**: Admins receive pending registration requests from hotel and vehicle providers, verifying credentials before unlocking login capabilities.
2. **Ecosystem Audit**: Displays statistics and graphs representing active users, trips, transactions, and system health.
3. **Responsive Actions**: Implements custom confirmation modals (`ConfirmModal`) to approve/reject listings with inline reason submissions.

## 🚀 Setup & Development

### Commands
Choose which backend server to target:
* **Local Mode** (`http://localhost:3000/api`):
  ```bash
  npm run dev:admin-only
  ```
* **Render Mode** (Render Deployed API):
  ```bash
  npm run dev:admin-only -- --mode render
  ```
