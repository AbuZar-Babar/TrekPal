# Render Backend Deploy

This project is ready to deploy to Render as a Node web service using the root-level [`render.yaml`](../../render.yaml).

## Recommended setup

Use Render for the backend service and keep Supabase for:

- PostgreSQL
- Storage for KYC documents
- Optional Auth integration

This is the lowest-risk path because the current backend already depends on Prisma plus Supabase storage utilities.

## What gets deployed

- Render web service: `backend/`
- Health check: `/health`
- Production start: `npm run render:start`
- Startup migration step: `npm run prisma:migrate:deploy && npm run render:start`

## Create the service

1. Push this repo to GitHub.
2. In Render, choose `New` -> `Blueprint`.
3. Select the repo.
4. Render will detect [`render.yaml`](../../render.yaml).
5. Confirm the service creation.

## Required environment variables

Set these in Render before the first successful deploy:

```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
CORS_ORIGIN=https://your-admin-site.onrender.com,https://your-agency-site.onrender.com
```

Notes:

- `CORS_ORIGIN` supports a comma-separated list.
- `JWT_SECRET` is generated automatically by Render from the Blueprint.
- `PORT` is injected automatically by Render.

## Database choice

### Option A: Supabase Postgres

Recommended for this repo.

- Keeps database and storage in the same platform already used by the project.
- Avoids Render free Postgres expiry concerns.
- Works well with existing `.env.example` guidance.

### Option B: Render Postgres

Possible, but less attractive for this repo if you also need Supabase storage.

- You would still need Supabase for KYC storage unless you rewrite that part.
- Render's free Postgres databases expire after 30 days according to Render docs.

## Build and deploy commands

Render runs:

```bash
npm ci --include=dev && npm run render:build
```

Then it starts the backend with:

```bash
npm run prisma:migrate:deploy && npm run render:start
```

## After deploy

Verify these endpoints:

```text
https://<your-service>.onrender.com/health
https://<your-service>.onrender.com/api/auth/login
```

Then point clients to:

```text
https://<your-service>.onrender.com/api
```

For Flutter:

```bash
flutter run --dart-define=API_BASE_URL=https://<your-service>.onrender.com/api
```

## Sources

- Render Blueprint spec: https://render.com/docs/blueprint-spec
- Render web services: https://render.com/docs/web-services
- Render WebSockets: https://render.com/docs/websocket
- Render free tier: https://render.com/docs/free
