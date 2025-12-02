# Quick Environment Setup Guide

## Step 1: Create .env File

Copy the example file and create your `.env` file:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Windows (CMD)
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

## Step 2: Configure Database Connection

Edit the `.env` file and update the `DATABASE_URL` with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/trekpal?schema=public"
```

### Common Connection Strings:

**Default PostgreSQL (Windows):**
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/trekpal?schema=public"
```

**If you don't have PostgreSQL yet:**
- Install PostgreSQL from https://www.postgresql.org/download/
- Default username is usually `postgres`
- Set a password during installation
- Default port is `5432`

## Step 3: Create the Database

Before running migrations, create the database:

### Option A: Using psql (Command Line)
```bash
psql -U postgres
CREATE DATABASE trekpal;
\q
```

### Option B: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click "Databases" → "Create" → "Database"
4. Name: `trekpal`
5. Click "Save"

### Option C: Using Command Prompt
```cmd
psql -U postgres -c "CREATE DATABASE trekpal;"
```

## Step 4: Set JWT Secret

In your `.env` file, set a secure JWT secret (minimum 32 characters):

```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```

## Step 5: Test the Connection

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run seed
```

## Troubleshooting

### "password authentication failed"
- Check your PostgreSQL password in `.env`
- Make sure username is correct (usually `postgres`)

### "database does not exist"
- Create the database first (see Step 3)
- Make sure the database name matches in `DATABASE_URL`

### "connection refused"
- Make sure PostgreSQL service is running
- Check if PostgreSQL is installed
- Verify the port (default: 5432)

### "role does not exist"
- Use the correct username (usually `postgres`)
- Or create a new PostgreSQL role

## Development Mode Defaults

If you don't set `DATABASE_URL` or `JWT_SECRET` in development mode, the app will use defaults:
- DATABASE_URL: `postgresql://postgres:postgres@localhost:5432/trekpal`
- JWT_SECRET: Development default (not secure)

**⚠️ These defaults are for development only! Always set proper values in production.**

