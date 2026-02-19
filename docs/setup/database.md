# 🗄️ PostgreSQL Database Setup Guide

<div align="center">

**Complete guide for setting up PostgreSQL database for TrekPal**

[Quick Setup](#-quick-setup) • [Detailed Steps](#-detailed-setup-steps) • [Troubleshooting](#-troubleshooting)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Setup](#-quick-setup)
- [Detailed Setup Steps](#-detailed-setup-steps)
- [Connection String Examples](#-connection-string-examples)
- [Verification](#-verification)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

The TrekPal backend uses **PostgreSQL** as its database with **Prisma ORM** for type-safe database access. This guide will help you set up the database correctly.

> [!IMPORTANT]
> The `schema.prisma` file is already configured! It reads the connection string from your `.env` file using `env("DATABASE_URL")`. **You don't need to modify the schema file.**

---

## ⚡ Quick Setup

```bash
# 1. Create database
psql -U postgres -c "CREATE DATABASE trekpal;"

# 2. Create .env file in backend/ directory
cat > .env << EOF
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/trekpal?schema=public"
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NODE_ENV=development
PORT=3000
EOF

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Run migrations
npm run prisma:migrate

# 5. Seed database (optional)
npm run seed
```

> [!WARNING]
> Replace `YOUR_PASSWORD` with your actual PostgreSQL password!

---

## 📝 Detailed Setup Steps

### Step 1: Create `.env` File

In the `backend/` directory, create a `.env` file:

```bash
cd backend
touch .env  # Mac/Linux
# or
type nul > .env  # Windows
```

### Step 2: Configure Database Connection

Add the following to your `.env` file:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
```

---

## 🔗 Connection String Examples

### Default PostgreSQL Installation (Windows)

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/trekpal?schema=public"
```

### Custom Username

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/trekpal?schema=public"
```

### Different Port

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5433/trekpal?schema=public"
```

### Remote Database

```env
DATABASE_URL="postgresql://username:password@remote-host.com:5432/trekpal?schema=public"
```

### Connection String Format

```
postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=[SCHEMA]
```

| Component | Description | Default | Example |
|-----------|-------------|---------|---------|
| `USERNAME` | PostgreSQL user | `postgres` | `postgres` |
| `PASSWORD` | User password | Set during install | `mypassword123` |
| `HOST` | Database host | `localhost` | `localhost` |
| `PORT` | PostgreSQL port | `5432` | `5432` |
| `DATABASE` | Database name | - | `trekpal` |
| `SCHEMA` | Database schema | `public` | `public` |

---

## 🔨 Step 3: Create the Database

Before running migrations, create the database:

### Option A: Using psql (Command Line)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE trekpal;

# Verify creation
\l

# Exit
\q
```

### Option B: Using pgAdmin (GUI)

1. Open **pgAdmin**
2. Connect to your PostgreSQL server
3. Right-click on **"Databases"** → **"Create"** → **"Database"**
4. Enter name: `trekpal`
5. Click **"Save"**

### Option C: Using Command Prompt (Windows)

```cmd
# If PostgreSQL bin is in your PATH
createdb -U postgres trekpal

# Or with password prompt
psql -U postgres -c "CREATE DATABASE trekpal;"
```

### Option D: Using PowerShell (Windows)

```powershell
# Create database
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE trekpal;"
```

---

## 🔑 Step 4: Find Your PostgreSQL Credentials

### Default Credentials

| Credential | Default Value |
|------------|---------------|
| **Username** | `postgres` |
| **Password** | Set during installation |
| **Port** | `5432` |
| **Host** | `localhost` |

### If You Forgot Your Password

<details>
<summary><strong>Windows</strong></summary>

1. Locate `pg_hba.conf` file:
   ```
   C:\Program Files\PostgreSQL\XX\data\pg_hba.conf
   ```
2. Change authentication method to `trust` temporarily
3. Restart PostgreSQL service
4. Connect and change password:
   ```sql
   ALTER USER postgres PASSWORD 'new_password';
   ```
5. Revert `pg_hba.conf` changes
6. Restart PostgreSQL service
</details>

<details>
<summary><strong>Mac/Linux</strong></summary>

1. Locate `pg_hba.conf`:
   ```bash
   sudo find / -name pg_hba.conf 2>/dev/null
   ```
2. Edit the file and change method to `trust`
3. Restart PostgreSQL:
   ```bash
   sudo systemctl restart postgresql  # Linux
   brew services restart postgresql   # Mac
   ```
4. Change password:
   ```bash
   psql -U postgres -c "ALTER USER postgres PASSWORD 'new_password';"
   ```
5. Revert changes and restart
</details>

---

## ✅ Step 5: Complete `.env` File

Your complete `.env` file should look like this:

```env
# Environment
NODE_ENV=development
PORT=3000

# Database (REQUIRED)
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/trekpal?schema=public"

# JWT (REQUIRED - minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Firebase (Optional for development)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_STORAGE_BUCKET=

# CORS
CORS_ORIGIN=http://localhost:5173
```

> [!TIP]
> You can leave Firebase credentials empty for development. The backend will use dummy authentication.

---

## 🧪 Step 6: Test the Connection

After setting up `.env`, test the database connection:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates all tables)
npm run prisma:migrate

# If successful, you're connected! ✅
```

### Expected Output

```
✔ Generated Prisma Client
✔ Your database is now in sync with your schema
```

---

## 🔍 Verification

### Verify Database Exists

```bash
psql -U postgres -c "\l" | grep trekpal
```

### Verify Tables Created

```bash
psql -U postgres -d trekpal -c "\dt"
```

### Open Prisma Studio (Database GUI)

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555` where you can view and edit your database.

---

## 🔧 Troubleshooting

### 🔴 Error: "password authentication failed"

**Cause:** Incorrect password in `.env`

**Solution:**
1. Check your PostgreSQL password
2. Verify username is correct (usually `postgres`)
3. Try connecting with psql to confirm credentials:
   ```bash
   psql -U postgres
   ```

---

### 🔴 Error: "database does not exist"

**Cause:** Database hasn't been created yet

**Solution:**
```bash
psql -U postgres -c "CREATE DATABASE trekpal;"
```

---

### 🔴 Error: "connection refused"

**Cause:** PostgreSQL service not running

**Solution:**

**Windows:**
1. Open Services (`Win + R` → `services.msc`)
2. Find "postgresql-x64-XX"
3. Right-click → Start

**Mac:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Start on boot
```

---

### 🔴 Error: "role does not exist"

**Cause:** Using wrong username

**Solution:**
1. Use `postgres` as username (default)
2. Or create a new role:
   ```sql
   CREATE ROLE your_username WITH LOGIN PASSWORD 'your_password';
   ```

---

### 🔴 Error: "Prisma Client not generated"

**Cause:** Prisma Client needs to be generated after schema changes

**Solution:**
```bash
npm run prisma:generate
```

---

### 🔴 Error: "Migration failed"

**Cause:** Database schema conflicts

**Solution:**

> [!CAUTION]
> This will delete all data!

```bash
npm run prisma:migrate reset
```

---

## 📊 Database Schema Overview

```mermaid
erDiagram
    User ||--o{ Agency : owns
    User ||--o{ TripRequest : creates
    User ||--o{ Booking : makes
    User ||--o{ Review : writes
    
    Agency ||--o{ Hotel : manages
    Agency ||--o{ Vehicle : owns
    Agency ||--o{ TravelPackage : offers
    Agency ||--o{ Bid : submits
    
    Hotel ||--o{ Room : contains
    Hotel ||--o{ Review : receives
    
    TripRequest ||--o{ Bid : receives
    
    Bid ||--o| Booking : converts_to
    
    Booking ||--o{ Review : generates
```

---

## 🎯 Quick Reference Commands

```bash
# Create database
psql -U postgres -c "CREATE DATABASE trekpal;"

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run seed

# Open Prisma Studio
npm run prisma:studio

# Reset database (⚠️ deletes all data)
npm run prisma:migrate reset

# Check database connection
psql -U postgres -d trekpal -c "SELECT version();"
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Connection String Format](https://www.prisma.io/docs/reference/database-reference/connection-urls)

---

<div align="center">

**[⬆ Back to Top](#️-postgresql-database-setup-guide)**

Need help? Check the [main README](../README.md) or open an issue.

</div>

---

## Supabase Cutover Runbook

Use this runbook to migrate TrekPal from local PostgreSQL to Supabase PostgreSQL and migrate local KYC files to private Supabase Storage.

### Required backend environment variables

```bash
# Supabase database URLs
DATABASE_URL="postgresql://<pooler-user>:<password>@<pooler-host>:6543/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require"

# Supabase storage credentials
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
SUPABASE_STORAGE_BUCKET_KYC="kyc-private"
SUPABASE_SIGNED_URL_TTL_SECONDS=3600
```

### One-time migration sequence

```bash
# 1) Capture baseline counts from local database
npm run db:counts

# 2) Ensure private KYC bucket exists in Supabase
npm run storage:kyc:ensure

# 3) Apply schema to Supabase
npm run prisma:migrate:deploy

# 4) Export local data (data only)
pg_dump --dbname="$LOCAL_DATABASE_URL" --data-only --no-owner --no-privileges --exclude-table=public._prisma_migrations --file=.tmp/trekpal_data.sql

# 5) Import into Supabase
psql "$DIRECT_URL" -f .tmp/trekpal_data.sql

# 6) Preview KYC migration (dry run)
npm run migrate:kyc

# 7) Execute KYC migration
npm run migrate:kyc:execute
```

### Validation checklist

- Compare local and Supabase row counts using `npm run db:counts` against each environment.
- Verify admin agency endpoints return valid signed URLs for `cnicImageUrl` and `ownerPhotoUrl`.
- Verify new agency registration uploads KYC files to Supabase Storage.

---
