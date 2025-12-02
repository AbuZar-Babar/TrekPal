# Database Seeding Instructions

## Prerequisites

Before running the seed script, make sure you have:

1. **PostgreSQL database running**
2. **Database connection configured** in `.env` file:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/trekpal?schema=public"
   ```

## Steps to Seed Database

### Option 1: Run seed directly (recommended)
```bash
npm run seed
```

This will automatically:
1. Generate Prisma Client (`prisma generate`)
2. Run the seed script

### Option 2: Manual steps
```bash
# 1. Generate Prisma Client
npm run prisma:generate

# 2. Run migrations (if not done already)
npm run prisma:migrate

# 3. Run seed script
npm run prisma:seed
```

## What the Seed Script Creates

- **1 Admin user** (admin@trekpal.com)
- **8 Traveler users** (user1@example.com to user8@example.com)
- **5 Travel agencies** (mix of approved, pending, rejected statuses)
- **5 Hotels** with rooms (3 rooms per hotel)
- **5 Vehicles** (cars, vans, buses)
- **2 Travel packages**
- **5 Trip requests**
- **3 Bids**
- **3 Bookings**
- **3 Reviews**

## Troubleshooting

### Error: "@prisma/client did not initialize yet"
**Solution:** Run `npm run prisma:generate` first, then try seeding again.

### Error: "Database connection failed"
**Solution:** 
1. Check if PostgreSQL is running
2. Verify `DATABASE_URL` in `.env` file
3. Ensure database exists: `createdb trekpal` (if using PostgreSQL CLI)

### Error: "Table does not exist"
**Solution:** Run migrations first:
```bash
npm run prisma:migrate
```

### To reset and reseed
```bash
# Reset database (WARNING: This deletes all data!)
npx prisma migrate reset

# Then seed again
npm run seed
```

