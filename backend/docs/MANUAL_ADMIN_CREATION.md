# How to Manually Add Admin to Database

## Prerequisites
- PostgreSQL running on `localhost:5432`
- Database name: `trekpal`
- Prisma CLI installed

## Option 1: Using Prisma Studio (Recommended)

1. Open Prisma Studio:
   ```bash
   cd backend
   npm run prisma:studio
   ```

2. Navigate to the `Admin` model in the UI

3. Click "Add record"

4. Fill in the admin details:
   - **firebaseUid**: `admin-001` (or any unique identifier)
   - **email**: `admin@trekpal.com`
   - **name**: `Admin User`
   - **password**: Leave blank (handled by Firebase)

5. Click "Save 1 change"

## Option 2: Direct SQL Query

1. Connect to your PostgreSQL database:
   ```bash
   psql -U postgres -d trekpal
   ```

2. Insert admin record:
   ```sql
   INSERT INTO "Admin" ("id", "firebaseUid", "email", "name", "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'admin-001',
     'admin@trekpal.com',
     'Admin User',
     NOW(),
     NOW()
   );
   ```

3. Exit:
   ```sql
   \q
   ```

## Option 3: Using Seed Script

The admin is already created automatically when you run:
```bash
npm run db:setup
```

Default admin credentials from seed:
- **Email**: `admin@trekpal.com`
- **Password**: `admin123` (for Firebase authentication)
- **Firebase UID**: Auto-generated during seed

##  Important Notes

1. **Single Admin Policy**: 
   - The system is designed for a single admin
   - Multiple admins can exist in the database, but it's not recommended
   - No self-registration UI exists for admins

2. **Firebase UID**:
   - Must match the Firebase user UID if using Firebase authentication
   - In development mode, you can use any string (e.g., `admin-001`)

3. **Password**:
   - Passwords are NOT stored in the PostgreSQL database
   - Authentication is handled by Firebase
   - The `Admin` table only stores the reference to the Firebase user

## Removing the Seeded Admin

If you want to remove the auto-created admin:

```sql
DELETE FROM "Admin" WHERE email = 'admin@trekpal.com';
```

Then add your own admin using one of the methods above.

## Verifying Admin Creation

```sql
SELECT * FROM "Admin";
```

You should see your admin record with all fields populated.

---

**Last Updated**: 2026-02-06  
**Policy**: Single admin, manual creation only, no self-registration
