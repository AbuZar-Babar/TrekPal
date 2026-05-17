# TrekPal Session Context

Use this file as the first project-specific context in new Codex sessions.

## Standing assumptions

- This repository is the `TrekPal` monorepo.
- The project is already deployed on Render.
- If Render-related work is needed, the preferred Render workspace is `Abuzar Babar`.
- The project uses Supabase for backend infrastructure services, especially PostgreSQL and storage.
- The backend API service is deployed on Render.

## What TrekPal contains

- `backend/`: Node.js + Express + Prisma API
- `admin-portal/`: React web app for platform admins
- `agency-portal/`: React web app for travel agencies
- `vehicle-portal/`: Web portal for vehicle-side workflows
- `traveler-app/trekpal/`: Flutter mobile app

## Local development defaults

- Root install: `npm install`
- Main local dev command: `npm run dev`
- Backend local URL: `http://localhost:3000`
- Admin portal local URL: `http://localhost:5174`
- Agency portal local URL: `http://localhost:5173`

## Deployment defaults

- Render is used for the backend service.
- Health check endpoint: `/health`
- API base pattern: `https://<render-service>.onrender.com/api`

## Important docs

- Project overview: `README.md`
- Render setup: `docs/setup/render.md`
- Database setup: `docs/setup/database.md`
- Architecture: `docs/ARCHITECTURE.md`

## Instruction for future sessions

If I tell you to "read `SESSION_CONTEXT.md` first", treat the items above as the default project context before asking follow-up questions.

Still verify current repo state from files and code before making changes, but do not ask me again whether TrekPal is deployed on Render or which Render workspace I prefer unless there is a real conflict.
