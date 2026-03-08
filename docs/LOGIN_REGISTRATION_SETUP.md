# Login & Registration System - Complete Setup Guide

## Overview

You now have a fully integrated login/registration system connected to your landing page. Users can seamlessly navigate from the landing page to create accounts or log in.

---

## What's Changed

### 1. **Landing Page** (`backend/public/landing-page-optimized.html`)
   - **Header buttons**: Now link to `/login?mode=login` and `/login?mode=signup`
   - **Hero section buttons**: "Create Account" → `/login?mode=signup`, "Log In" → `/login?mode=login`
   - **New instructions banner**: Clear guidance on how to get started (visible between testimonials and CTA)
   - **CTA buttons**: Both link to appropriate login/registration pages

### 2. **Login/Register Page** (`frontend/login-register.html`)
   - **Smart form switching**: Automatically shows login or registration form based on URL parameter
   - **Two-step registration**: Phone/password → Profile details
   - **JWT authentication**: Secure token-based sessions
   - **Mobile-responsive**: Optimized for low-end devices and slow connections

### 3. **Server Routes** (`backend/server.js`)
   - **New route**: `GET /login` → Serves login-register.html

---

## User Journey Flow

```
Landing Page (/)
    ↓
User clicks "Sign Up" or "Create Account"
    ↓
/login?mode=signup → Registration form opens (Step 1)
    ↓
Enter phone + password → Submit
    ↓
/login → Step 2 (Profile details) opens
    ↓
Enter name, location, farm size → Submit
    ↓
Account created, JWT token issued
    ↓
Auto-redirect to /farmer-dashboard
```

**For existing users:**
```
Landing Page (/)
    ↓
User clicks "Login"
    ↓
/login?mode=login → Login form opens
    ↓
Enter phone + password → Submit
    ↓
JWT token issued
    ↓
Auto-redirect to /farmer-dashboard
```

---

## URL Parameters

The login page supports query parameters to auto-switch forms:

- **`/login`** → Shows login form (default)
- **`/login?mode=login`** → Explicitly shows login form
- **`/login?mode=signup`** → Shows registration form (Step 1)

---

## Instructions Banner

The landing page now includes a clear **"Getting Started is Easy!"** section that explains:

1. **New Farmer?** Click "Sign Up" to create account in 2 minutes
2. **Existing Account?** Click "Login" to access dashboard
3. **First Time?** Check Features section to learn what's available

This banner is styled with:
- Light gradient background (blue → green)
- Green left border
- Clear, readable text with color-coded buttons
- Mobile-responsive design

---

## API Endpoints Used

### Registration (Step 1)
```
POST /api/auth/register
Body: { phone, password }
Response: { status, userId }
```

### Registration (Step 2)
```
POST /api/auth/register-profile
Body: { userId, name, location, ward, farm_size, farm_size_unit }
Response: { status, token, user }
```

### Login
```
POST /api/auth/login
Body: { phone, password }
Response: { status, token, user }
```

---

## Testing the Complete Flow

### 1. Start your backend:
```bash
node backend/server.js
```

### 2. Visit the landing page:
```
http://localhost:5000/
```

### 3. Test "Sign Up" button:
- Click "Sign Up" in header or hero section
- Should navigate to `/login?mode=signup`
- Registration form (Step 1) should display

### 4. Test registration:
- Enter phone: `+2547XXXXXXXX` (or `2547XXXXXXXX`)
- Enter password: `test123` (minimum 6 chars)
- Click "Next"
- Should show Step 2 form (Profile details)
- Enter name, location, farm size
- Click "Create Account"
- Should auto-redirect to `/farmer-dashboard`

### 5. Test "Login" button:
- Click "Login" in header or CTA section
- Should navigate to `/login?mode=login`
- Login form should display
- Enter the phone/password you just registered
- Should auto-redirect to `/farmer-dashboard`

---

## Key Features

