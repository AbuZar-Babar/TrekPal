# Quick Start - Database Setup

## The Problem
The database is not connected because the `.env` file is missing or not configured.

## Quick Fix (3 Steps)

### Step 1: Create .env File

Run this command in the `backend` folder:
```bash
node create-env.js
```

Or manually create a `.env` file in the `backend` folder with this content:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/trekpal?schema=public"
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

**Replace `YOUR_PASSWORD` with your PostgreSQL password!**

### Step 2: Create the Database

Open a terminal and run:
```bash
# Windows (PowerShell or CMD)
psql -U postgres -c "CREATE DATABASE trekpal;"

# If that doesn't work, try:
psql -U postgres
# Then type: CREATE DATABASE trekpal;
# Then type: \q
```

**If you get "psql is not recognized":**
- PostgreSQL might not be installed
- Or PostgreSQL bin folder is not in your PATH
- Install PostgreSQL from: https://www.postgresql.org/download/windows/

### Step 3: Test the Connection

```bash
# In the backend folder
npm run prisma:generate
npm run prisma:migrate
```

If these commands succeed, your database is connected! ✅

## Troubleshooting

### "psql: command not found"
**Solution:** PostgreSQL is not installed or not in PATH
- Install PostgreSQL: https://www.postgresql.org/download/
- Or use pgAdmin (GUI tool) to create the database

### "password authentication failed"
**Solution:** Wrong password in `.env` file
- Check your PostgreSQL password
- Default username is usually `postgres`

### "database does not exist"
**Solution:** Create the database first (Step 2)

### "connection refused" or "could not connect"
**Solution:** PostgreSQL service is not running
- **Windows:** Open Services (Win+R → `services.msc`) → Find "postgresql" → Start it
- Or restart your computer

### "role does not exist"
**Solution:** Wrong username
- Use `postgres` (default) or create a new role

## Development Mode Defaults

If you don't set `DATABASE_URL` in development, the app will try to use:
- `postgresql://postgres:postgres@localhost:5432/trekpal`

**Make sure:**
1. PostgreSQL is running
2. Username is `postgres`
3. Password is `postgres` (or update the default in `env.ts`)
4. Database `trekpal` exists

## Still Having Issues?

1. Check if PostgreSQL is installed:
   ```bash
   psql --version
   ```

2. Check if PostgreSQL is running:
   - Windows: Open Services → Look for "postgresql"
   - Or try: `pg_isready`

3. Test connection manually:
   ```bash
   psql -U postgres -h localhost -d postgres
   ```

4. Check your `.env` file:
   - Make sure `DATABASE_URL` is correct
   - No extra spaces or quotes issues
   - Password matches your PostgreSQL password

## Need Help?

See `SETUP_ENV.md` for detailed instructions or `DATABASE_SETUP.md` for comprehensive database setup guide.

