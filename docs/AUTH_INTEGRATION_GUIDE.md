# Authentication System Integration Guide

## Overview

This guide walks you through integrating the new login/registration system into your Fahamu Shamba backend.

---

## Files Created

1. **DATABASE_SCHEMA.md** - Complete schema with table definitions
2. **backend/init-auth-tables.js** - Database initialization script
3. **backend/auth-routes.js** - Authentication API endpoints
4. **frontend/login-register.html** - Login/register UI (ready to use)

---

## Step 1: Install Dependencies

Make sure you have these packages installed:

```bash
npm install bcryptjs jsonwebtoken dotenv
```

---

## Step 2: Initialize Database Tables

In your `server.js`, add the auth table initialization **before** starting the server:

```javascript
import { initializeAuthTables } from './init-auth-tables.js';

// After creating db instance
const db = new Database('./fahamu_shamba.db');
console.log('✅ Connected to SQLite database');

// Initialize auth tables (do this once)
initializeAuthTables(db);
```

**Or run the initialization script directly:**

```bash
node backend/init-auth-tables.js
```

---

## Step 3: Register Auth Routes in server.js

Add this to your `server.js` after the database is initialized:

```javascript
import { initAuthRoutes } from './auth-routes.js';

// ... after database setup ...

// Initialize auth routes
const authRoutes = initAuthRoutes(db);
app.use('/api/auth', authRoutes);
```

**Complete example (in server.js):**

```javascript
import express from 'express';
import Database from 'better-sqlite3';
import { initializeAuthTables } from './init-auth-tables.js';
import { initAuthRoutes } from './auth-routes.js';

const app = express();
const db = new Database('./fahamu_shamba.db');

// Initialize auth tables
initializeAuthTables(db);

// Register auth routes
const authRoutes = initAuthRoutes(db);
app.use('/api/auth', authRoutes);

// Rest of your server setup...
app.listen(5000, () => console.log('Server running on port 5000'));
```

---

## Step 4: Add Environment Variables

Add to your `.env` file:

```env
JWT_SECRET=your_secret_key_change_in_production
NODE_ENV=development
PORT=5000
```

**For production**, use a strong, unique secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 5: Serve Login/Register Page

Add this to your `server.js`:

```javascript
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login-register.html'));
});
```

Or copy `frontend/login-register.html` to `backend/public/` and access via `http://localhost:5000/login`.

---

## API Endpoints

### 1. Register (Step 1) - Phone + Password

**POST** `/api/auth/register`

**Request:**
```json
{
  "phone": "+2547XXXXXXXX",
  "password": "securePassword123"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Step 1 complete. Proceed to profile setup.",
  "userId": 12345
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Phone number already registered"
}
```

---

### 2. Register (Step 2) - Profile Details

**POST** `/api/auth/register-profile`

**Request:**
```json
{
  "userId": 12345,
  "name": "Derrick",
  "location": "Siaya County",
  "ward": "West Gem",
  "farm_size": 2.5,
  "farm_size_unit": "acres"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 12345,
    "phone": "+2547XXXXXXXX",
    "name": "Derrick",
    "location": "Siaya County",
    "farm_size": 2.5
  }
}
```

---

### 3. Login

**POST** `/api/auth/login`

**Request:**
```json
{
  "phone": "+2547XXXXXXXX",
  "password": "securePassword123"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 12345,
    "phone": "+2547XXXXXXXX",
    "name": "Derrick",
    "location": "Siaya County",
    "farm_size": 2.5
  }
}
```

---

### 4. Get Current User

**GET** `/api/auth/user`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "success",
  "user": {
    "id": 12345,
    "phone": "+2547XXXXXXXX",
    "name": "Derrick",
    "location": "Siaya County",
    "farm_size": 2.5
  }
}
```

---

### 5. Logout

**POST** `/api/auth/logout`

**Response:**
```json
{
  "status": "success",
  "message": "Logged out. Please discard your token."
}
```

---

## Frontend Implementation

The `login-register.html` is **fully functional** and ready to use.

### Features:
- Phone + password validation
- Two-step registration (Security → Profile)
- Real-time error messages
- Loading states
- Stores JWT token in localStorage
- Auto-redirects to `/farmer-dashboard` on success

### Customization:

**Change API URL:**
```javascript
const API_URL = '/api/auth'; // Change this if your API is elsewhere
```

**Change redirect URL:**
```javascript
window.location.href = '/farmer-dashboard'; // Change destination
```

---

## Testing

### Quick Test with curl:

**1. Register (Step 1):**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "+2547XXXXXXXX", "password": "test123"}'
```

**2. Register (Step 2):**
```bash
curl -X POST http://localhost:5000/api/auth/register-profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "name": "John Doe",
    "location": "Siaya County",
    "farm_size": 2.5
  }'
```

**3. Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+2547XXXXXXXX", "password": "test123"}'
```

**4. Get User (with token):**
```bash
curl http://localhost:5000/api/auth/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Security Notes

1. **Password Hashing:** Uses Bcrypt (10 rounds).
2. **JWT Tokens:** Expire in 7 days. Change expiry in `auth-routes.js`.
3. **Phone Format:** Accepts E.164 format (+2547XXXXXXXX or 2547XXXXXXXX).
4. **Password Strength:** Minimum 6 characters (update `isStrongPassword()` for stricter rules).
5. **HTTPS:** Use HTTPS in production.
6. **JWT Secret:** Change `JWT_SECRET` in `.env`.

---

## Common Issues

### "users table does not exist"
- Run `initializeAuthTables(db)` in server.js or execute `node backend/init-auth-tables.js`

### "Phone already registered"
- Use a different phone number or clear the database with: `rm fahamu_shamba.db`

### "Invalid token"
- Token may have expired. User needs to log in again.
- Check JWT_SECRET matches in `.env` and `auth-routes.js`.

### CORS errors
- Ensure CORS is enabled in server.js:
  ```javascript
  app.use(cors({ origin: true, credentials: true }));
  ```

---

## Next Steps

1. **Protect Dashboard:** Add middleware to verify tokens on protected routes.
2. **Password Reset:** Implement `/api/auth/forgot-password` endpoint.
3. **Profile Update:** Add `/api/user/profile` endpoint for updating farm details.
4. **Email Verification:** Add email-based OTP (similar to existing setup).
5. **Phone Verification:** Integrate Safaricom SMS for phone verification.

---

## Questions?

Refer to:
- `DATABASE_SCHEMA.md` for schema details
- `auth-routes.js` for endpoint implementations
- `login-register.html` for frontend code

Good luck, Derrick! 🚀
