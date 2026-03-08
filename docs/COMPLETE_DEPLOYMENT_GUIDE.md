# Complete Fahamu Shamba Deployment Guide

## Project Architecture Overview

Your project has **3 main components**:

```
fahamu-shamba1-main/
├── backend/              (Node.js/Express server)
│   ├── server.js        (Main backend server)
│   ├── package.json
│   ├── public/          (Frontend HTML/JS/CSS)
│   ├── .env             (Environment variables)
│   └── [various routes & modules]
│
├── frontend/            (React Native/Expo mobile app)
│   ├── FahamuShamba/   (React Native app source)
│   ├── login-register.html
│   └── language-utils.js
│
├── api/                 (Vercel serverless function)
│   └── index.js        (Wrapper for Vercel deployment)
│
└── vercel.json          (Vercel configuration)
```

---

## Why You're Getting 404 Errors

The issue is that you deployed **only the frontend** (`./frontend` folder) to Vercel, but:
- Your frontend files in `public/` need the backend API to work
- The language selector, dashboard, and predictions all depend on backend endpoints
- The backend API is NOT deployed yet - still running locally

---

## CORRECT Deployment Steps

### Step 1: Prepare the Backend

**1.1 Update backend environment variables**

Ask your backend/.env file to be configured with:
```
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
DATABASE_URL=[if using cloud DB]
```

**1.2 Ensure backend has all public files**

The backend `public/` folder has all HTML files. This is correct.

---

### Step 2: Deploy Backend to Vercel (Separate Project)

**2.1 Create a new Vercel project for the backend**

```bash
cd c:\Users\ADMIN\fahamu-shamba1-main\backend
vercel --prod
```

When prompted:
- **Set up and deploy?** → `yes`
- **Scope?** → `Janganya Derrick`
- **Link to existing project?** → `no` (new project for backend)
- **Project name?** → `fahamu-shamba-backend`
- **Directory?** → `./` (root of backend folder)
- **Framework?** → `Other` or no framework detected is fine
- **Modify settings?** → `yes`

**2.2 Update Vercel build settings for backend:**

When Vercel asks about settings:
- **Build Command:** `npm install`
- **Output Directory:** Leave empty
- **Install Command:** `npm install`
- **Start Command:** `node server.js`

After deployment, you'll get a URL like: `https://fahamu-shamba-backend.vercel.app`

---

### Step 3: Deploy Frontend to Vercel (New or Update)

**3.1 Delete old Vercel project or update it**

Option A: Start fresh (recommended)
```bash
rm -r .vercel
```

Option B: Update existing project

**3.2 Deploy frontend**

```bash
cd c:\Users\ADMIN\fahamu-shamba1-main
vercel --prod
```

When prompted:
- **Set up and deploy?** → `yes`
- **Scope?** → `Janganya Derrick`
- **Link to existing project?** → `no` (or `yes` if updating)
- **Project name?** → `fahamu-shamba`
- **Directory?** → `./frontend`
- **Modify settings?** → `yes`

**3.3 Create vercel.json in frontend folder**

Create `frontend/vercel.json`:

```json
{
  "version": 2,
  "buildCommand": "npm run build || npm install",
  "public": true,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/$1"
    },
    {
      "source": "/api(.*)",
      "destination": "/api$1"
    }
  ]
}
```

---

### Step 4: Update Frontend Environment Variables

**4.1 Create frontend/.env or frontend/FahamuShamba/.env**

```
REACT_APP_API_URL=https://fahamu-shamba-backend.vercel.app
REACT_APP_BACKEND_URL=https://fahamu-shamba-backend.vercel.app
```

**4.2 Update API calls in frontend code**

Search for any hardcoded `localhost:5000` or `localhost:3000` and replace with your backend URL.

---

### Step 5: Verify Backend is Accessible

Test the backend API:

```bash
# Test health endpoint
https://fahamu-shamba-backend.vercel.app/api/health

# Test predictions
https://fahamu-shamba-backend.vercel.app/api/predict

# Test market prices
https://fahamu-shamba-backend.vercel.app/api/market/prices
```

All should return JSON responses.

---

## DEPLOYMENT FLOW (Summary)

