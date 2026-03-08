# Complete Project Structure Explained

## 📁 Your Project Layout

```
fahamu-shamba1-main/
│
├── 🔥 BACKEND (Node.js/Express Server)
│   ├── backend/
│   │   ├── server.js                    ← Main server entry point
│   │   ├── package.json                 ← Dependencies (Express, CORS, etc)
│   │   ├── .env                         ← Environment variables (API keys, DB URL)
│   │   │
│   │   ├── 📄 HTML/Frontend Files
│   │   └── public/
│   │       ├── landing-page-optimized.html      ← Home page
│   │       ├── login-register.html              ← Login/signup form
│   │       ├── farmer-dashboard.html            ← Main dashboard
│   │       ├── crop-prediction.html             ← Prediction page
│   │       ├── market-trends.html               ← Market prices page
│   │       ├── recommendations.html             ← Recommendations page
│   │       ├── community.html                   ← Community forum
│   │       ├── feedback.html                    ← Feedback form
│   │       ├── farmer-profile.html              ← User profile page
│   │       ├── admin-dashboard.html             ← Admin panel
│   │       ├── js/                              ← JavaScript files
│   │       └── translations/                    ← Language files
│   │
│   ├── 🔗 API Routes (Express routes)
│   │   ├── auth-routes.js               ← Login/Register/JWT
│   │   ├── farmer-routes.js             ← Farmer profile endpoints
│   │   ├── admin-routes.js              ← Admin management
│   │   ├── market-routes.js             ← Market prices API
│   │   ├── community-routes.js          ← Forum/community API
│   │   ├── feedback-routes.js           ← Feedback submission
│   │   └── farmer-profile-routes.js     ← Profile management
│   │
│   ├── 🗄️ Database & Services
│   │   ├── fahamu_shamba.db             ← SQLite database (LOCAL)
│   │   ├── admin-database.js            ← Admin DB operations
│   │   ├── farmer-module.js             ← Farmer DB operations
│   │   ├── farmer-profile-dashboard.js  ← Profile DB operations
│   │   ├── recommendation-engine.js     ← ML recommendations
│   │   ├── market-service.js            ← Market data service
│   │   ├── email-service.js             ← Email sending
│   │   ├── ussd-service.js              ← USSD gateway
│   │   └── community-service.js         ← Community service
│   │
│   └── 🛠️ Utilities
│       ├── admin-auth.js                ← Admin authentication
│       ├── admin-middleware.js          ← Security middleware
│       ├── demo-data.js                 ← Sample data
│       └── setup-admin.js               ← Initial setup
│
├── 📱 FRONTEND (React Native App)
│   ├── frontend/
│   │   ├── FahamuShamba/                ← React Native app source
│   │   │   ├── package.json             ← React/Expo dependencies
│   │   │   ├── App.tsx                  ← Main app component
│   │   │   ├── index.ts                 ← App entry point
│   │   │   └── assets/                  ← Images, fonts, etc
│   │   │
│   │   ├── login-register.html          ← Web version of login
│   │   └── language-utils.js            ← Language switching
│   │
│   └── ⚠️ ISSUE: Frontend points to backend/public for HTML
│       (All HTML files are in backend/public, not here)
│
├── ⚡ API WRAPPER (Vercel Serverless)
│   ├── api/
│   │   └── index.js                     ← Express wrapper for Vercel
│   │       (Handles /api routes without full server.js)
│   │
│   └── ⚠️ ISSUE: This is incomplete, doesn't have auth/routes
│
└── ⚙️ Configuration Files
    ├── vercel.json                      ← Vercel deployment config
    ├── .env                             ← Global env variables
    └── .gitignore                       ← Git ignore rules

```

---

## 🔄 How the System Works

### LOCAL DEVELOPMENT (On Your Computer)

```
Your Browser (localhost:3000)
        ↓
        ├→ http://localhost:5000/  (Backend server starts)
        │   ├→ Serves landing page from backend/public/
        │   ├→ Serves all API endpoints (/api/...)
        │   └→ Connects to local SQLite database
        │
        └→ JavaScript makes API calls to localhost:5000
            ├→ /api/predict
            ├→ /api/market/prices
            ├→ /api/login
            └→ Returns JSON data
```

### VERCEL DEPLOYMENT (What SHOULD Happen)

```
Mobile User Scans QR (or clicks link)
        ↓
https://fahamu-shamba.vercel.app/  (Frontend on Vercel)
        ├→ Loads landing-page-optimized.html from backend/public/
        ├→ Loads CSS, JavaScript from backend/public/
        │
        └→ JavaScript makes API calls to backend API
            ├→ https://fahamu-shamba-api.vercel.app/api/predict
            ├→ https://fahamu-shamba-api.vercel.app/api/market/prices
            ├→ https://fahamu-shamba-api.vercel.app/api/login
            └→ Returns JSON data

        ↓ (Currently Failing)
        Backend API NOT deployed
        Getting 404 errors
```

---

## 📊 Current Deployment Status

