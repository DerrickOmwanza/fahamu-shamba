# Fix Registration Error (404 Not Found)

## 🔴 Problem

When attempting to register, you get:
- **Error:** `Failed to load resource: the server responded with a status of 404 (Not Found)`
- **Console:** `SyntaxError: Unexpected token '<', "<!DOCTYPE "...`

This means the `/api/auth/register` endpoint is not registered on the server.

---

## ✅ Solution Applied

### Step 1: Import Auth Modules (✓ DONE)
Added to top of `server.js`:
```javascript
import { initAuthRoutes } from './auth-routes.js';
import { initializeAuthTables } from './init-auth-tables.js';
```

### Step 2: Initialize Auth Tables (✓ DONE)
Added after database initialization:
```javascript
console.log('🔐 Initializing authentication tables...');
try {
  initializeAuthTables(db);
  console.log('✅ Authentication tables initialized');
} catch (error) {
  console.error('⚠️ Error initializing auth tables:', error.message);
}
```

### Step 3: Register Auth Routes (✓ DONE)
Added after table initialization:
```javascript
console.log('🚀 Registering authentication routes...');
const authRoutes = initAuthRoutes(db);
app.use('/api/auth', authRoutes);
console.log('✅ Authentication routes registered');
```

---

## 🚀 Next Steps

### 1. Install Dependencies
If you haven't already, install bcryptjs and jsonwebtoken:

```bash
npm install bcryptjs jsonwebtoken
```

### 2. Restart Server
Stop the current server and restart:

```bash
# Stop current process (Ctrl+C)
# Then start fresh
node backend/server.js
```

### 3. Check Console Output
When server starts, you should see:
```
✅ Connected to SQLite database
🔐 Initializing authentication tables...
✅ Authentication tables initialized
🚀 Registering authentication routes...
✅ Authentication routes registered
```

If you see errors, check the troubleshooting section below.

### 4. Test Registration
Open browser and visit:
```
http://localhost:5000/login?mode=signup
```

Fill in the form:
- Phone: `+2547XXXXXXXX` (replace X with any digits, e.g., +254712345678)
- Password: `test123` (minimum 6 characters)
- Confirm Password: `test123`

Click "Next" and complete the second step.

---

## 🧪 Verification Checklist

After restart, verify:

- [ ] Server starts without errors
- [ ] Console shows all 3 auth initialization messages
- [ ] `/api/auth/register` endpoint is available
- [ ] Registration form loads at `/login?mode=signup`
- [ ] Can enter phone and password
- [ ] "Next" button submits successfully
- [ ] Redirects to Step 2 (Profile)
- [ ] Can complete profile setup
- [ ] Gets redirected to dashboard
- [ ] localStorage contains token and user data

---

## 🐛 Troubleshooting

### Issue 1: Server won't start
**Error:** `Cannot find module 'bcryptjs'`

**Fix:**
```bash
npm install bcryptjs jsonwebtoken
node backend/server.js
```

---

### Issue 2: Auth tables don't initialize
**Error:** `Error initializing auth tables: users table already exists`

**This is OK!** It means tables already exist. Safe to ignore.

---

### Issue 3: Still getting 404
**Check:**
1. Did server log "✅ Authentication routes registered"?
2. Is `/login` route working? (Visit `http://localhost:5000/login`)
3. Are you making POST requests to `/api/auth/register`?

**Debug:**
Open browser console and check Network tab:
- Click "Next" on registration form
- Look for POST to `/api/auth/register`
- Check response status (should be 201 if success, 400 if validation error)

---

### Issue 4: Endpoint responds 404 but page loads
**Possible cause:** Routes registered but server restarted before registration page loaded.

**Fix:**
1. Fully stop server (Ctrl+C)
2. Wait 2 seconds
3. Restart server
4. Try registration again

---

### Issue 5: .env file missing JWT_SECRET
**Warning:** `Using default JWT_SECRET (farmer_secret_key_change_in_production)`

**Fix (optional, but recommended for production):**

Create/update `.env`:
```
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 Database Schema Check

After initialization, verify tables exist:

**Using SQLite CLI (optional):**
```bash
sqlite3 fahamu_shamba.db

# In SQLite prompt:
.tables  # Should show: users, farms, locations, sessions, etc.

# Check users table
.schema users

# Check if auth tables exist
SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'farms');
```

---

## 🔐 Security Notes

1. **Change JWT_SECRET in production** - Use strong random value
2. **Use HTTPS in production** - Protect tokens in transit
3. **Set secure cookies** - If adding session support
4. **Rate limit endpoints** - Prevent brute force attacks

---

## 📱 Mobile Testing

After fixing, test on mobile:

1. Visit `http://localhost:5000/` from phone
2. Click "Sign Up"
3. Fill registration form
4. Verify it works on small screens

---

## ✅ Expected Flow After Fix

```
User visits landing page
    ↓
Clicks "Sign Up" button
    ↓
Goes to /login?mode=signup
    ↓
Fills phone + password
    ↓
Clicks "Next"
    ↓
POST /api/auth/register (returns 201 with userId)
    ↓
Step 2 form appears
    ↓
Fills name, location, farm size
    ↓
Clicks "Create Account"
    ↓
POST /api/auth/register-profile (returns 201 with token)
    ↓
Auto-redirects to /farmer-dashboard
    ↓
Token stored in localStorage
    ✅ Success!
```

---

## 📞 If Still Having Issues

1. **Check console output** - Look for errors
2. **Check Network tab** - Verify request/response
3. **Verify imports** - Make sure `auth-routes.js` exists
4. **Verify tables** - Use SQLite CLI to check
5. **Restart everything** - Stop server, clear cache, restart

---

## 🎯 Summary

**What was fixed:**
- ✅ Added auth imports to server.js
- ✅ Initialize auth tables on startup
- ✅ Register auth routes on startup
- ✅ All endpoints now available

**What you need to do:**
1. Install dependencies: `npm install bcryptjs jsonwebtoken`
2. Restart server: `node backend/server.js`
3. Test registration at `http://localhost:5000/login?mode=signup`

**Expected result:**
- Registration works
- Account is created
- User is logged in
- Redirected to dashboard

Good luck! 🌾✅
