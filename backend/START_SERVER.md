# How to Start the Backend Server

## Quick Start

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Set up environment (if not already done):**
   ```bash
   node create-env.js
   ```
   Then edit `.env` file with your database credentials.

4. **Start the server:**
   ```bash
   npm run dev
   ```

5. **You should see:**
   ```
   🚀 Server running on port 3000
   📝 Environment: development
   🔗 API: http://localhost:3000/api
   ```

## Troubleshooting

### "Cannot find module" errors
**Solution:** Install dependencies
```bash
npm install
```

### "DATABASE_URL is required" error
**Solution:** Create and configure `.env` file
```bash
node create-env.js
# Then edit .env with your PostgreSQL connection string
```

### "Port 3000 is already in use"
**Solution:** Either:
- Stop the other application using port 3000
- Or change the port in `.env` file: `PORT=3001`

### Database connection errors
**Solution:** 
1. Make sure PostgreSQL is running
2. Check your `.env` file has correct `DATABASE_URL`
3. Make sure the database `trekpal` exists
4. See `QUICK_START.md` for database setup

## What the Server Does

- Runs on `http://localhost:3000`
- API endpoints are at `http://localhost:3000/api`
- Health check: `http://localhost:3000/health`
- Allows CORS from:
  - `http://localhost:5173` (Agency Portal)
  - `http://localhost:5174` (Admin Portal)

## Testing the Server

Open your browser and go to:
```
http://localhost:3000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-..."
}
```

If you see this, the server is running correctly! ✅

