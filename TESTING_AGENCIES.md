# Testing Agency Registration and Admin Dashboard

## Step-by-Step Testing Guide

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
🚀 Server running on port 3000
📝 Environment: development
🔗 API: http://localhost:3000/api
```

### 2. Check Backend Logs

When you register an agency, you should see in the backend terminal:
```
[Auth Service] Creating agency in database: { email: '...', name: '...', ... }
[Auth Service] Agency created successfully: { id: '...', email: '...', status: 'PENDING' }
```

### 3. Register an Agency

1. Go to agency portal: `http://localhost:5173`
2. Click "Sign up"
3. Fill in the form:
   - Agency Name: `Test Agency`
   - Email: `test@agency.com`
   - Password: `password123` (min 8 characters)
4. Click "Create Account"

**Check backend terminal** - you should see:
- `[Auth Service] Creating agency in database`
- `[Auth Service] Agency created successfully`

### 4. Check Admin Dashboard

1. Go to admin portal: `http://localhost:5174`
2. Log in with:
   - Email: `hashim@gmail.com`
   - Password: `1q2w3e`
3. Click on "Agencies" in the sidebar

**Check backend terminal** - you should see:
```
[Admin Controller] GET /admin/agencies - Request: { page: 1, limit: 20, ... }
[Admin Service] Fetching agencies with filters: { ... }
[Admin Service] Found agencies: { count: X, total: X, agencies: [...] }
[Admin Controller] Sending response: { agenciesCount: X, total: X }
```

### 5. Check Browser Console

Open browser DevTools (F12) → Console tab

**In Agency Portal (after registration):**
- Should see: `[Agency Service] Response: ...`

**In Admin Portal (when viewing agencies):**
- Should see: `[AgencyList] Fetching agencies with params: ...`
- Should see: `[Agency Service] Response: ...`

### 6. Direct API Testing

#### Test Agency Registration (Postman/curl):

```bash
curl -X POST http://localhost:3000/api/auth/register/agency \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@agency.com",
    "password": "password123",
    "name": "Test Agency 2"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Agency registered successfully. Pending admin approval.",
  "data": {
    "user": { ... },
    "token": "..."
  }
}
```

#### Test Get Agencies (requires admin token):

1. Get your admin token from browser console:
   ```javascript
   localStorage.getItem('token')
   ```

2. Use it in the request:
```bash
curl -X GET "http://localhost:3000/api/admin/agencies" \
  -H "Authorization: Bearer admin-dummy-token-1703123456789" \
  -H "Content-Type: application/json"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Agencies retrieved successfully",
  "data": {
    "agencies": [
      {
        "id": "...",
        "email": "test@agency.com",
        "name": "Test Agency",
        "status": "PENDING",
        ...
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### 7. Check Database Directly

If you have access to PostgreSQL:

```sql
-- Connect to database
psql -U postgres -d trekpal

-- Check all agencies
SELECT id, email, name, status, "createdAt" FROM "Agency" ORDER BY "createdAt" DESC;

-- Count agencies by status
SELECT status, COUNT(*) FROM "Agency" GROUP BY status;
```

### 8. Common Issues and Solutions

#### Issue: "No agencies found" in admin dashboard

**Check:**
1. ✅ Backend is running on port 3000
2. ✅ Agency was registered (check backend logs)
3. ✅ Admin is logged in (check token in localStorage)
4. ✅ Check browser console for errors
5. ✅ Check Network tab in DevTools - is the API call being made?
6. ✅ Check backend terminal for the API request logs

#### Issue: 403 Forbidden Error

**Solution:**
- Make sure you're logged in as admin
- Token should start with `admin-dummy-token-`
- Clear localStorage and log in again

#### Issue: Network Error

**Solution:**
- Backend server is not running
- Start it: `cd backend && npm run dev`

#### Issue: Agency not appearing after registration

**Check:**
1. Backend logs show "Agency created successfully"
2. Database has the agency (check with SQL query above)
3. Admin dashboard is fetching from correct endpoint
4. No filters are applied (status filter should be empty)

### 9. Debug Checklist

- [ ] Backend server is running
- [ ] Database is connected (check backend logs)
- [ ] Agency registration shows success in backend logs
- [ ] Agency exists in database (check with SQL)
- [ ] Admin is logged in (token exists in localStorage)
- [ ] Admin token starts with `admin-dummy-token-`
- [ ] Browser console shows API calls
- [ ] Network tab shows successful API responses
- [ ] Backend terminal shows admin API request logs
- [ ] No CORS errors in browser console
- [ ] No 403/401 errors in Network tab

### 10. Enable More Debugging

The code now includes extensive logging. Check:

**Backend Terminal:**
- Agency registration logs
- Admin API request logs
- Database query results

**Browser Console:**
- Frontend API calls
- Response data
- Any errors

**Network Tab (DevTools):**
- Request URL
- Request headers (Authorization token)
- Response status
- Response data