```
1. Backend (Node.js/Express) → Vercel Project #1
   - Serves API endpoints (/api/predict, /api/market, etc.)
   - Serves HTML files from public/
   - URL: https://fahamu-shamba-backend.vercel.app

2. Frontend (React/HTML) → Vercel Project #2 OR same project
   - Mobile app entry point
   - Calls backend API for data
   - URL: https://fahamu-shamba.vercel.app

3. Database (SQLite) → Local or Cloud
   - backend/fahamu_shamba.db
   - Or migrate to PostgreSQL/MongoDB
```

---

## Fix Your Current Deployment

Since you already deployed to Vercel, here's what to do:

### Option 1: Redeploy Correctly (Recommended)

**Step 1: Delete current Vercel projects**
- Go to vercel.com
- Delete "Fahamu Shamba" project
- Delete any other related projects

**Step 2: Deploy backend first**
```bash
cd c:\Users\ADMIN\fahamu-shamba1-main\backend
vercel --prod --name fahamu-shamba-backend
```

**Step 3: Deploy frontend**
```bash
cd c:\Users\ADMIN\fahamu-shamba1-main
vercel --prod --name fahamu-shamba
```

**Step 4: Update frontend env with backend URL**

### Option 2: Quick Fix (If you keep current setup)

**Modify api/index.js** to proxy all requests to the backend:

```javascript
import fetch from 'node-fetch';

const BACKEND_URL = 'https://fahamu-shamba-backend.vercel.app';

app.use('/api', async (req, res) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api${req.path}`, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## After Deployment: Testing

### Test URL Flow:

1. **Landing Page**
   - `https://your-frontend-url.vercel.app/`
   - Should load language selector

2. **Language Selection**
   - Select language → should navigate to dashboard

3. **Dashboard**
   - `https://your-frontend-url.vercel.app/farmer-dashboard`
   - Should load with data from backend

4. **Crop Prediction**
   - Call `/api/predict` with soil type, sub-county, season
   - Should return crop recommendation

5. **Market Prices**
   - Call `/api/market/prices`
   - Should return live prices

---

## Troubleshooting

### 404 Error on Dashboard
- **Cause:** Frontend not properly routing SPA navigation
- **Fix:** Add `vercel.json` with rewrites (see Step 3.3)

### API Calls Failing
- **Cause:** Backend URL not set or wrong
- **Fix:** Check `.env` and verify backend is deployed and accessible

### Language Selector Stuck
- **Cause:** Backend not responding to language endpoints
- **Fix:** Ensure backend `server.js` is running with language routes

### Database Not Found
- **Cause:** SQLite database not included in deployment
- **Fix:** Migrate to MongoDB/PostgreSQL or use persistent storage

---

## Database Migration (Recommended for Production)

SQLite doesn't persist between Vercel deployments. Migrate to:

### Option 1: MongoDB (Recommended)

1. Create MongoDB Atlas account: `https://atlas.mongodb.com`
2. Create free cluster
3. Update `backend/server.js` to use MongoDB instead of SQLite
4. Add `MONGODB_URI` to `.env`

### Option 2: PostgreSQL

1. Use Vercel PostgreSQL or any provider
2. Update backend database driver
3. Add `DATABASE_URL` to `.env`

---

## Quick Checklist

- [ ] Backend deployed to Vercel (`fahamu-shamba-backend`)
- [ ] Frontend deployed to Vercel (`fahamu-shamba`)
- [ ] Frontend .env configured with backend URL
- [ ] Backend .env configured with allowed origins
- [ ] vercel.json in root with correct rewrites
- [ ] All API endpoints tested and returning data
- [ ] Landing page loads without 404
- [ ] Language selector works
- [ ] Dashboard loads after language selection
- [ ] Predictions API returns crop recommendations
- [ ] Market prices API working
- [ ] Database migrated to cloud (if needed)

---

## Need Help?

If you still get errors after these steps:

1. Check Vercel deployment logs:
   - Go to vercel.com → Project → Deployments → View logs

2. Check browser console for errors:
   - Open app in mobile/browser
   - Press F12 → Console tab
   - Look for network/API errors

3. Verify API connectivity:
   - Test backend URL directly in browser
   - Make sure CORS is enabled (should be in `server.js`)

---

## Files to Update Before Deployment

1. `backend/.env` → Set `NODE_ENV=production`
2. `frontend/.env` → Set backend API URL
3. `vercel.json` → Update build commands if needed
4. `backend/server.js` → Verify CORS allows your frontend domain

