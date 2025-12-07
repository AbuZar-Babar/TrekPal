# Admin Token Guide

## How Admin Token Works

The admin token is **automatically generated and stored** when you log in to the admin portal.

## Getting the Token

### Method 1: Browser Console (Easiest)

1. **Log in to the admin portal** with:
   - Email: `hashim@gmail.com`
   - Password: `1q2w3e`

2. **Open Browser Console** (Press `F12` or `Right-click → Inspect → Console`)

3. **Run this command:**
   ```javascript
   localStorage.getItem('token')
   ```

4. **You'll see your token**, something like:
   ```
   admin-dummy-token-1703123456789
   ```

### Method 2: Application Tab (Chrome DevTools)

1. Open DevTools (`F12`)
2. Go to **Application** tab (or **Storage** in Firefox)
3. Expand **Local Storage**
4. Click on your site URL (e.g., `http://localhost:5174`)
5. Find the `token` key and view its value

### Method 3: View User Info

Run in console:
```javascript
// Get token
localStorage.getItem('token')

// Get user info
JSON.parse(localStorage.getItem('user'))
```

## Token Format

- **Format**: `admin-dummy-token-{timestamp}`
- **Example**: `admin-dummy-token-1703123456789`
- **Length**: ~30-35 characters

## How It's Used

### Automatic (In Admin Portal)

The token is **automatically added** to all API requests by the `apiClient`. You don't need to do anything - it's handled automatically!

**How it works:**
1. Token is stored in `localStorage` after login
2. `apiClient.ts` automatically reads it from `localStorage`
3. Adds it to the `Authorization` header: `Bearer {token}`
4. Backend validates the token and grants admin access

### Manual (For API Testing)

If you want to test the API directly (e.g., with Postman, curl, or browser):

#### Using curl:
```bash
curl -X GET "http://localhost:3000/api/admin/agencies" \
  -H "Authorization: Bearer admin-dummy-token-1703123456789" \
  -H "Content-Type: application/json"
```

#### Using Postman:
1. Set **Method**: `GET`
2. Set **URL**: `http://localhost:3000/api/admin/agencies`
3. Go to **Headers** tab
4. Add header:
   - **Key**: `Authorization`
   - **Value**: `Bearer admin-dummy-token-1703123456789` (replace with your actual token)

#### Using Browser (JavaScript Console):
```javascript
// Get your token
const token = localStorage.getItem('token');

// Make API call
fetch('http://localhost:3000/api/admin/agencies', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

## Token Lifecycle

1. **Login** → Token generated and stored in `localStorage`
2. **API Requests** → Token automatically added to headers
3. **Logout** → Token removed from `localStorage`
4. **Page Refresh** → Token persists (stays in `localStorage`)

## Troubleshooting

### Token Not Found

If `localStorage.getItem('token')` returns `null`:
- You're not logged in
- Token was cleared (logout or browser clear)
- **Solution**: Log in again

### Invalid Token Error

If you see "Invalid token format":
- Token doesn't start with `admin-dummy-token-`
- **Solution**: Clear `localStorage` and log in again

### 403 Forbidden Error

If you get 403 errors:
- Token might be old/expired
- Token format is incorrect
- **Solution**: 
  1. Check token format: `localStorage.getItem('token')`
  2. Should start with `admin-dummy-token-`
  3. If not, log out and log in again

## Quick Reference

```javascript
// Get token
const token = localStorage.getItem('token');

// Get user
const user = JSON.parse(localStorage.getItem('user'));

// Check if logged in
const isLoggedIn = !!localStorage.getItem('token');

// Clear token (logout)
localStorage.removeItem('token');
localStorage.removeItem('user');
```

## Important Notes

- **Token is stored in browser's localStorage** - it persists across page refreshes
- **Token is automatically sent** with all API requests - no manual work needed
- **Token format must start with `admin-dummy-token-`** for the backend to recognize it as admin
- **In production**, tokens would be JWT tokens from Firebase, but in development we use dummy tokens

