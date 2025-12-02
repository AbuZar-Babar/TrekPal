# PostgreSQL Database Setup Guide

## The schema.prisma file is correct!

The `schema.prisma` file uses `env("DATABASE_URL")` which means it reads the connection string from your `.env` file. **You don't need to change the schema.prisma file.**

## Step 1: Create .env file

In the `backend/` directory, create a `.env` file (if it doesn't exist).

## Step 2: Add DATABASE_URL to .env

Add this line to your `.env` file:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
```

## Common PostgreSQL Connection Strings

### Default PostgreSQL Installation (Windows)
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/trekpal?schema=public"
```

### If you set a custom username
```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/trekpal?schema=public"
```

### If PostgreSQL is on a different port
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5433/trekpal?schema=public"
```

## Step 3: Create the Database

Before running migrations, you need to create the database:

### Option A: Using psql (Command Line)
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE trekpal;

# Exit
\q
```

### Option B: Using pgAdmin (GUI)
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `trekpal`
5. Click "Save"

### Option C: Using Command Prompt (Windows)
```cmd
# If PostgreSQL bin is in your PATH
createdb -U postgres trekpal

# Or with password prompt
psql -U postgres -c "CREATE DATABASE trekpal;"
```

## Step 4: Find Your PostgreSQL Credentials

### Default Credentials (if you didn't change them)
- **Username:** `postgres`
- **Password:** (the password you set during PostgreSQL installation)
- **Port:** `5432` (default)
- **Host:** `localhost`

### If you forgot your password:
1. **Windows:** Check if you saved it during installation
2. **Reset password:** 
   - Edit `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\XX\data\`)
   - Change authentication method temporarily
   - Or use pgAdmin to reset

## Complete .env File Example

```env
# Environment
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/trekpal?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Firebase (for production - can be dummy for now)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Step 5: Test the Connection

After setting up `.env`, test the connection:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# If successful, you're connected!
```

## Troubleshooting

### Error: "password authentication failed"
- Check your password in `.env`
- Make sure username is correct (usually `postgres`)

### Error: "database does not exist"
- Create the database first (see Step 3)

### Error: "connection refused"
- Make sure PostgreSQL service is running
- Check if port is correct (default: 5432)
- Verify PostgreSQL is installed and running

### Error: "role does not exist"
- Use the correct username (usually `postgres`)
- Or create a new role in PostgreSQL

## Quick Setup Commands

```bash
# 1. Create .env file with DATABASE_URL
# (Edit manually or copy from .env.example)

# 2. Create database
psql -U postgres -c "CREATE DATABASE trekpal;"

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Run migrations
npm run prisma:migrate

# 5. Seed database
npm run seed
```

