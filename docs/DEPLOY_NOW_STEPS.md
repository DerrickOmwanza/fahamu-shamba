# Deploy Fahamu Shamba RIGHT NOW - Step by Step

## 🎯 Quick Summary of Your Problem

You deployed ONLY the frontend, but the backend (API) is NOT deployed.

- ✅ Frontend deployed
- ❌ Backend NOT deployed (still on your computer)
- ❌ Frontend can't reach backend API
- ❌ Getting 404 errors

---

## 🚀 IMMEDIATE ACTION - Do These Steps IN ORDER

### STEP 1: Clean Up (1 minute)

Open PowerShell and run:

```powershell
cd c:\Users\ADMIN\fahamu-shamba1-main
rm -r .vercel -Force
```

This removes the old Vercel configuration.

---

### STEP 2: Deploy Backend (5 minutes)

```powershell
cd c:\Users\ADMIN\fahamu-shamba1-main\backend
vercel --prod
```

**Answer these questions:**
- `Set up and deploy?` → Type: **yes**
- `Scope?` → Select: **Janganya Derrick**
- `Link to existing project?` → Type: **n** (NO)
- `Project name?` → Type: **fahamu-shamba-backend**
- `Directory?` → Press ENTER (default ./)
- `Modify settings?` → Type: **yes**

**Important: When asked about settings, enter:**
- Build Command: `npm install`
- Start Command: `node server.js` (if asked)

**Wait for deployment to finish. When done, you'll see:**
```
✓ Production: https://fahamu-shamba-backend.vercel.app
```

**Copy this URL and save it** - you'll need it next.

---

### STEP 3: Deploy Frontend (5 minutes)

```powershell
cd c:\Users\ADMIN\fahamu-shamba1-main
rm -r .vercel -Force
vercel --prod
```

**Answer these questions:**
- `Set up and deploy?` → Type: **yes**
- `Scope?` → Select: **Janganya Derrick**
- `Link to existing project?` → Type: **n** (NO)
- `Project name?` → Type: **fahamu-shamba-frontend**
- `Directory?` → Type: **./backend/public** or **./backend**
- `Modify settings?` → Type: **yes**

**When asked about settings:**
- Build Command: Leave EMPTY
- Start Command: `node server.js`

---

### STEP 4: Create vercel.json in Root (2 minutes)

Create file: `c:\Users\ADMIN\fahamu-shamba1-main\vercel.json`

Copy this content:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/backend/public/$1"
    }
  ]
}
```

---

### STEP 5: Update Backend Environment (1 minute)

Edit `backend/.env` and make sure it has:

```
NODE_ENV=production
PORT=3001
CORS_ORIGIN=*
```

---

### STEP 6: Test Everything (2 minutes)

**Test Backend API:**

Open browser and go to:
```
https://fahamu-shamba-backend.vercel.app/api/health
```

You should see:
```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2026-03-07T...",
  "service": "Fahamu Shamba API"
}
```

**Test Predictions:**

```
https://fahamu-shamba-backend.vercel.app/api/predict?subCounty=bondo&soilType=sandy&season=long_rains
```

Should return crop recommendation.

---

## ⚠️ IMPORTANT: Your Current Issue

The 404 error happens because:
1. Your frontend is deployed ✅
2. But backend is NOT deployed ❌
3. Frontend tries to call `/api/predict` but there's no backend to answer

Once you follow Steps 1-6 above, the frontend will connect to the backend and everything will work.

---

## 🔧 After Deployment - Browser Access

Once deployed, scan the QR code or visit:

```
https://fahamu-shamba-backend.vercel.app/
```

You should see:
1. **Landing Page** ✓
2. **Language Selector** ✓
3. **Go to Farmer Dashboard** button ✓
4. **Dashboard loads** ✓
5. **Can get predictions** ✓

---

## ❌ If Still Getting 404

Do this:

1. **Clear browser cache** - Press Ctrl+Shift+Del, clear all
2. **Verify backend is deployed** - Check vercel.com dashboard
3. **Check backend logs** - Go to vercel.com → fahamu-shamba-backend → Deployments → View
4. **Check network requests** - Open browser F12 → Network tab → click a button → see what URLs are being called

---

## 📋 Common Errors & Fixes

### Error: "Cannot find module better-sqlite3"
- **Cause:** SQLite doesn't work on Vercel (serverless)
- **Fix:** Migrate to MongoDB (see section below)

### Error: "CORS error" or "Access-Control-Allow-Origin"
- **Cause:** Backend CORS not configured correctly
- **Fix:** Edit `backend/server.js` line 35, change to:
  ```javascript
  origin: '*'  // Allow all origins for now
  ```

### Error: "Database file not found"
- **Cause:** Vercel doesn't persist files between deployments
- **Fix:** Move to cloud database (MongoDB/PostgreSQL)

---

## 🗄️ Database Fix (Important!)

SQLite (`fahamu_shamba.db`) won't work on Vercel because files don't persist.

### Quick Fix: Use MongoDB (Free)

1. Go to: `https://atlas.mongodb.com`
2. Create account
3. Create FREE cluster
4. Get connection string
5. Add to `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fahamu?retryWrites=true
   ```

6. Update `backend/server.js` to use MongoDB instead of better-sqlite3

OR ask me to help migrate the code.

---

## ✅ Success Checklist

After following all steps above, check:

- [ ] Backend deployed at https://fahamu-shamba-backend.vercel.app
- [ ] Frontend deployed at https://fahamu-shamba-frontend.vercel.app
- [ ] `/api/health` returns success
- [ ] `/api/predict` returns crop recommendations
- [ ] `/api/market/prices` returns prices
- [ ] Landing page loads without 404
- [ ] Language selector works
- [ ] Dashboard works
- [ ] Can submit predictions
- [ ] Market trends load

---

## 🎯 If You Want Database To Work

**Option 1: MongoDB (Easiest)**
1. Create free account at atlas.mongodb.com
2. Create cluster
3. Get connection URL
4. Add to `.env`
5. Update backend to use MongoDB instead of SQLite

**Option 2: Keep SQLite Locally**
1. Backend runs on your computer (not Vercel)
2. Frontend on Vercel connects to your computer
3. Works only while your computer is on and connected

**Option 3: Use Vercel PostgreSQL**
1. Create PostgreSQL database on Vercel
2. Update backend to use PostgreSQL
3. Add connection string to `.env`

---

## 💡 Pro Tips

1. **Always deploy backend first**, then frontend
2. **Test each API endpoint** before testing frontend
3. **Check Vercel logs** when something doesn't work
4. **Keep .env secrets private** - never commit to Git
5. **Monitor Vercel usage** - free tier has limits

---

## 📞 Need Help?

If something fails, check:

1. **Vercel Dashboard**: vercel.com → see deployment logs
2. **Browser Console**: F12 → Console → see JavaScript errors
3. **Network Tab**: F12 → Network → see API call failures
4. **Backend logs**: `vercel logs fahamu-shamba-backend --prod`

---

**Ready? Start with STEP 1 above!**