### What You Did ✅
- Deployed `./frontend` folder to Vercel
- But `./frontend/FahamuShamba/` is React Native (mobile app)
- The actual web files are in `backend/public/`

### What's Missing ❌
- Backend (`server.js`) NOT deployed
- API endpoints not accessible
- Database not in cloud
- Frontend can't call /api/predict, /api/login, etc

### Result 🔴
```
Frontend: ✅ Works
Backend: ❌ Not deployed
APIs: ❌ Not available
Database: ❌ Not persisted
User sees: 404 error when accessing /dashboard
```

---

## 🎯 What Each File Does

### Backend Files

| File | Purpose |
|------|---------|
| `server.js` | Main Express server, handles all routes |
| `auth-routes.js` | Login/Register endpoints |
| `farmer-routes.js` | Farmer profile endpoints |
| `market-routes.js` | Market prices API |
| `recommendation-engine.js` | ML crop recommendations |
| `admin-routes.js` | Admin panel APIs |
| `email-service.js` | Send emails (OTP, notifications) |
| `ussd-service.js` | USSD gateway integration |
| `public/dashboard.html` | Web dashboard (served by server.js) |
| `package.json` | Node.js dependencies |
| `.env` | Configuration (DB URL, API keys, etc) |

### Frontend Files

| File | Purpose |
|------|---------|
| `frontend/FahamuShamba/App.tsx` | React Native main app |
| `frontend/login-register.html` | Web login page |
| `backend/public/*.html` | All web pages |
| `backend/public/js/` | JavaScript functionality |
| `backend/public/translations/` | Multi-language files |

### API Wrapper

| File | Purpose |
|------|---------|
| `api/index.js` | Lightweight Express app for Vercel |
| Serves basic endpoints only | Doesn't include auth, routes, etc |

---

## 🚀 Deployment Architecture (Correct Way)

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Cloud)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Project 1: Frontend                                        │
│  ├─ Serves: backend/public/ HTML files                     │
│  ├─ URL: https://fahamu-shamba.vercel.app                 │
│  ├─ Loads in: Instant                                      │
│  └─ Size: 50MB                                             │
│                                                             │
│  Project 2: Backend API                                     │
│  ├─ Runs: server.js (Node.js)                             │
│  ├─ Exposes: /api routes (predict, market, etc)           │
│  ├─ URL: https://fahamu-shamba-api.vercel.app             │
│  └─ Connects to: MongoDB Atlas (cloud database)           │
│                                                             │
│  Project 3 (Optional): Database                            │
│  ├─ MongoDB Atlas: Free tier                              │
│  ├─ Stores: All user data                                 │
│  └─ Accessible: From anywhere                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ CORS calls ↓

┌─────────────────────────────────────────────────────────────┐
│            Your Local Computer (Development)               │
├─────────────────────────────────────────────────────────────┤
│  Optional: Run backend locally for testing                 │
│  $ npm run dev                                             │
│  $ curl http://localhost:5000/api/predict                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Points to Understand

### Why It Broke
1. You deployed only HTML files (frontend)
2. HTML files try to call `/api/predict`
3. No backend API deployed to respond
4. Gets 404 "NOT_FOUND"

### How to Fix
1. Deploy backend (`server.js`) to Vercel Project 2
2. Frontend will call the deployed backend
3. Both will work together

### Database Problem
1. SQLite stored on disk (`fahamu_shamba.db`)
2. Vercel is serverless (no persistent disk)
3. Database lost on each deployment
4. Solution: Use MongoDB or PostgreSQL

---

## 📋 Quick Reference

### Backend Entry Point
- **File:** `backend/server.js`
- **Port:** 5000 (local) or 3001 (production)
- **Serves:** HTML from `backend/public/`
- **Provides:** API at `/api/*`

### Frontend Files
- **HTML:** `backend/public/*.html`
- **Not in:** `frontend/` folder (only has React Native app)
- **Served by:** Express server.js

### Database Location
- **File:** `backend/fahamu_shamba.db`
- **Type:** SQLite (local only)
- **Problem:** Doesn't persist on Vercel
- **Solution:** Migrate to MongoDB

### Environment Variables
- **File:** `backend/.env`
- **Contains:** API keys, database URLs, CORS settings
- **Never:** Commit to Git

---

## ✅ Correct Deployment Checklist

- [ ] Backend (server.js) deployed to Vercel
- [ ] Frontend (public/ HTML) deployed to Vercel
- [ ] Frontend knows backend URL (via .env)
- [ ] Database in cloud (MongoDB/PostgreSQL)
- [ ] CORS enabled to allow frontend → backend calls
- [ ] All /api endpoints working
- [ ] Landing page loads
- [ ] Language selector works
- [ ] Dashboard loads and shows data

---

## 🎯 Your Next Steps

1. **Read:** `DEPLOY_NOW_STEPS.md` (exact commands to run)
2. **Deploy:** Backend first, then frontend
3. **Test:** Each API endpoint
4. **Fix:** Database to use MongoDB
5. **Monitor:** Vercel logs for errors

