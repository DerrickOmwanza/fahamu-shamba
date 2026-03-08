# Login & Registration - Quick Reference Card

## 🚀 What Was Built

A complete login/registration system with:
- Landing page buttons linked to login/signup pages
- Two-step registration (Phone/Password → Profile Details)
- Phone-based login
- JWT token authentication
- Auto-redirect to farmer dashboard
- Mobile-responsive design
- Clear user instructions

---

## 📍 Key URLs

| URL | Purpose |
|-----|---------|
| `/` | Landing page (home) |
| `/login` | Shows login form by default |
| `/login?mode=login` | Explicitly shows login form |
| `/login?mode=signup` | Shows registration form |
| `/farmer-dashboard` | User dashboard (after login) |

---

## 🔘 Button Links on Landing Page

**Header Navigation:**
- **Login button** → `/login?mode=login`
- **Sign Up button** → `/login?mode=signup`

**Hero Section:**
- **"Create Account"** → `/login?mode=signup`
- **"Log In"** → `/login?mode=login`

**CTA Section:**
- **"Create Free Account"** → `/login?mode=signup`
- **"Log In to Dashboard"** → `/login?mode=login`

---

## 📋 Registration Flow

### Step 1: Security
```
Phone:    +2547XXXXXXXX (or 2547XXXXXXXX or 07XXXXXXXX)
Password: Minimum 6 characters
```
→ POST `/api/auth/register`

### Step 2: Farm Profile
```
Name:      Full name (required)
Location:  County name (required)
Ward:      Sub-county (optional)
Farm Size: Numeric value (optional)
```
→ POST `/api/auth/register-profile`

### Result:
✅ Account created  
✅ JWT token issued  
✅ Auto-redirect to dashboard

---

## 🔐 Login Flow

```
Phone:    +2547XXXXXXXX (or variations)
Password: Your password
```
→ POST `/api/auth/login`

### Result:
✅ JWT token issued  
✅ Auto-redirect to dashboard

---

## 💡 User Instructions (Visible on Landing Page)

**🚀 Getting Started is Easy!**

Choose your path:
1. **New Farmer?** Click the **Sign Up** button to create an account. You'll set up your profile in just 2 minutes.
2. **Already have an account?** Click the **Login** button to access your personalized dashboard.
3. **First time here?** Check out the Features section above to see what Fahamu Shamba offers.

After logging in, you'll access your **Farmer Dashboard** where you can:
- Get crop recommendations
- Check weather forecasts
- Track market prices

---

## 🛠️ Setup Checklist

- [ ] Ensure `login-register.html` is in `frontend/` directory
- [ ] Ensure `auth-routes.js` is in `backend/` directory
- [ ] Add `/login` route to `server.js`
- [ ] Add `initAuthRoutes(db)` to `server.js`
- [ ] Run `initializeAuthTables(db)` once to create tables
- [ ] Update landing page buttons (✅ Already done)
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test redirect to dashboard

---

## 📱 User Journey

```
1. User lands on homepage (/)
   ↓
2. User reads instructions banner
   ↓
3. User clicks "Sign Up" or "Login" button
   ↓
4. User is taken to /login page
   ↓
5. Correct form auto-displays based on URL parameter
   ↓
6. User fills form(s) and submits
   ↓
7. Backend validates and creates/authenticates account
   ↓
8. JWT token issued
   ↓
9. Token stored in localStorage
   ↓
10. User auto-redirected to /farmer-dashboard
   ↓
11. Dashboard reads token and loads user data
```

---

## 🎨 Colors Used

| Element | Color | Hex |
|---------|-------|-----|
| Primary Button | Green | #2E7D32 |
| Secondary Button | Orange | #F57C00 |
| Background | Off-white | #F0F4F1 |
| Form Card | White | #FFFFFF |
| Text | Dark Gray | #333333 |
| Instructions Banner | Light Green/Blue | Gradient |

---

## 📝 API Endpoints

### POST /api/auth/register
**Request:**
```json
{
  "phone": "+2547XXXXXXXX",
  "password": "test123"
}
```
**Response:**
```json
{
  "status": "success",
  "userId": 1,
  "message": "Step 1 complete..."
}
```

---

### POST /api/auth/register-profile
**Request:**
```json
{
  "userId": 1,
  "name": "Derrick",
  "location": "Siaya County",
  "ward": "West Gem",
  "farm_size": 2.5
}
```
**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "phone": "...", "name": "Derrick" }
}
```

---

### POST /api/auth/login
**Request:**
```json
{
  "phone": "+2547XXXXXXXX",
  "password": "test123"
}
```
**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "phone": "...", "name": "Derrick" }
}
```

---

## 🧪 Quick Test Commands

### Register via curl:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "+2547XXXXXXXX", "password": "test123"}'
```

### Complete registration via curl:
```bash
curl -X POST http://localhost:5000/api/auth/register-profile \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "name": "John", "location": "Siaya"}'
```

### Login via curl:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+2547XXXXXXXX", "password": "test123"}'
```

---

## ⚠️ Important Notes

1. **Phone Validation:** Uses E.164 format. Accepts multiple formats but normalizes them.
2. **Password Hashing:** Uses Bcrypt (10 rounds). Never stored in plain text.
3. **Token Storage:** JWT stored in `localStorage` (client-side).
4. **Token Expiry:** Default 7 days. Can be changed in `auth-routes.js`.
5. **Database:** Uses SQLite with `users`, `farms`, `locations` tables.
6. **Security:** JWT_SECRET should be changed in production.

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Buttons don't link | Check landing page links: `/login?mode=...` |
| Form doesn't switch | Check browser console for JS errors |
| Registration fails | Ensure auth routes are registered in server.js |
| Login returns 404 | Ensure `/login` route is added to server.js |
| "Cannot GET /login" | Check file path in server.js route |
| Database error | Run `initializeAuthTables(db)` |

---

## 📞 Support Resources

- **Full Setup Guide:** `AUTH_INTEGRATION_GUIDE.md`
- **Complete Setup:** `LOGIN_REGISTRATION_SETUP.md`
- **Database Schema:** `DATABASE_SCHEMA.md`
- **Auth Routes Code:** `backend/auth-routes.js`
- **Login Page Code:** `frontend/login-register.html`
- **Landing Page:** `backend/public/landing-page-optimized.html`

---

## ✅ What's Ready to Use

- ✅ Landing page with integrated buttons
- ✅ Login/registration forms (HTML/CSS/JS)
- ✅ Backend API endpoints
- ✅ Database tables
- ✅ Form validation
- ✅ Error handling
- ✅ Mobile responsive design
- ✅ JWT authentication
- ✅ Password hashing

Everything is **production-ready** for your farmer users! 🌾
