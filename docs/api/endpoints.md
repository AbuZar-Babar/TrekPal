# TrekPal Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

The backend will verify the Firebase token and return a JWT token in the `X-Auth-Token` response header for subsequent requests.

---

## Auth Endpoints

### 1. Register Traveler (User)

**POST** `/api/auth/register/user`

Register a new traveler account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890",
  "cnic": "1234567890123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clx1234567890",
      "firebaseUid": "firebase_uid_here",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "TRAVELER"
    },
    "token": "jwt_token_here"
  }
}
```

---

### 2. Register Travel Agency

**POST** `/api/auth/register/agency`

Register a new travel agency account. Agency will be in PENDING status until admin approval.

**Request Body:**
```json
{
  "email": "agency@example.com",
  "password": "password123",
  "name": "Travel Agency Inc",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "license": "TA-12345"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Agency registered successfully. Pending admin approval.",
  "data": {
    "user": {
      "id": "clx1234567890",
      "firebaseUid": "firebase_uid_here",
      "email": "agency@example.com",
      "name": "Travel Agency Inc",
      "role": "AGENCY"
    },
    "token": "jwt_token_here"
  }
}
```

---

### 3. Login

**POST** `/api/auth/login`

Login user, agency, or admin. Supports two methods:

#### Method 1: Firebase Token (Recommended)
Client authenticates with Firebase first, then sends the Firebase ID token.

**Request Body:**
```json
{
  "firebaseToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Method 2: Email/Password (Legacy/Testing)
For development and testing purposes.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clx1234567890",
      "firebaseUid": "firebase_uid_here",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "TRAVELER"
    },
    "token": "jwt_token_here"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 4. Verify CNIC

**POST** `/api/auth/verify-cnic`

Verify CNIC for a traveler. Requires authentication.

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Request Body:**
```json
{
  "cnic": "1234567890123",
  "cnicImage": "https://storage.example.com/cnic-image.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "CNIC verification submitted",
  "data": {
    "cnicVerified": true
  }
}
```

---

### 5. Get Profile

**GET** `/api/auth/profile`

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "clx1234567890",
    "firebaseUid": "firebase_uid_here",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "TRAVELER"
  }
}
```

---

### 6. Refresh Token

**POST** `/api/auth/refresh`

Refresh authentication token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Note:** This endpoint is not yet implemented (returns 501).

---

## User Roles

- **TRAVELER**: Regular user who can book trips, hotels, transport
- **AGENCY**: Travel agency that can manage hotels, vehicles, packages, and submit bids
- **ADMIN**: Administrator who can approve/reject agencies, hotels, and vehicles

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {
    // Optional: Validation errors
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

---

## Next Steps

The following modules are ready for implementation:
- User Management
- Agency Management
- Hotel Management
- Transport Management
- Trip Request Management
- Bidding System
- Booking Management
- Admin Operations