### ✅ User-Friendly
- Clear button labels and tooltips
- Inline error messages
- Loading indicators
- Two-step registration (not overwhelming)
- Mobile-first design

### ✅ Secure
- Bcrypt password hashing
- JWT token authentication
- HTTPS-ready (use in production)
- E.164 phone number validation

### ✅ Fast
- Minimal form fields
- Single-page loading (no redirects during registration)
- Optimized for 2G networks
- Handles slow connections gracefully

### ✅ Inclusive
- Supports various phone formats (+2547XXXXXXXX, 2547XXXXXXXX, 07XXXXXXXX)
- Clear instructions in multiple formats
- Accessible button states and focus

---

## Customization Options

### Change button colors:
Edit `landing-page-optimized.html`:
```css
--primary: #2E7D32;       /* Green */
--secondary: #F57C00;     /* Orange */
```

### Change redirect after login:
Edit `login-register.html`:
```javascript
window.location.href = '/farmer-dashboard';  // Change this
```

### Change instructions banner text:
Edit `landing-page-optimized.html`, line 901-905:
```html
<li><strong>New Farmer?</strong> Click the <strong style="color: #F57C00;">Sign Up</strong> button...</li>
```

### Add OAuth (email/Google login):
Add new endpoints in `auth-routes.js`:
```javascript
// POST /api/auth/login-with-email
// POST /api/auth/oauth/google
```

---

## Common Issues & Solutions

### "Cannot GET /login"
- Ensure route is added to `server.js`
- Check file path: `path.join(__dirname, '..', 'frontend', 'login-register.html')`
- Verify `login-register.html` exists in `frontend/` directory

### "POST /api/auth/register returns 404"
- Ensure auth routes are initialized in `server.js`:
  ```javascript
  import { initAuthRoutes } from './auth-routes.js';
  const authRoutes = initAuthRoutes(db);
  app.use('/api/auth', authRoutes);
  ```

### "Phone number already registered"
- Use a different phone number
- Or clear database: `rm fahamu_shamba.db` (warning: deletes all data)

### Form doesn't show signup by default
- URL parameter might not be working
- Check browser console for errors
- Verify `DOMContentLoaded` event fires

### Buttons not linking correctly
- Verify URLs in `landing-page-optimized.html`:
  - `href="/login?mode=login"`
  - `href="/login?mode=signup"`

---

## Next Steps

1. **Add Password Reset:**
   - Create `/api/auth/forgot-password` endpoint
   - Send OTP to phone via SMS

2. **Add Email Verification:**
   - Add optional email during registration
   - Send verification link or OTP

3. **Add Profile Completion:**
   - After login, check if profile is complete
   - Show onboarding steps if missing fields
   - Collect optional fields (soil type, water source, crops)

4. **Add USSD Alternative:**
   - Allow registration/login via USSD
   - Map to same backend endpoints

5. **Analytics:**
   - Track registration completion rates
   - Monitor login failures
   - Identify form abandonment points

---

## File Locations

| File | Purpose |
|------|---------|
| `backend/public/landing-page-optimized.html` | Main landing page with buttons |
| `frontend/login-register.html` | Login/registration form |
| `backend/auth-routes.js` | API endpoints for auth |
| `backend/init-auth-tables.js` | Database initialization |
| `backend/server.js` | Server route setup |

---

## Production Checklist

- [ ] Change `JWT_SECRET` in `.env` to a strong, unique value
- [ ] Enable HTTPS for all auth routes
- [ ] Add rate limiting on `/api/auth/login` (prevent brute force)
- [ ] Add CAPTCHA if needed
- [ ] Monitor failed login attempts
- [ ] Set up email notifications for new registrations
- [ ] Add session timeout (7 days default)
- [ ] Test with real mobile devices
- [ ] Monitor database backups

---

## Support

For issues or questions:
1. Check the error message in browser console
2. Review the API response in Network tab
3. Verify all files are in place
4. Check `server.js` for route registration
5. Ensure database tables are initialized

Good luck! 🚀
